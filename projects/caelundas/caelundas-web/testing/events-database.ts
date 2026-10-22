import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { createEventsDatabase } from "../src/lib/events-database/events-database";
import { LOCAL_TIME_FUNCTIONS } from "../src/lib/events-database/events-database.local-time";

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
  /**
   * More SQL run after the seed, such as rows for a dimension the seed lacks.
   */
  extraSql?: string;
}

/**
 * A database whose every read fails with the error given, until `recover`
 * hands reads back to the seeded database.
 */
export function createFailingEventsDatabase(error: Error): {
  database: EventsDatabase;
  recover: () => void;
} {
  const seeded = createTestEventsDatabase();
  let failing = true;

  return {
    database: {
      describeDataset: async () =>
        failing ? Promise.reject(error) : seeded.describeDataset(),
      findEvents: async (query) =>
        failing ? Promise.reject(error) : seeded.findEvents(query),
      findFacets: async () =>
        failing ? Promise.reject(error) : seeded.findFacets(),
    },
    recover: () => {
      failing = false;
    },
  };
}

/**
 * Builds an in-memory database from the committed SQL text, in the order the
 * build applies it, and returns the events database the routes read.
 */
export function createTestEventsDatabase(
  options: TestEventsDatabaseOptions = {},
): EventsDatabase {
  return createEventsDatabase(createTestSqlExecutor(options));
}

/**
 * Builds the same in-memory database and returns the bare executor over it,
 * for a test that runs SQL of its own, such as a compiled filter.
 */
export function createTestSqlExecutor(
  options: TestEventsDatabaseOptions = {},
): SqlExecutor {
  const database = new DatabaseSync(":memory:");
  const fileNames = options.empty
    ? ["events-schema.sql", "events-views.sql"]
    : ["events-schema.sql", "events-seed.sql", "events-views.sql"];

  for (const fileName of fileNames) {
    database.exec(readFileSync(path.join(DATA_DIRECTORY, fileName), "utf8"));
  }

  if (options.extraSql !== undefined) {
    database.exec(options.extraSql);
  }

  for (const [name, localTime] of Object.entries(LOCAL_TIME_FUNCTIONS)) {
    database.function(name, { deterministic: true }, localTime);
  }

  return createNodeSqliteExecutor(database);
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
