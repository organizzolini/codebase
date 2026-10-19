// 🏷️ Types

import type {
  PostgresContent,
  PostgresUriConnection,
} from "../postgres-client/postgres-client.types";

/**
 * What `SqliteExportService.export` is given. An `ExportPlan` satisfies it.
 */
export interface SqliteExportOptions {
  /** The database to read from. */
  readonly connection: PostgresUriConnection;

  /** Whether to write rows, definitions, or both. */
  readonly content: PostgresContent;

  /** The SQLite file to write; it must not exist yet. */
  readonly file: string;

  /** Schema-qualified table names; see `qualifyTableNames`. */
  readonly tables: readonly string[];
}
