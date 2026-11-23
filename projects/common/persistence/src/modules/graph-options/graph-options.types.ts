// 🏷️ Types

import type { PostgresConnection } from "../postgresql/postgresql.types";

/** The options every graph command shares. The command validates them. */
export interface GraphOptions {
  /** Glob patterns of the entity files to import; repeatable. */
  readonly entities?: string[] | undefined;

  /** The schema the entity tables live in; required. */
  readonly schema?: string | undefined;

  /** Connection URI of the database to read from. */
  readonly sourceUri?: string | undefined;

  /** The table to pick when the entities match several; unqualified. */
  readonly table?: string | undefined;
}

/** A validated graph command: where to read, which entities, and which table. */
export interface GraphPlan {
  /** The database and schema, with the password in it; never logged. */
  readonly connection: PostgresConnection;

  /** The entity glob patterns, in the order given. */
  readonly entities: readonly string[];

  /** `--source-uri` with its password masked, for log lines. */
  readonly source: string;

  /** The table name picked with `--table`, or `undefined` to pick the only one. */
  readonly table: string | undefined;
}
