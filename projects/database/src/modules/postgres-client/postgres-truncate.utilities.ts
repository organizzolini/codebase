import {
  POSTGRES_FEATURE_NOT_SUPPORTED,
  POSTGRES_REFERENCING_TABLES_SCHEMA,
  POSTGRES_REFERENCING_TABLES_SQL,
  PostgresReferencedTablesError,
} from "./postgres-client.constants";

import type { PostgresQuery } from "./postgres-client.types";

// 🌎 Utilities

/**
 * Quotes a schema-qualified `table` as `"schema"."table"`, doubling any
 * quote inside either part. The first dot separates the two.
 */
export function quotePostgresTable(table: string): string {
  const dot = table.indexOf(".");
  return [table.slice(0, dot), table.slice(dot + 1)]
    .map((part) => `"${part.replaceAll('"', '""')}"`)
    .join(".");
}

/**
 * Empties exactly `tables` with one `TRUNCATE` and no `CASCADE`, so
 * Postgres refuses, truncating nothing, when a table outside them
 * references one of them. That refusal is explained from the catalog.
 *
 * @throws PostgresReferencedTablesError naming the referencing tables to
 * add; any other failure is rethrown as it was.
 */
export async function truncatePostgresTables(
  query: PostgresQuery,
  tables: readonly string[],
): Promise<void> {
  const quoted = tables.map((table) => quotePostgresTable(table));

  try {
    await query(`TRUNCATE TABLE ${quoted.join(", ")}`);
  } catch (error) {
    if (postgresErrorCode(error) !== POSTGRES_FEATURE_NOT_SUPPORTED) {
      throw error;
    }

    const referencing = POSTGRES_REFERENCING_TABLES_SCHEMA.parse(
      await query(POSTGRES_REFERENCING_TABLES_SQL, [quoted]),
    ).map(({ table }) => table);
    if (referencing.length === 0) throw error;
    throw new PostgresReferencedTablesError(referencing);
  }
}

/**
 * The Postgres error code `error` carries. A TypeORM `QueryFailedError`
 * copies it from the driver's error onto itself.
 */
function postgresErrorCode(error: unknown): string | undefined {
  return error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : undefined;
}
