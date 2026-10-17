import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  adoptedMessage,
  ATTACH_QUERY,
  CACHED_RESULTS_QUERY,
  COMPANION_SUFFIXES,
  CORRUPT_REASON,
  corruptMessage,
  duplicateMessage,
  INTEGRITY_QUERY,
  MERGE_ROWS_QUERY,
  MERGED_TABLES,
  mergedMessage,
  NO_CACHE_DIRECTORY_REASON,
  NO_DATABASE_MESSAGE,
  NO_MACHINE_ID_MESSAGE,
  NO_TASK_DATABASE_REASON,
  noSchemaMessage,
  nothingToMergeIntoMessage,
  notMergingMessage,
  SCHEMA_MARKER,
  schemaMismatchReason,
  TABLES_QUERY,
  UNFAMILIAR_SCHEMA_REASON,
  UNKNOWN_ROWS,
} from "./task-database.constants";
import { schemaOf } from "./task-database.utilities";

import type { Environment } from "../../publication.types";
import type {
  AdoptionPlan,
  MergePlan,
  MergeSource,
  TaskDatabaseReport,
} from "./task-database.types";

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

  constructor(private readonly configService: ConfigService<Environment>) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Takes another run's cache whole, for want of a database to merge into,
   * and says so.
   */
  private adoptSource(source: string, incoming: string): string {
    fs.cpSync(path.join(source, "cache"), this.cacheDirectory(), {
      recursive: true,
    });
    fs.copyFileSync(
      incoming,
      path.join(this.directory(), path.basename(incoming)),
    );

    return nothingToMergeIntoMessage(source);
  }

  /** Where Nx keeps task outputs, honouring the override Nx itself reads. */
  private cacheDirectory(): string {
    return this.configService.getOrThrow("NX_CACHE_DIRECTORY", {
      infer: true,
    });
  }

  /** Finds the database a source would be merged from, or why it cannot be. */
  private checkSource(source: string): MergeSource {
    if (
      !fs
        .statSync(path.join(source, "cache"), { throwIfNoEntry: false })
        ?.isDirectory()
    ) {
      return { kind: "skip", reason: NO_CACHE_DIRECTORY_REASON };
    }

    const sources = this.list(path.join(source, "workspace-data"));

    if (sources.length === 0) {
      return { kind: "skip", reason: NO_TASK_DATABASE_REASON };
    }

    const incoming = this.newest(sources);

    if (this.integrityOf(incoming) !== "ok") {
      return { kind: "skip", reason: CORRUPT_REASON };
    }

    const tables = new Set(this.query(incoming, TABLES_QUERY));

    return MERGED_TABLES.every((table) => tables.has(table))
      ? { database: incoming, kind: "source" }
      : { kind: "skip", reason: UNFAMILIAR_SCHEMA_REASON };
  }

  /**
   * Copies every output file the source has and this cache lacks, keeping its
   * modification time. A file this cache already has wins.
   */
  private copyMissingOutputs(from: string, to: string): void {
    const entries = fs.readdirSync(from, {
      recursive: true,
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const file = path.join(entry.parentPath, entry.name);
      const destination = path.join(to, path.relative(from, file));

      if (!fs.existsSync(destination)) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.cpSync(file, destination, { preserveTimestamps: true });
      }
    }
  }

  /** How many task results a database holds, as text. */
  private countCachedResults(database: string): string {
    try {
      return this.query(database, CACHED_RESULTS_QUERY).join("\n");
    } catch {
      return UNKNOWN_ROWS;
    }
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

  /** Inserts the rows of one database the other lacks, in one transaction. */
  private insertRows(target: string, incoming: string): void {
    // As the `sqlite3` binary does, and unlike `node:sqlite`'s default.
    const connection = new DatabaseSync(target, {
      enableForeignKeyConstraints: false,
    });

    try {
      connection.prepare(ATTACH_QUERY).run(incoming);
      connection.exec(MERGE_ROWS_QUERY);
    } catch (error) {
      if (connection.isTransaction) {
        connection.exec("ROLLBACK;");
      }

      throw error;
    } finally {
      connection.close();
    }
  }

  /**
   * Answers what SQLite itself says of a database: `ok` for a sound one, the
   * problems found for a damaged one, or why it could not be opened at all.
   */
  private integrityOf(database: string): string {
    try {
      return this.query(database, INTEGRITY_QUERY).join("\n");
    } catch (error) {
      return String(error);
    }
  }

  /**
   * Lists every task database in a directory, this cache's by default, in
   * name order, and nothing when there is none.
   */
  private list(directory = this.directory()): string[] {
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
   * Copies the outputs this cache lacks, then inserts the rows it lacks, and
   * reports how many results that added. Outputs go first: a row without its
   * files restores nothing yet reports a hit, while files without a row are
   * an ordinary miss.
   */
  private mergeRows(source: string, incoming: string, target: string): string {
    const before = Number(this.query(target, CACHED_RESULTS_QUERY)[0]);

    this.copyMissingOutputs(path.join(source, "cache"), this.cacheDirectory());
    this.insertRows(target, incoming);

    const after = Number(this.query(target, CACHED_RESULTS_QUERY)[0]);

    return mergedMessage(after - before, before);
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

  /** Decides where a source's database goes: into which database, if any. */
  private planMerge(incoming: string): MergePlan {
    fs.mkdirSync(this.cacheDirectory(), { recursive: true });
    fs.mkdirSync(this.directory(), { recursive: true });

    const existing = this.list();

    if (existing.length === 0) {
      return { kind: "adopt" };
    }

    const target = this.newest(existing);

    return schemaOf(incoming) === schemaOf(target)
      ? { kind: "merge", target }
      : {
          kind: "skip",
          reason: schemaMismatchReason(schemaOf(incoming), schemaOf(target)),
        };
  }

  /** Runs one query, and returns the first column of every row as text. */
  private query(database: string, sql: string): string[] {
    const connection = new DatabaseSync(database);

    try {
      const values: string[] = [];

      for (const row of connection.prepare(sql).all()) {
        values.push(String(Object.values(row)[0]));
      }

      return values;
    } finally {
      connection.close();
    }
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
   * Merges another run's Nx cache into this one, so the tasks that run
   * already finished are hits here too. The source holds `cache/` and
   * `workspace-data/` as `.nx` lays them out. Entries this cache already has
   * win, and the merge is skipped with a warning, never failed, when anything
   * goes wrong: the caller would rather run cold than stop.
   */
  public merge(source: string): TaskDatabaseReport {
    try {
      const checked = this.checkSource(source);

      if (checked.kind === "skip") {
        return { lines: [notMergingMessage(source, checked.reason)] };
      }

      const plan = this.planMerge(checked.database);

      if (plan.kind === "skip") {
        return { lines: [notMergingMessage(source, plan.reason)] };
      }

      return {
        lines: [
          plan.kind === "adopt"
            ? this.adoptSource(source, checked.database)
            : this.mergeRows(source, checked.database, plan.target),
        ],
      };
    } catch (error) {
      return { lines: [notMergingMessage(source, String(error))] };
    }
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
      const result = this.integrityOf(database);

      if (result !== "ok") {
        lines.push(corruptMessage(database, result));
        this.discard(database);
      }
    }

    return { lines };
  }
}
