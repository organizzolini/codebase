// ♟️ Constants

import { describePostgresContent } from "../postgresql-utilities/postgresql-utilities.utilities";

import type { PostgresqlExportPlan } from "./postgresql-export.types";

/** Missing-option messages, keyed by option, each showing its usage. */
export const POSTGRESQL_EXPORT_OPTION_MESSAGES = {
  content:
    "--data and/or --ddl is required: pass --data for rows, --ddl for table definitions, or both",
  file: "--file is required: name the dump file to write, e.g. --file sample.dump",
  sourceUri:
    "--source-uri is required: name the database to export from, e.g. --source-uri postgresql://user@host:5432/database",
  table:
    "--table is required: name each table to export, e.g. --table <schema>.<table>, or --schema <schema> --table <table>",
} as const;

/**
 * An `postgresql-export` command line that cannot run, raised before any process
 * starts. Its message names the option to fix and never repeats a URI.
 */
export class PostgresqlExportOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = PostgresqlExportOptionsError.name;
  }
}

/** What `postgresql-export` says when `file` already exists and `--overwrite` was not given. */
export const existingFileMessage = (file: string): string =>
  `${file} already exists and was left unchanged: choose another --file, or pass --overwrite to replace it`;

/** No-table message: names the tables, never pg_dump's own text. */
export const missingTablesMessage = (
  tables: readonly string[],
  source: string,
): string => {
  const several = tables.length > 1;
  const [noun, verb, suffix] = several
    ? ["tables", "exist", "s"]
    : ["table", "exists", ""];
  return `No ${noun} ${tables.join(", ")} ${verb} in ${source}; check the --table name${suffix}.`;
};

/** An `postgresql-export` whose `--table` matched nothing in the source database. */
export class PostgresqlExportTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = PostgresqlExportTableError.name;
  }
}

/** Dry-run lines, no password, each opening with an emoji and verb. */
export const dryRunMessages = (
  {
    connection: { database, host },
    content,
    file,
    tables,
  }: Pick<PostgresqlExportPlan, "connection" | "content" | "file" | "tables">,
  exists: boolean,
): string[] => [
  `🔍 Planning export of ${describePostgresContent(content)} from database "${database}" on ${host} to ${file}; nothing was connected to or changed`,
  ...tables.map(
    (table) =>
      `🔍 Planning to export ${describePostgresContent(content)} of ${table}`,
  ),
  `🔍 Planning to ${exists ? "overwrite" : "create"} ${file}`,
];
