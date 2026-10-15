// ♟️ Constants

/**
 * What `import` says when an option it requires is missing, keyed by the
 * option. Each names the option and shows it in use.
 */
export const IMPORT_OPTION_MESSAGES = {
  content:
    "--data or --schema is required: pass --data for rows, --schema for table definitions, or both",
  file: "--file is required: name the dump file to import, e.g. --file lexico.dump",
  table:
    "--table is required: name each table to import, e.g. --table words --table lexico.lexemes",
  targetUri:
    "--target-uri is required: name the database to import into, e.g. --target-uri postgresql://user@host:5432/database",
} as const;

/**
 * A dump that does not hold what `import` was asked to restore, found by
 * listing its contents before any connection opens.
 */
export class ImportContentsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ImportContentsError.name;
  }
}

/**
 * An `import` command line that cannot run, raised before any process
 * starts. Its message names the option to fix and never repeats a URI.
 */
export class ImportOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ImportOptionsError.name;
  }
}

/**
 * A restore that failed and was rolled back, carrying the client tool's
 * own error, credentials masked.
 */
export class ImportRestoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ImportRestoreError.name;
  }
}

/** What `import` says when `file` does not exist. */
export const missingFileMessage = (file: string): string =>
  `${file} does not exist: name a dump file or directory written by export with --file`;

/**
 * What `import` says when the dump at `file` lacks the rows (`data`) or
 * table definitions (`schema`) of some selected tables.
 */
export const missingContentsMessage = (
  file: string,
  { data, schema }: Readonly<Record<"data" | "schema", readonly string[]>>,
): string => {
  const missing = [
    ...(data.length === 0 ? [] : [`no rows for ${data.join(", ")}`]),
    ...(schema.length === 0
      ? []
      : [`no table definitions for ${schema.join(", ")}`]),
  ];
  return `${file} holds ${missing.join(" and ")}: export them with --data or --schema, or leave them out of --table`;
};

/** What `import` adds to a failed restore's error: the target is unchanged. */
export const rolledBackMessage = (detail: string, target: string): string =>
  `${detail}\nNothing was imported: the restore ran as one transaction, so ${target} was left unchanged.`;
