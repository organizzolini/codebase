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
