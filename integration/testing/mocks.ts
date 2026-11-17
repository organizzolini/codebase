import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/** Workspaces go in this project, never the OS temp directory. */
export const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** A task-database directory under `.nx`, for a test to fill. */
export interface TaskDatabaseWorkspace {
  /** Writes one file that is not a database, and the companions named by suffix. */
  add: (name: string, ageSeconds: number, companions?: string[]) => void;
  /** Writes a real SQLite database holding this many cached task results. */
  addDatabase: (name: string, ageSeconds: number, rows: number) => void;
  /** Removes the whole workspace. */
  cleanup: () => void;
  /** Overwrites the middle of a real database, so its header still reads fine. */
  damage: (name: string) => void;
  /** The absolute directory of databases the commands are pointed at. */
  directory: string;
  /** Every file in the directory, by name. */
  names: () => string[];
  /** The text of one file in the directory. */
  read: (name: string) => string;
  /** Writes a file beside the database directory, and returns its path. */
  writeBeside: (name: string, text: string) => string;
}

/** Makes an empty task-database directory in the workspace. */
export function createTaskDatabaseWorkspace(): TaskDatabaseWorkspace {
  const parent = path.resolve(import.meta.dirname, "../../../.nx");

  fs.mkdirSync(parent, { recursive: true });

  const root = fs.mkdtempSync(path.join(parent, "integration-test-"));
  const directory = path.join(root, "workspace-data");

  fs.mkdirSync(directory);

  return {
    add: (name, ageSeconds, companions = []) => {
      const when = new Date(Date.now() - ageSeconds * 1000);

      for (const suffix of ["", ...companions]) {
        const file = path.join(directory, `${name}${suffix}`);

        fs.writeFileSync(file, `${name}${suffix}`);
        fs.utimesSync(file, when, when);
      }
    },
    addDatabase: (name, ageSeconds, rows) => {
      const file = path.join(directory, name);
      const connection = new DatabaseSync(file);

      connection.exec("CREATE TABLE cache_outputs (hash TEXT, payload TEXT)");
      for (let row = 0; row < rows; row += 1) {
        connection
          .prepare("INSERT INTO cache_outputs VALUES (?, ?)")
          .run(`hash-${row}`, "x".repeat(200));
      }
      connection.close();

      const when = new Date(Date.now() - ageSeconds * 1000);

      fs.utimesSync(file, when, when);
    },
    cleanup: () => {
      fs.rmSync(root, { force: true, recursive: true });
    },
    damage: (name) => {
      const file = path.join(directory, name);
      const bytes = fs.readFileSync(file);

      bytes.fill(0xff, 4096, bytes.length);
      fs.writeFileSync(file, bytes);
    },
    directory,
    names: () => fs.readdirSync(directory).toSorted(),
    read: (name) => fs.readFileSync(path.join(directory, name), "utf8"),
    writeBeside: (name, text) => {
      const file = path.join(root, name);

      fs.writeFileSync(file, text);

      return file;
    },
  };
}

/** The hashes of every cached result a task database holds, sorted. */
export function readCachedHashes(file: string): string[] {
  const connection = new DatabaseSync(file);

  try {
    return connection
      .prepare("SELECT hash FROM cache_outputs ORDER BY hash")
      .all()
      .map((row) => String(row["hash"]));
  } finally {
    connection.close();
  }
}

/**
 * Writes a real Nx task database at `file`, holding one task and one cached
 * result per hash, with the foreign key Nx uses.
 */
export function writeTaskDatabase(
  file: string,
  hashes: readonly string[],
): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const connection = new DatabaseSync(file);

  connection.exec(`
    CREATE TABLE task_details (hash TEXT PRIMARY KEY NOT NULL, project TEXT NOT NULL, target TEXT NOT NULL, configuration TEXT);
    CREATE TABLE cache_outputs (hash TEXT PRIMARY KEY NOT NULL, code INTEGER NOT NULL, size INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (hash) REFERENCES task_details (hash));
  `);
  for (const hash of hashes) {
    connection
      .prepare("INSERT INTO task_details VALUES (?, 'project', 'target', NULL)")
      .run(hash);
    connection
      .prepare("INSERT INTO cache_outputs (hash, code, size) VALUES (?, 0, 1)")
      .run(hash);
  }
  connection.close();
}
