// ♟️ Constants

import { describePostgresContent } from "../postgres-client/postgres-client.utilities";

import type { ExportPlan } from "./export.types";

/**
 * What `export` says when an option it requires is missing, keyed by the
 * option. Each names the option and shows it in use.
 */
export const EXPORT_OPTION_MESSAGES = {
  content:
    "--data and/or --ddl is required: pass --data for rows, --ddl for table definitions, or both",
  file: "--file is required: name the dump file to write, e.g. --file sample.dump",
  sourceUri:
    "--source-uri is required: name the database to export from, e.g. --source-uri postgresql://user@host:5432/database",
  table:
    "--table is required: name each table to export, e.g. --table <schema>.<table>, or --schema <schema> --table <table>",
} as const;

/**
 * An `export` command line that cannot run, raised before any process
 * starts. Its message names the option to fix and never repeats a URI.
 */
export class ExportOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ExportOptionsError.name;
  }
}

/** What `export` says when `file` already exists and `--overwrite` was not given. */
export const existingFileMessage = (file: string): string =>
  `${file} already exists and was left unchanged: choose another --file, or pass --overwrite to replace it`;

/**
 * What `export` says when `pg_dump` found no table for `tables`: it names
 * them and the masked `source`, never pg_dump's own text.
 */
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

/** An `export` whose `--table` matched nothing in the source database. */
export class ExportTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ExportTableError.name;
  }
}

/**
 * What `export --dry-run` prints, one line each: where it would export
 * from and to, what it would export of each selected table, in the plan's
 * order, and whether `file` (`exists`) would be created or overwritten.
 * Never carries the password. Each line is a whole log message, so each
 * opens with an emoji and a verb, as `LoggerService` requires.
 */
export const dryRunMessages = (
  {
    connection: { database, host },
    content,
    file,
    sqlite,
    tables,
  }: Pick<ExportPlan, "connection" | "content" | "file" | "sqlite" | "tables">,
  exists: boolean,
): string[] => [
  `🔍 Planning export of ${describePostgresContent(content)} from database "${database}" on ${host} to ${file}${sqlite ? " as SQLite" : ""}; nothing was connected to or changed`,
  ...tables.map(
    (table) =>
      `🔍 Planning to export ${describePostgresContent(content)} of ${table}`,
  ),
  `🔍 Planning to ${exists ? "overwrite" : "create"} ${file}`,
];
