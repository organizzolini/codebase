import { DataSource } from "typeorm";

import { startPostgresContainer } from "../src/modules/postgresql/postgresql-container.utilities";

import { CreateWidgets1767225600000 } from "./fixtures/migrations/1767225600000-create-widgets";
import { CreateParts1767225600001 } from "./fixtures/migrations/1767225600001-create-parts";

import type { PostgresConnection } from "../src/modules/postgresql/postgresql.types";

/**
 * A throwaway Postgres 18 holding the `fixture` schema's `widgets` and
 * their child `parts`, for the export and import suites.
 */
export interface FixtureDatabase {
  /** Closes the connection and stops the container. Safe to call once per start. */
  readonly close: () => Promise<void>;

  /** The fixture role's connection: its role, database, and schema. */
  readonly connection: PostgresConnection;

  /**
   * Runs SQL as the fixture role with `search_path` set to its schema, so
   * an unqualified table name resolves to `fixture.<table>`. Resolves the
   * rows.
   */
  readonly query: <Row extends object = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ) => Promise<Row[]>;

  /** A `postgresql://` URI with the role's password, for a `--*-uri` option. */
  readonly uri: string;
}

/**
 * A test or hook that runs the command line, client tools, or queries
 * against a container: a second or two locally, several times that on a
 * CI runner.
 */
export const INTEGRATION_TEST_TIMEOUT_MILLISECONDS = 60_000;

/** Starting Postgres and running the migrations takes longer than a test. */
export const FIXTURE_DATABASE_TIMEOUT_MILLISECONDS = 120_000;

/** The connection as a URI, its credentials percent-encoded. */
export function postgresUri(connection: PostgresConnection): string {
  const { database, host, password, port, username } = connection;
  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${String(port)}/${encodeURIComponent(database)}`;
}

/**
 * Starts a throwaway Postgres 18 container and builds the `fixture` schema
 * by running the fixture migrations, so a test seeds and reads real tables.
 *
 * ```ts
 * const database = await startFixtureDatabase();
 * await database.query("INSERT INTO widgets (display_name) VALUES ($1)", [
 *   "sprocket",
 * ]);
 * await database.close();
 * ```
 */
export async function startFixtureDatabase(): Promise<FixtureDatabase> {
  const container = await startPostgresContainer({
    migrations: [CreateWidgets1767225600000, CreateParts1767225600001],
    project: "fixture",
  });
  const { connection } = container;
  const dataSource = new DataSource({
    database: connection.database,
    extra: { options: `-c search_path=${connection.schema}` },
    host: connection.host,
    password: connection.password,
    port: connection.port,
    type: "postgres",
    username: connection.username,
  });

  try {
    await dataSource.initialize();
  } catch (error) {
    await container.stop();
    throw error;
  }

  return {
    close: async (): Promise<void> => {
      try {
        await dataSource.destroy();
      } finally {
        await container.stop();
      }
    },
    connection,
    query: async <Row extends object = Record<string, unknown>>(
      sql: string,
      values: readonly unknown[] = [],
    ): Promise<Row[]> => {
      const rows: Row[] = await dataSource.query(sql, [...values]);
      return rows;
    },
    uri: postgresUri(connection),
  };
}
