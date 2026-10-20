import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { createEventsDatabase } from "../src/lib/events-database/events-database";
import { LOCAL_TIME_FUNCTIONS } from "../src/lib/events-database/events-database.local-time";

import type {
  EventsDatabase,
  EventsQuery,
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
   * More SQL run after the seed and before the post-export SQL, such as rows
   * for a dimension the seed lacks.
   */
  extraSql?: string;
}

/**
 * SQL for a run of instant events in the seed's zone, `count` of them a
 * minute apart from a UTC instant, named "Busy Event 1" onward.
 */
export function createBusyEventsSql(start: string, count: number): string {
  const first = new Date(start).getTime();
  const rows = Array.from({ length: count }, (_, index) => {
    const at = new Date(first + index * 60_000).toISOString();

    return `('event-busy-${String(index + 1)}', '${at}', '${at}', null, 'A busy moment', '${at}', 40.7128, 'New York, NY', -74.006, '${at}', 'Busy Event ${String(index + 1)}', 'America/New_York')`;
  });

  return `insert into calendar_events (id, created_at, updated_at, color, description, "end", latitude, "location", longitude, "start", "summary", timezone) values ${rows.join(", ")};`;
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
 * The seeded database, recording every events query it answers, and
 * answering every one after the first only after a delay when one is given,
 * the way a slow worker would.
 */
export function createRecordingEventsDatabase(delay = 0): {
  database: EventsDatabase;
  queries: EventsQuery[];
} {
  const seeded = createTestEventsDatabase();
  const queries: EventsQuery[] = [];

  return {
    database: {
      describeDataset: async () => seeded.describeDataset(),
      findEvents: async (query) => {
        queries.push(query);

        if (queries.length > 1 && delay > 0) {
          await new Promise((resolve) => {
            setTimeout(resolve, delay);
          });
        }

        return seeded.findEvents(query);
      },
      findFacets: async () => seeded.findFacets(),
    },
    queries,
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
    ? ["events-schema.sql"]
    : ["events-schema.sql", "events-seed.sql"];

  for (const fileName of fileNames) {
    database.exec(readFileSync(path.join(DATA_DIRECTORY, fileName), "utf8"));
  }

  // Extra rows go in with the seed, before the post-export SQL derives its
  // tables from them, as the export's rows would.
  if (options.extraSql !== undefined) {
    database.exec(options.extraSql);
  }

  database.exec(
    readFileSync(path.join(DATA_DIRECTORY, "events-views.sql"), "utf8"),
  );

  registerLocalTimeFunctions(database);

  return createNodeSqliteExecutor(database);
}

/**
 * Opens a built SQLite file read-only, the way the browser's worker opens the
 * file the build bundles, and returns the events database over it.
 */
export function openTestEventsDatabase(file: string): EventsDatabase {
  const database = new DatabaseSync(file, { readOnly: true });

  registerLocalTimeFunctions(database);

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

/**
 * Gives the database the local-time functions the browser's worker registers.
 */
function registerLocalTimeFunctions(database: DatabaseSync): void {
  for (const [name, localTime] of Object.entries(LOCAL_TIME_FUNCTIONS)) {
    database.function(name, { deterministic: true }, localTime);
  }
}
