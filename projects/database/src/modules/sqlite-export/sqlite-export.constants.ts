// ♟️ Constants

import { z } from "zod";

import type { SqliteTypeMapping } from "./sqlite-export.types";

/** Which of the `$1` schema-qualified names are tables, as `schema.table`. */
export const SQLITE_EXPORT_EXISTING_TABLES_SQL = `
SELECT table_schema || '.' || table_name AS "table"
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema || '.' || table_name = ANY($1::text[])`;

/**
 * Every column of the `$1` schema-qualified tables, in table then column
 * order, with its `information_schema` type, whether it may be null, and
 * its position in the primary key, or null when it is not part of one.
 */
export const SQLITE_EXPORT_COLUMNS_SQL = `
SELECT
  columns.table_schema || '.' || columns.table_name AS "table",
  columns.column_name AS "name",
  columns.data_type AS "type",
  columns.is_nullable = 'YES' AS "nullable",
  keys.ordinal_position AS "primaryKey"
FROM information_schema.columns AS columns
LEFT JOIN (
  SELECT usage.table_schema, usage.table_name, usage.column_name, usage.ordinal_position
  FROM information_schema.table_constraints AS constraints
  JOIN information_schema.key_column_usage AS usage
    ON usage.constraint_schema = constraints.constraint_schema
    AND usage.constraint_name = constraints.constraint_name
    AND usage.table_name = constraints.table_name
  WHERE constraints.constraint_type = 'PRIMARY KEY'
) AS keys
  ON keys.table_schema = columns.table_schema
  AND keys.table_name = columns.table_name
  AND keys.column_name = columns.column_name
WHERE columns.table_schema || '.' || columns.table_name = ANY($1::text[])
ORDER BY columns.table_schema, columns.table_name, columns.ordinal_position`;

/** How many rows one `FETCH` reads, so a large table is never held whole. */
export const SQLITE_EXPORT_FETCH_SIZE = 1000;

/** One row as the driver returns it: values by column name. */
export const SQLITE_EXPORT_ROW_SCHEMA = z.record(z.string(), z.unknown());

/** The name of the cursor a table's rows are read through. */
export const SQLITE_EXPORT_CURSOR = "sqlite_export_cursor";

/** A SQLite value for an ISO-8601 instant, or the text of anything else. */
const toIsoText = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : String(value);

/** A value as JSON text: how an array or a JSON document is stored. */
const toJsonText = (value: unknown): string => JSON.stringify(value);

/** A value as a number; `numeric` arrives from the driver as text. */
const toNumber = Number;

/** A value as text. */
const toText = String;

/** A `boolean` as SQLite's 0 or 1. */
const toBit = (value: unknown): number => (value === true ? 1 : 0);

/** The text a mapping stores as-is: names, text, and uuids. */
const TEXT_MAPPING: SqliteTypeMapping = { affinity: "TEXT", convert: toText };

/** An array or a JSON document, stored as JSON text. */
const JSON_MAPPING: SqliteTypeMapping = {
  affinity: "TEXT",
  convert: toJsonText,
};

/** A number the driver already parsed. */
const NUMBER_MAPPING: SqliteTypeMapping = {
  affinity: "INTEGER",
  convert: toNumber,
};

/** An approximate or exact decimal, as a real number. */
const REAL_MAPPING: SqliteTypeMapping = { affinity: "REAL", convert: toNumber };

/**
 * How each Postgres column type, as `information_schema` names it, is
 * stored in SQLite so a browser can query it: instants as ISO text,
 * `numeric` as a real number, arrays and JSON as JSON text, `boolean` as
 * 0 or 1. A type absent here has no mapping, and an export of a column
 * with it fails naming the column.
 */
export const SQLITE_TYPE_MAPPINGS: Readonly<
  Record<string, SqliteTypeMapping | undefined>
> = {
  ARRAY: JSON_MAPPING,
  bigint: {
    affinity: "INTEGER",
    convert: (value: unknown): bigint => BigInt(String(value)),
  },
  boolean: { affinity: "INTEGER", convert: toBit },
  character: TEXT_MAPPING,
  "character varying": TEXT_MAPPING,
  date: { affinity: "TEXT", cast: "text", convert: toText },
  "double precision": REAL_MAPPING,
  integer: NUMBER_MAPPING,
  json: JSON_MAPPING,
  jsonb: JSON_MAPPING,
  numeric: REAL_MAPPING,
  real: REAL_MAPPING,
  smallint: NUMBER_MAPPING,
  text: TEXT_MAPPING,
  "timestamp with time zone": { affinity: "TEXT", convert: toIsoText },
  uuid: TEXT_MAPPING,
};

/**
 * A column whose Postgres type has no SQLite mapping. The message names
 * the column, so nothing is silently dropped.
 */
export class SqliteExportColumnError extends Error {
  constructor(table: string, column: string, type: string) {
    super(
      `Column ${table}.${column} has type "${type}", which has no SQLite mapping; leave its table out of --table, or change the column's type`,
    );
    this.name = SqliteExportColumnError.name;
  }
}

/**
 * An export to SQLite that could not complete: the source could not be
 * reached or read. Its message never repeats a password.
 */
export class SqliteExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = SqliteExportError.name;
  }
}

/**
 * Tables from different schemas that would share one SQLite name. A SQLite
 * file has no schemas, so each table is written under its own name alone.
 */
export class SqliteExportNameError extends Error {
  constructor(name: string, tables: readonly string[]) {
    super(
      `${tables.join(" and ")} would both be written as "${name}" in one SQLite file; export them to separate files`,
    );
    this.name = SqliteExportNameError.name;
  }
}

/**
 * An export to SQLite whose `--table` names matched nothing in the source.
 * Carries the schema-qualified tables so the command can name them as it
 * does for a `pg_dump` that found none.
 */
export class SqliteExportTablesError extends Error {
  constructor(tables: readonly string[]) {
    super(`No table ${tables.join(", ")} exists`);
    this.name = SqliteExportTablesError.name;
    this.tables = tables;
  }

  /** The schema-qualified tables that do not exist. */
  readonly tables: readonly string[];
}
