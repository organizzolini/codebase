import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  adoptedMessage,
  CACHED_RESULTS_QUERY,
  COMPANION_SUFFIXES,
  corruptMessage,
  duplicateMessage,
  INTEGRITY_QUERY,
  NO_DATABASE_MESSAGE,
  NO_MACHINE_ID_MESSAGE,
  noSchemaMessage,
  SCHEMA_MARKER,
  UNKNOWN_ROWS,
} from "./task-database.constants";

import type { Environment } from "../../publication.types";
import type { AdoptionPlan, TaskDatabaseReport } from "./task-database.types";

/**
 * Looks after the Nx task-result database a CI job restores from its cache.
 *
 * Nx decides a cache hit from a row in this SQLite database alone, never from
 * `.nx/cache`. It names the file `<machine-id>-v<schema>.db` and keeps a
 * write-ahead log, shared-memory index, and rollback journal beside it, so
 * every operation treats those four files as one database.
 */
@Injectable()
export class TaskDatabaseService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** How many task results a database holds, as text. */
  private countCachedResults(database: string): string {
    const result = this.processRunner.capture("sqlite3", [
      database,
      CACHED_RESULTS_QUERY,
    ]);

    return result.status === 0 ? result.stdout.trim() : UNKNOWN_ROWS;
  }

  /** Where Nx keeps the database, honouring the override Nx itself reads. */
  private directory(): string {
    return this.configService.getOrThrow("NX_WORKSPACE_DATA_DIRECTORY", {
      infer: true,
    });
  }

  /** Removes one database together with its write-ahead log and the rest. */
  private discard(database: string): void {
    for (const suffix of ["", ...COMPANION_SUFFIXES]) {
      fs.rmSync(`${database}${suffix}`, { force: true });
    }
  }

  /** Discards every given database except the one to keep. */
  private discardOthers(kept: string, databases: readonly string[]): void {
    for (const database of databases) {
      if (database !== kept) {
        this.discard(database);
      }
    }
  }

  /** Lists every task database, in name order, and nothing when there is none. */
  private list(): string[] {
    const directory = this.directory();

    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((name) => name.endsWith(".db"))
      .toSorted()
      .map((name) => path.join(directory, name));
  }

  /**
   * Picks the most recently modified of the given databases. `actions/cache`
   * preserves modification times, so after a restore this is the one the last
   * job wrote. A later one wins only by being strictly newer, so a tie keeps
   * the earlier name.
   */
  private newest(databases: readonly string[]): string {
    return databases.reduce((newest, database) =>
      fs.statSync(database).mtimeMs > fs.statSync(newest).mtimeMs
        ? database
        : newest,
    );
  }
  /** Decides what adopting would do, or why it should do nothing. */
  private planAdoption(databases: readonly string[]): AdoptionPlan {
    if (databases.length === 0) {
      return { kind: "skip", line: NO_DATABASE_MESSAGE };
    }

    const machine = this.readMachineId();

    if (machine === "") {
      return { kind: "skip", line: NO_MACHINE_ID_MESSAGE };
    }

    const restored = this.newest(databases);
    const name = path.basename(restored);
    const schemaAt = name.lastIndexOf(SCHEMA_MARKER);

    if (schemaAt === -1) {
      return { kind: "skip", line: noSchemaMessage(name) };
    }

    return {
      adopted: path.join(this.directory(), `${machine}${name.slice(schemaAt)}`),
      kind: "adopt",
      restored,
    };
  }

  /** This machine's id, from the first readable, non-empty id file. */
  private readMachineId(): string {
    const files = this.configService
      .getOrThrow("MACHINE_ID_FILES", { infer: true })
      .split(/\s+/)
      .filter((file) => file !== "");

    for (const file of files) {
      try {
        const machine = fs.readFileSync(file, "utf8").replaceAll(/\s/g, "");

        if (machine !== "") {
          return machine;
        }
      } catch {
        // An id file that cannot be read is skipped for the next one.
      }
    }

    return "";
  }

  /** Moves a database and its companion files to a new name. */
  private rename(from: string, to: string): void {
    for (const suffix of ["", ...COMPANION_SUFFIXES]) {
      if (fs.existsSync(`${from}${suffix}`)) {
        fs.renameSync(`${from}${suffix}`, `${to}${suffix}`);
      }
    }
  }

  // 🌎 Public Methods

  /**
   * Renames the newest restored database to this machine's id, and discards
   * the rest.
   *
   * Every hosted runner is a fresh VM with a fresh machine id, so without this
   * Nx opened an empty database of its own beside the restored one and never
   * found a row. The schema suffix is kept as restored: a newer Nx ignores an
   * older schema rather than misreading it.
   */
  public adopt(): TaskDatabaseReport {
    const databases = this.list();
    const plan = this.planAdoption(databases);

    if (plan.kind === "skip") {
      return { lines: [plan.line] };
    }

    this.discardOthers(plan.restored, databases);
    if (plan.restored !== plan.adopted) {
      this.rename(plan.restored, plan.adopted);
    }

    return {
      lines: [
        adoptedMessage(
          path.basename(plan.restored),
          path.basename(plan.adopted),
          this.countCachedResults(plan.adopted),
        ),
      ],
    };
  }

  /**
   * Keeps only the newest database, warning when there was more than one.
   *
   * `adopt` renames the restored database to this machine's id, so Nx should
   * have written into that one file. A second database means Nx opened a name
   * of its own again, and every hit was lost, which deserves a warning rather
   * than a quiet return to zero hits.
   */
  public keep(): TaskDatabaseReport {
    const databases = this.list();

    if (databases.length <= 1) {
      return { lines: [] };
    }

    const newest = this.newest(databases);

    this.discardOthers(newest, databases);

    return {
      lines: [
        duplicateMessage(
          path.basename(newest),
          databases.map((database) => path.basename(database)),
        ),
      ],
    };
  }

  /**
   * Discards every database that fails `PRAGMA integrity_check`.
   *
   * A cancellation can hit mid-write, leaving a file whose own header claims
   * it is fine but whose pages are not. Nx fails outright querying such a
   * file, and saving one is worse than saving none: every later job's
   * `restore-keys` fallback inherits it. The whole database is discarded
   * rather than repaired in place.
   */
  public verify(): TaskDatabaseReport {
    const lines: string[] = [];

    for (const database of this.list()) {
      const answer = this.processRunner.capture("sqlite3", [
        database,
        INTEGRITY_QUERY,
      ]);
      const result = `${answer.stdout}${answer.stderr}`.trim();

      if (result !== "ok") {
        lines.push(corruptMessage(database, result));
        this.discard(database);
      }
    }

    return { lines };
  }
}
