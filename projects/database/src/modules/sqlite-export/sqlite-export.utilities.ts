import { DatabaseSync } from "node:sqlite";

import { z } from "zod";

import {
  SQLITE_EXPORT_COLUMNS_SQL,
  SQLITE_EXPORT_EXISTING_TABLES_SQL,
  SQLITE_TYPE_MAPPINGS,
  SqliteExportColumnError,
} from "./sqlite-export.constants";

import type { PostgresQuery } from "../postgres-client/postgres-client.types";
import type { PostgresColumn, SqliteColumn } from "./sqlite-export.types";

// 🌎 Utilities

/** Creates an empty SQLite database at `file`, which must not exist. */
export function createSqliteFile(file: string): void {
  const database = new DatabaseSync(file);
  database.close();
}

/**
 * Maps every column of `columns` to the SQLite type its values are stored
 * as, in the order given.
 *
 * @throws SqliteExportColumnError naming the first column whose Postgres
 * type has no mapping.
 */
export function mapSqliteColumns(
  columns: readonly PostgresColumn[],
): SqliteColumn[] {
  return columns.map((column) => {
    const mapping = SQLITE_TYPE_MAPPINGS[column.type];
    if (mapping === undefined) {
      throw new SqliteExportColumnError(column.table, column.name, column.type);
    }
    return { ...column, mapping };
  });
}

/**
 * The schema-qualified `tables` that do not exist in the database `query`
 * reaches, in the order given.
 */
export async function missingPostgresTables(
  query: PostgresQuery,
  tables: readonly string[],
): Promise<string[]> {
  const found = z
    .array(z.object({ table: z.string() }))
    .parse(await query(SQLITE_EXPORT_EXISTING_TABLES_SQL, [tables]));
  const existing = new Set(found.map(({ table }) => table));
  return tables.filter((table) => !existing.has(table));
}

/**
 * The columns of `tables` in the database `query` reaches, grouped by
 * table in the order given, each in column order.
 */
export async function postgresColumns(
  query: PostgresQuery,
  tables: readonly string[],
): Promise<Map<string, PostgresColumn[]>> {
  const rows = z
    .array(
      z.object({
        name: z.string(),
        nullable: z.boolean(),
        primaryKey: z.number().nullable(),
        table: z.string(),
        type: z.string(),
      }),
    )
    .parse(await query(SQLITE_EXPORT_COLUMNS_SQL, [tables]));
  const grouped = new Map<string, PostgresColumn[]>(
    tables.map((table) => [table, []]),
  );
  for (const row of rows) grouped.get(row.table)?.push(row);
  return grouped;
}
