import type { SqlRow, SqlValue } from "./events-database.types";

/**
 * One select the page asks the worker to run. The database's address travels
 * with every request so the worker needs no separate opening handshake.
 */
export interface WorkerRequest {
  databaseUrl: string;
  id: number;
  parameters: readonly SqlValue[];
  sql: string;
}

/**
 * The worker's answer to the request with the same `id`.
 */
export type WorkerResponse =
  | { error: string; id: number }
  | { id: number; rows: SqlRow[] };
