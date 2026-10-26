import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { createEventsDatabase } from "../src/lib/events-database/events-database";

import type {
  EventsDatabase,
  SqlExecutor,
  SqlRow,
  SqlValue,
} from "../src/lib/events-database/events-database.types";

const DATA_DIRECTORY = path.join(import.meta.dirname, "../data");

/**
 * Which of the committed SQL files build a test's database.
 */
export interface TestEventsDatabaseOptions {
  /**
   * Leaves the seed rows out, so the tables exist but hold nothing.
   */
  empty?: boolean;
}

/**
 * Builds an in-memory database from the committed SQL text, in the order the
 * build applies it, and returns the events database the routes read.
 */
export function createTestEventsDatabase(
  options: TestEventsDatabaseOptions = {},
): EventsDatabase {
  const database = new DatabaseSync(":memory:");
  const fileNames = options.empty
    ? ["events-schema.sql", "events-views.sql"]
    : ["events-schema.sql", "events-seed.sql", "events-views.sql"];

  for (const fileName of fileNames) {
    database.exec(readFileSync(path.join(DATA_DIRECTORY, fileName), "utf8"));
  }

  return createEventsDatabase(createNodeSqliteExecutor(database));
}

/**
 * Runs selects against a `node:sqlite` database, the way the browser's worker
 * runs them against sqlite-wasm.
 */
function createNodeSqliteExecutor(database: DatabaseSync): SqlExecutor {
  return {
    // `node:sqlite` answers synchronously; the promise keeps the contract the
    // worker's asynchronous answers set.
    async select(sql: string, parameters: readonly SqlValue[]) {
      return new Promise<SqlRow[]>((resolve) => {
        resolve(database.prepare(sql).all(...parameters));
      });
    },
  };
}
