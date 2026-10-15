import { DataSource } from "typeorm";

import { startPostgresContainer } from "@codebase/database/testing";
import { LEXICO_DATABASE_MIGRATIONS } from "@codebase/lexico-entities";

import type { PostgresConnection } from "@codebase/database";

/**
 * A throwaway Postgres 18 migrated with the real Lexico migrations.
 */
export interface LexicoDatabase {
  /** Closes the connection and stops the container. Safe to call once per start. */
  readonly close: () => Promise<void>;

  /** The Lexico role's connection: its role, database, and schema. */
  readonly connection: PostgresConnection;

  /**
   * The connection as the `LEXICO_POSTGRES_*` variables the CLI reads, for
   * the `env` of `runCliCommandLine`.
   */
  readonly environment: Readonly<Record<string, string>>;

  /**
   * Runs SQL as the Lexico role with `search_path` set to its schema, so an
   * unqualified table name resolves to `lexico.<table>`. Resolves the rows.
   */
  readonly query: <Row extends object = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ) => Promise<Row[]>;

  /** A `postgresql://` URI with the role's password, for a `--uri` option. */
  readonly uri: string;
}

/**
 * A test or hook that runs the CLI, client tools, or queries against a
 * container: a second or two locally, several times that on a CI runner.
 */
export const INTEGRATION_TEST_TIMEOUT_MILLISECONDS = 60_000;

/** Starting Postgres and running every migration takes longer than a test. */
export const LEXICO_DATABASE_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Starts a throwaway Postgres 18 container and builds the Lexico schema by
 * running the real migrations, so a test seeds and reads real tables.
 *
 * ```ts
 * const database = await startLexicoDatabase();
 * await database.query("INSERT INTO authors (name, slug) VALUES ($1, $2)", [
 *   "Vergil",
 *   "vergil",
 * ]);
 * await database.close();
 * ```
 */
export async function startLexicoDatabase(): Promise<LexicoDatabase> {
  const container = await startPostgresContainer({
    migrations: [...LEXICO_DATABASE_MIGRATIONS],
    project: "lexico",
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
    environment: container.environment,
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

/** The connection as a URI, its credentials percent-encoded. */
function postgresUri(connection: PostgresConnection): string {
  const { database, host, password, port, username } = connection;
  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}
