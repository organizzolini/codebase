// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgresql-utilities/postgresql-utilities.types";

/** Options `postgresql-export` receives. The command validates them. */
export interface PostgresqlExportCommandOptions {
  data?: boolean;
  ddl?: boolean;
  dryRun?: boolean;
  file?: string;
  overwrite?: boolean;
  schema?: string;
  sourceUri?: string;
  table?: string[];
}

/**
 * A validated export: what to dump, from where, and to which file.
 */
export interface PostgresqlExportPlan {
  readonly connection: PostgresUriConnection;
  readonly content: PostgresContent;
  readonly file: string;

  /** `--source-uri` with its password masked, for log lines. */
  readonly source: string;

  /** Schema-qualified, in the order given. */
  readonly tables: readonly string[];
}
