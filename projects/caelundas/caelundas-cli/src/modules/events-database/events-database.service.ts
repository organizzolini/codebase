import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createSqliteDataSource } from "@codebase/persistence";

import {
  DATABASE_ENTITIES,
  DATABASE_PROJECT,
} from "../database/database.constants";
import { Migration1793045891250 } from "../database/migrations/1793045891250-migration";

import {
  EVENTS_DATABASE_DEFAULT_OUTPUT,
  EVENTS_DATABASE_SEED_FILE,
  EVENTS_DATABASE_VIEWS_FILE,
  EventsDatabaseOptionsError,
} from "./events-database.constants";

import type {
  EventsDatabaseBuild,
  EventsDatabaseCommandOptions,
} from "./events-database.types";

/**
 * Writes the SQLite file caelundas-web bundles. It starts from the database
 * a run ingested into, or from the committed seed rows in a database the
 * initial migration creates, then derives the tables the web application
 * reads over it, so the web schema is the migration's, never a copy.
 *
 * The file is built beside the output and replaces it only once complete, so
 * a failed build leaves the last good file in place rather than half of one.
 */
@Injectable()
export class EventsDatabaseService {
  // 🏗 Dependency Injection

  constructor(private readonly configurationService: ConfigService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs the SQL files over the database, in order, then vacuums: the browser
   * downloads the file whole, so the space the copied file and the derived
   * tables left behind is reclaimed.
   */
  private applySql(file: string, sqlFiles: readonly string[]): void {
    const database = new DatabaseSync(file);

    try {
      for (const sqlFile of sqlFiles) {
        database.exec(readFileSync(sqlFile, "utf8"));
      }
      database.exec("vacuum");
    } finally {
      database.close();
    }
  }

  /** Creates `file` with the migration's tables, empty. */
  private async createTables(file: string): Promise<void> {
    const dataSource = createSqliteDataSource(
      {
        entities: DATABASE_ENTITIES,
        migrations: [Migration1793045891250],
        project: DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: file },
    );

    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
  }

  /**
   * Resolves the command line to a build: the paths absolute, and the source
   * left out for the seed.
   *
   * @throws EventsDatabaseOptionsError when `--seed` and `--source` are both given.
   */
  private resolveBuild(
    options: EventsDatabaseCommandOptions,
  ): EventsDatabaseBuild {
    if (options.seed === true && options.source !== undefined) {
      throw new EventsDatabaseOptionsError(
        "--seed builds from the committed rows, so it takes no --source",
      );
    }

    const output = path.resolve(
      options.output ?? EVENTS_DATABASE_DEFAULT_OUTPUT,
    );

    if (options.seed === true) {
      return { output };
    }

    return {
      output,
      source: path.resolve(
        options.source ??
          this.configurationService.getOrThrow<string>(
            "CAELUNDAS_SQLITE_DATABASE",
          ),
      ),
    };
  }

  // 🌎 Public Methods

  /**
   * Builds the bundle, from the seed or from the ingested database, and
   * returns the file it wrote.
   *
   * @throws EventsDatabaseOptionsError when the options contradict each other
   * or the source does not exist.
   */
  async build(options: EventsDatabaseCommandOptions): Promise<string> {
    const { output, source } = this.resolveBuild(options);

    if (source !== undefined && !existsSync(source)) {
      throw new EventsDatabaseOptionsError(
        `${source} does not exist: run \`nx run caelundas-cli:start\` to ingest events into it, or build from the seed with --seed`,
      );
    }

    const partial = `${output}.partial`;
    mkdirSync(path.dirname(output), { recursive: true });
    rmSync(partial, { force: true });

    try {
      if (source === undefined) {
        await this.createTables(partial);
        this.applySql(partial, [
          EVENTS_DATABASE_SEED_FILE,
          EVENTS_DATABASE_VIEWS_FILE,
        ]);
      } else {
        copyFileSync(source, partial);
        this.applySql(partial, [EVENTS_DATABASE_VIEWS_FILE]);
      }
      renameSync(partial, output);
    } catch (error) {
      rmSync(partial, { force: true });
      throw error;
    }

    return output;
  }
}
