// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgres-client/postgres-client.types";

/**
 * The options `export` receives, as nest-commander parsed them. Every one
 * is optional here; `ExportCommand` validates them before anything runs.
 */
export interface ExportCommandOptions {
  data?: boolean;
  ddl?: boolean;
  dryRun?: boolean;
  file?: string;
  overwrite?: boolean;
  schema?: string;
  sourceUri?: string;
  sqlite?: boolean;
  table?: string[];
}

/**
 * A validated export: what to dump, from where, and to which file.
 */
export interface ExportPlan {
  readonly connection: PostgresUriConnection;
  readonly content: PostgresContent;
  readonly file: string;

  /** `--source-uri` with its password masked, for log lines. */
  readonly source: string;

  /** Write a SQLite file rather than a `pg_dump` custom-format dump. */
  readonly sqlite: boolean;

  /** Schema-qualified, in the order given. */
  readonly tables: readonly string[];
}
