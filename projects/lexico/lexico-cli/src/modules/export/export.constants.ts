// ♟️ Constants

/**
 * What `export` says when an option it requires is missing, keyed by the
 * option. Each names the option and shows it in use.
 */
export const EXPORT_OPTION_MESSAGES = {
  content:
    "--data or --schema is required: pass --data for rows, --schema for table definitions, or both",
  file: "--file is required: name the dump file to write, e.g. --file lexico.dump",
  sourceUri:
    "--source-uri is required: name the database to export from, e.g. --source-uri postgresql://user@host:5432/database",
  table:
    "--table is required: name each table to export, e.g. --table words --table lexico.lexemes",
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
