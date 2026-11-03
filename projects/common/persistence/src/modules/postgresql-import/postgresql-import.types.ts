// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgresql-utilities/postgresql-utilities.types";

/**
 * The options `postgresql-import` receives, as nest-commander parsed them. Every one
 * is optional here; `PostgresqlImportCommand` validates them before anything runs.
 */
export interface PostgresqlImportCommandOptions {
  clean?: boolean;
  data?: boolean;
  ddl?: boolean;
  dryRun?: boolean;
  file?: string;
  schema?: string;
  table?: string[];
  targetUri?: string;
}

/**
 * A validated import: what to restore, from which file, and into where.
 */
export interface PostgresqlImportPlan {
  /**
   * Clear the selected tables before restoring them: truncate them for
   * data alone, or drop and recreate them when their DDL is restored too.
   */
  readonly clean: boolean;

  readonly connection: PostgresUriConnection;
  readonly content: PostgresContent;

  /** The dump file or directory, which exists. */
  readonly file: string;

  /** Schema-qualified, in the order given. */
  readonly tables: readonly string[];

  /** `--target-uri` with its password masked, for log lines. */
  readonly target: string;
}
