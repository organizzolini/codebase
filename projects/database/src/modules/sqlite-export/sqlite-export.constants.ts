// ♟️ Constants

/** Which of the `$1` schema-qualified names are tables, as `schema.table`. */
export const SQLITE_EXPORT_EXISTING_TABLES_SQL = `
SELECT table_schema || '.' || table_name AS "table"
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema || '.' || table_name = ANY($1::text[])`;

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
