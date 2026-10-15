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
  data?: boolean;
  file?: string;
  schema?: boolean;
  table?: string[];
  targetUri?: string;
}

/**
 * A validated import: what to restore, from which file, and into where.
 */
export interface ImportPlan {
  readonly connection: PostgresUriConnection;
  readonly content: PostgresContent;

  /** The dump file or directory, which exists. */
  readonly file: string;

  /** Schema-qualified, in the order given. */
  readonly tables: readonly string[];

  /** `--target-uri` with its password masked, for log lines. */
  readonly target: string;
}
