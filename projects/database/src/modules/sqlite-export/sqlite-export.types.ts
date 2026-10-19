// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgres-client/postgres-client.types";
import type { SQLInputValue } from "node:sqlite";

/** A column of a Postgres table, as `information_schema` describes it. */
export interface PostgresColumn {
  /** The column's name. */
  readonly name: string;

  /** Whether the column accepts null. */
  readonly nullable: boolean;

  /** The column's 1-based position in the primary key; null when outside it. */
  readonly primaryKey: null | number;

  /** The schema-qualified table the column belongs to. */
  readonly table: string;

  /** The type, as `information_schema.columns.data_type` names it. */
  readonly type: string;
}

/** A Postgres column with the SQLite type its values are stored as. */
export interface SqliteColumn extends PostgresColumn {
  readonly mapping: SqliteTypeMapping;
}

/**
 * What `SqliteExportService.export` is given. An `ExportPlan` satisfies it.
 */
export interface SqliteExportOptions {
  /** The database to read from. */
  readonly connection: PostgresUriConnection;

  /** Whether to write rows, definitions, or both. */
  readonly content: PostgresContent;

  /** The SQLite file to write; it must not exist yet. */
  readonly file: string;

  /** Schema-qualified table names; see `qualifyTableNames`. */
  readonly tables: readonly string[];
}

/** One table to write: where it comes from, what it is called, and its columns. */
export interface SqliteTable {
  readonly columns: readonly SqliteColumn[];

  /** The table's name in the SQLite file: its name without its schema. */
  readonly name: string;

  /** The schema-qualified Postgres table. */
  readonly table: string;
}

/** The type SQLite stores a column's values as, and how they get there. */
export interface SqliteTypeMapping {
  /** The SQLite storage class the column is declared with. */
  readonly affinity: "INTEGER" | "REAL" | "TEXT";

  /** Select the column cast to this type, so the driver does not parse it. */
  readonly cast?: "text";

  /** A SQLite value for a non-null value the driver returned. */
  readonly convert: (value: unknown) => SQLInputValue;
}

/** What `SqliteExportService` writes to one file. */
export interface SqliteWrite {
  /** Write each table's rows as well as its definition. */
  readonly data: boolean;

  /** The SQLite file to write; it must not exist yet. */
  readonly file: string;

  /** The tables to write, in order. */
  readonly tables: readonly SqliteTable[];
}
