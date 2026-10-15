// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgres-client/postgres-client.types";

/**
 * The options `import` receives, as nest-commander parsed them. Every one
 * is optional here; `ImportCommand` validates them before anything runs.
 */
export interface ImportCommandOptions {
  clean?: boolean;
  data?: boolean;
  dryRun?: boolean;
  file?: string;
  namespace?: string;
  schema?: boolean;
  table?: string[];
  targetUri?: string;
}

/**
 * A validated import: what to restore, from which file, and into where.
 */
export interface ImportPlan {
  /**
   * Clear the selected tables before restoring them: truncate them for
   * data alone, or drop and recreate them when the schema is restored too.
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
