// 🏷️ Types

/** What a `PostgresClientError` is built from. */
export interface PostgresClientFailure {
  /** The process's exit code, or the spawn error's code when it never ran. */
  readonly code: number | string | undefined;

  /** The tool's own error text, credentials already masked. */
  readonly detail: string;

  /** The tool that failed. */
  readonly tool: PostgresClientTool;
}

/** What a client tool printed, once it exited successfully. */
export interface PostgresClientOutput {
  readonly stderr: string;
  readonly stdout: string;
}

/** A PostgreSQL client binary this module runs. */
export type PostgresClientTool = "pg_dump" | "pg_restore";

/**
 * Which parts of the selected tables a dump or restore moves. At least one
 * is true; both true means table definitions and rows together.
 */
export interface PostgresContent {
  /** Move the tables' rows. */
  readonly data: boolean;

  /** Move the tables' definitions, their DDL. */
  readonly ddl: boolean;
}

/**
 * One entry of a dump's table of contents, as `pg_restore --list --verbose`
 * prints it.
 */
export interface PostgresDumpEntry {
  /** The ids of the entries it depends on, some possibly not in the dump. */
  readonly dependencies: readonly number[];

  /** The dump id `pg_restore --use-list` selects it by. */
  readonly id: number;

  /**
   * `table` for a table's definition, `data` for its rows, `header` for
   * the session settings every restore needs, and `other` for the rest.
   */
  readonly kind: PostgresDumpEntryKind;

  /** The schema-qualified table, for a `table` or `data` entry. */
  readonly table?: string;
}

/** What a dump entry holds; see `PostgresDumpEntry.kind`. */
export type PostgresDumpEntryKind = "data" | "header" | "other" | "table";

/**
 * What `PostgresClientService.dump` is given.
 */
export interface PostgresDumpOptions {
  /** The database to dump from. */
  readonly connection: PostgresUriConnection;

  /** Whether to dump rows, definitions, or both. */
  readonly content: PostgresContent;

  /** The custom-format dump file to write, relative to the working directory. */
  readonly file: string;

  /** Schema-qualified table names; see `qualifyTableNames`. */
  readonly tables: readonly string[];
}

/**
 * Runs one SQL statement with positional `$n` parameters and resolves its
 * rows; how `truncatePostgresTables` reaches a database.
 */
export type PostgresQuery = (
  sql: string,
  parameters?: readonly unknown[],
) => Promise<unknown[]>;

/**
 * What `PostgresClientService.restore` is given.
 */
export interface PostgresRestoreOptions {
  /**
   * Drop each selected table, with `IF EXISTS`, before recreating it.
   * Applies only when `content.ddl`: `pg_restore` refuses its clean
   * option with a data-only restore.
   */
  readonly clean?: boolean;

  /** The database to restore into. */
  readonly connection: PostgresUriConnection;

  /** Whether to restore rows, definitions, or both. */
  readonly content: PostgresContent;

  /** The dump's table of contents, from `PostgresClientService.list`. */
  readonly contents: readonly PostgresDumpEntry[];

  /** The dump file or directory to restore from. */
  readonly file: string;

  /** Schema-qualified table names; see `qualifyTableNames`. */
  readonly tables: readonly string[];
}

/**
 * What `PostgresClientService.truncate` is given.
 */
export interface PostgresTruncateOptions {
  /** The database whose tables to empty. */
  readonly connection: PostgresUriConnection;

  /** Schema-qualified table names; see `qualifyTableNames`. */
  readonly tables: readonly string[];
}

/**
 * Where a client tool connects, parsed from a `postgresql://` URI. Handed to
 * the tool as `PG*` variables, so none of it reaches the process arguments.
 */
export interface PostgresUriConnection {
  /** The database the URI's path names. */
  readonly database: string;

  /** The server's host name or address. */
  readonly host: string;

  /** The decoded password, or `""` when the URI carries none. */
  readonly password: string;

  /** The server's port; 5432 when the URI names none. */
  readonly port: number;

  /** The decoded role name. */
  readonly username: string;
}
