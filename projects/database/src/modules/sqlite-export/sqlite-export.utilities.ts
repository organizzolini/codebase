import { DatabaseSync } from "node:sqlite";

import { z } from "zod";

import { SQLITE_EXPORT_EXISTING_TABLES_SQL } from "./sqlite-export.constants";

import type { PostgresQuery } from "../postgres-client/postgres-client.types";

// 🌎 Utilities

/** Creates an empty SQLite database at `file`, which must not exist. */
export function createSqliteFile(file: string): void {
  const database = new DatabaseSync(file);
  database.close();
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
