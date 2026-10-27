import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { listLocalTimeFunctions } from "../src/utilities/events-database-local-time.utilities";
import { createEventsDatabase } from "../src/utilities/events-database.utilities";

import type {
  EventsDatabase,
  EventsQuery,
  SqlExecutor,
  SqlRow,
  SqlValue,
} from "../src/types/events-database.types";

// The database belongs to caelundas-cli: its tables are what its migration
// creates, and its seed rows and the SQL that rewrites its read model are its
// data files. They
// are read, never copied, so the web application's tests cannot drift from it.
const CLI_ROOT = path.join(import.meta.dirname, "../../caelundas-cli");
const DATA_DIRECTORY = path.join(CLI_ROOT, "data");
const MIGRATIONS_DIRECTORY = path.join(
  CLI_ROOT,
  "src/modules/database/migrations",
);

/**
 * Which of the committed SQL files build a test's database.
 */
export interface TestEventsDatabaseOptions {
  /**
   * Leaves the seed rows out, so the tables exist but hold nothing.
   */
  empty?: boolean;
  /**
   * More SQL run after the seed and before the read-model SQL, such as rows
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
      findFacets: async (window) =>
        failing ? Promise.reject(error) : seeded.findFacets(window),
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
      findFacets: async (window) => seeded.findFacets(window),
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
  database.exec(readTablesSql());

  if (options.empty !== true) {
    database.exec(
      readFileSync(path.join(DATA_DIRECTORY, "events-seed.sql"), "utf8"),
    );
  }

  // Extra rows go in with the seed, before the read-model SQL derives its
  // tables from them, as a run's rows would.
  if (options.extraSql !== undefined) {
    database.exec(options.extraSql);
  }

  database.exec(
    readFileSync(path.join(DATA_DIRECTORY, "events-read-model.sql"), "utf8"),
  );

  registerLocalTimeFunctions(database);

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

/**
 * The SQL that creates the tables and the read model: every migration's
 * generated `-up.sql`, in order.
 */
function readTablesSql(): string {
  return readdirSync(MIGRATIONS_DIRECTORY)
    .filter((name) => name.endsWith("-up.sql"))
    .toSorted()
    .map((name) => readFileSync(path.join(MIGRATIONS_DIRECTORY, name), "utf8"))
    .join("\n");
}

/**
 * Gives the database the local-time functions the browser's worker registers.
 */
function registerLocalTimeFunctions(database: DatabaseSync): void {
  for (const [name, localTime] of Object.entries(listLocalTimeFunctions())) {
    database.function(name, { deterministic: true }, localTime);
  }
}
