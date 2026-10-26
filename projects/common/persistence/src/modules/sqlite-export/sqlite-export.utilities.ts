import { z } from "zod";

import { quotePostgresTable } from "../postgresql-utilities/postgresql-truncate.utilities";

import {
  SQLITE_EXPORT_COLUMNS_SQL,
  SQLITE_EXPORT_CURSOR,
  SQLITE_EXPORT_EXISTING_TABLES_SQL,
  SQLITE_EXPORT_FETCH_SIZE,
  SQLITE_EXPORT_ROW_SCHEMA,
  SQLITE_TYPE_MAPPINGS,
  SqliteExportColumnError,
  SqliteExportNameError,
} from "./sqlite-export.constants";

import type { PostgresQuery } from "../postgresql-utilities/postgresql-utilities.types";
import type {
  PostgresColumn,
  SqliteColumn,
  SqliteTable,
} from "./sqlite-export.types";
import type { DatabaseSync } from "node:sqlite";

// 🌎 Utilities

/**
 * The `CREATE TABLE` statement for `table`: each column with its mapped
 * storage class, `NOT NULL` where the source forbids null, and the
 * source's primary key.
 */
export function createSqliteTableSql({ columns, name }: SqliteTable): string {
  const definitions = columns.map(
    ({ mapping, name: column, nullable }) =>
      `${quoteIdentifier(column)} ${mapping.affinity}${nullable ? "" : " NOT NULL"}`,
  );
  const key = columns
    .flatMap(({ name: column, primaryKey }) =>
      primaryKey === null ? [] : [{ column, position: primaryKey }],
    )
    .toSorted((a, b) => a.position - b.position)
    .map(({ column }) => quoteIdentifier(column));
  if (key.length > 0) definitions.push(`PRIMARY KEY (${key.join(", ")})`);
  return `CREATE TABLE ${quoteIdentifier(name)} (${definitions.join(", ")})`;
}

/**
 * Inserts `rows`, as the Postgres driver returned them, into `table`,
 * converting each value to its SQLite type; a missing value is null.
 */
export function insertSqliteRows(
  database: DatabaseSync,
  { columns, name }: SqliteTable,
  rows: readonly Record<string, unknown>[],
): void {
  const names = columns.map((column) => quoteIdentifier(column.name));
  const placeholders = columns.map(() => "?");
  const statement = database.prepare(
    `INSERT INTO ${quoteIdentifier(name)} (${names.join(", ")}) VALUES (${placeholders.join(", ")})`,
  );
  for (const row of rows) {
    statement.run(
      ...columns.map(({ mapping, name: column }) => {
        const value = row[column];
        return value === null || value === undefined
          ? null
          : mapping.convert(value);
      }),
    );
  }
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
  const mapped: SqliteColumn[] = [];
  for (const column of columns) {
    const mapping = SQLITE_TYPE_MAPPINGS[column.type];
    if (mapping === undefined) {
      throw new SqliteExportColumnError(column.table, column.name, column.type);
    }
    mapped.push({ ...column, mapping });
  }
  return mapped;
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

/**
 * The rows of `table`, in batches of one fetch, read through a cursor so
 * the table is never held whole in memory. The caller owns the
 * transaction, so every table is read from one snapshot.
 */
export async function* readPostgresRows(
  query: PostgresQuery,
  { columns, table }: SqliteTable,
): AsyncGenerator<Record<string, unknown>[]> {
  const select = columns.map((column) => selectColumn(column)).join(", ");

  await query(
    `DECLARE ${SQLITE_EXPORT_CURSOR} NO SCROLL CURSOR FOR SELECT ${select} FROM ${quotePostgresTable(table)}`,
  );
  for (;;) {
    const rows = z
      .array(SQLITE_EXPORT_ROW_SCHEMA)
      .parse(
        await query(
          `FETCH ${String(SQLITE_EXPORT_FETCH_SIZE)} FROM ${SQLITE_EXPORT_CURSOR}`,
        ),
      );
    if (rows.length === 0) break;
    yield rows;
  }
  await query(`CLOSE ${SQLITE_EXPORT_CURSOR}`);
}

/**
 * Pairs each table of `columns` with its columns, mapped to SQLite types, and
 * the name it takes in the file: its name without its schema.
 *
 * @throws SqliteExportColumnError naming a column whose type has no
 * mapping, or SqliteExportNameError when two tables share a name.
 */
export function sqliteTables(
  columns: ReadonlyMap<string, readonly PostgresColumn[]>,
): SqliteTable[] {
  const described: SqliteTable[] = [];
  for (const [table, tableColumns] of columns) {
    described.push({
      columns: mapSqliteColumns(tableColumns),
      name: table.slice(table.indexOf(".") + 1),
      table,
    });
  }
  for (const { name } of described) {
    const sharing = described.filter((other) => other.name === name);
    if (sharing.length > 1) {
      throw new SqliteExportNameError(
        name,
        sharing.map(({ table }) => table),
      );
    }
  }
  return described;
}

/** `name` as a quoted SQL identifier, doubling any quote inside it. */
function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

/** The select-list entry that reads `column` as its mapping needs it. */
function selectColumn({ mapping, name }: SqliteColumn): string {
  const identifier = quoteIdentifier(name);
  if (mapping.cast === "json") return `to_json(${identifier}) AS ${identifier}`;
  if (mapping.cast === "text") return `${identifier}::text AS ${identifier}`;
  return identifier;
}
