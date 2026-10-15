// ♟️ Constants

import { describePostgresContent } from "../postgres-client/postgres-client.utilities";

import type { PostgresContent } from "../postgres-client/postgres-client.types";
import type { ImportPlan } from "./import.types";

/**
 * What `import` says when an option it requires is missing, keyed by the
 * option. Each names the option and shows it in use.
 */
export const IMPORT_OPTION_MESSAGES = {
  content:
    "--data and/or --ddl is required: pass --data for rows, --ddl for table definitions, or both",
  file: "--file is required: name the dump file to import, e.g. --file sample.dump",
  table:
    "--table is required: name each table to import, e.g. --table <schema>.<table>, or --schema <schema> --table <table>",
  targetUri:
    "--target-uri is required: name the database to import into, e.g. --target-uri postgresql://user@host:5432/database",
} as const;

/**
 * A `--clean --data` truncate that was refused or failed. The truncate
 * did not take effect, so nothing has changed.
 */
export class ImportCleanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ImportCleanError.name;
  }
}

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
 * A restore that failed, carrying the client tool's own error,
 * credentials masked.
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
 * table definitions (`ddl`) of some selected tables.
 */
export const missingContentsMessage = (
  file: string,
  { data, ddl }: Readonly<Record<"data" | "ddl", readonly string[]>>,
): string => {
  const missing = [
    ...(data.length === 0 ? [] : [`no rows for ${data.join(", ")}`]),
    ...(ddl.length === 0 ? [] : [`no table definitions for ${ddl.join(", ")}`]),
  ];
  return `${file} holds ${missing.join(" and ")}: export them with --data and/or --ddl, or leave them out of --table`;
};

/** What `import` adds to a failed restore's error: the target is unchanged. */
export const rolledBackMessage = (detail: string, target: string): string =>
  `${detail}\nNothing was imported: the restore ran as one transaction, so ${target} was left unchanged.`;

/**
 * What `import --clean --data` says when tables outside the selection,
 * `referencing`, reference a selected one: the `--table` options to add.
 */
export const referencedTablesMessage = (
  referencing: readonly string[],
  target: string,
): string =>
  `--clean cannot empty the selected tables: ${referencing.join(", ")} ${referencing.length === 1 ? "references them but is" : "reference them but are"} not selected, and --clean never cascades. Add ${referencing.map((table) => `--table ${table}`).join(" ")} to empty them too.\nNothing was truncated: ${target} was left unchanged.`;

/** What `import` adds to a failed truncate's error: nothing changed. */
export const notTruncatedMessage = (detail: string, target: string): string =>
  `${detail}\nNothing was truncated: ${target} was left unchanged.`;

/**
 * What `import` adds to a restore that failed after `--clean --data`
 * emptied `tables`: they may be empty, and the import should be re-run.
 */
export const truncatedMessage = (
  detail: string,
  target: string,
  tables: readonly string[],
): string =>
  `${detail}\n--clean had already emptied ${tables.join(", ")} in ${target}, so they may now be empty. Re-run the import from the same file to refill them.`;

/**
 * What `import --dry-run` prints, one line each: where it would import
 * to, what the dump holds of each selected table (`held`, keyed by the
 * qualified name, in the plan's order), and what `--clean` would drop and
 * recreate (with `--ddl`) or truncate (with `--data` alone). Never
 * carries the password.
 */
export const dryRunMessages = (
  {
    clean,
    connection: { database, host },
    content,
    file,
    tables,
  }: Pick<ImportPlan, "clean" | "connection" | "content" | "file" | "tables">,
  held: ReadonlyMap<string, PostgresContent>,
): string[] => [
  `🔍 Dry run: would import ${describePostgresContent(content)} from ${file} into database "${database}" on ${host}; nothing was connected to or changed`,
  ...[...held].map(
    ([table, holds]) =>
      `  ${table}: the dump holds ${describePostgresContent(holds)}`,
  ),
  ...(clean
    ? [
        `  --clean ${content.ddl ? "with --ddl would drop and recreate" : "with --data would truncate"} ${tables.join(", ")}, deleting every row ${tables.length === 1 ? "it holds" : "they hold"}, then restore ${content.ddl ? "them from the dump" : "the dump's rows"}`,
      ]
    : []),
];
