// 🏷️ Types

import type { PaginationArguments } from "../search/pagination-arguments.entities";
import type { Repository } from "@codebase/lexico-db";

/**
 * The `Author` column the API does not expose: its unstructured ingestion
 * metadata.
 */
export type AuthorDatabaseOnlyField = "metadata";

/** The `Author` relation resolvers expose: texts, in title order. */
export type AuthorResolvedField = "texts";

/** Reads cursors back into rows; unissued cursors are ignored. */
export interface ConnectionCursor {
  /**
   * Reads the id, and sort key if present, of the row a cursor names. Null when
   * the connection did not issue the cursor.
   */
  readonly decode: (cursor: string) => CursorClaim | null;
  /** Writes the cursor of the row at a position. */
  readonly encode: (position: CursorPosition) => string;
}

/** Query filters, ordering, and limits that pagination pushes down. */
export interface ConnectionQuery<
  Node extends IdentifiedEntity,
  Row extends IdentifiedEntity = Node,
> {
  /** How the connection's cursors are read and written; `{ id }` when absent. */
  readonly cursor?: ConnectionCursor;
  /** Builds a fresh query holding only the connection's filters, with no joins. */
  readonly filter: () => QueryBuilder<Row>;
  /**
   * Loads one page's nodes by id, with the relations the connection exposes,
   * given each row's sort key.
   */
  readonly load: (
    ids: string[],
    keys: ReadonlyMap<string, unknown>,
  ) => Promise<Node[]>;
  /** The expression ordered by before the id tiebreaker, such as `line.index`. */
  readonly sortKey: string;
}

/** One parent's page of batched children, such as `tokens(first: 20)`. */
export interface ConnectionRequest {
  readonly pagination: PaginationArguments;
  readonly parentId: string;
}

/** A cursor's row: id, plus sort key if carried. */
export interface CursorClaim {
  readonly id: string;
  readonly key?: unknown;
}

/** Sort key and id of the row a cursor names. */
export interface CursorPosition {
  readonly id: string;
  readonly key: unknown;
}

/** An entity row with the string id every Relay cursor encodes. */
export interface IdentifiedEntity {
  id: string;
}

/** The `Line` relations the API exposes, each as its own GraphQL type. */
export type LineRelationField = "author" | "text";

/** The `Line` relation resolvers expose: tokens, in index order. */
export type LineResolvedField = "tokens";

/** Page sizes; absent or negative counts mean no limit. */
export interface PageLimits {
  readonly first: null | number;
  readonly last: null | number;
}

/** A page statement's cursor rows and the window between them. */
export interface PageRead {
  readonly after: CursorPosition | null;
  readonly before: CursorPosition | null;
  readonly hasRowBefore: boolean;
  readonly totalCount: number;
  readonly window: CursorPosition[];
}

/** The one row a page statement returns. */
export interface PageReadRow {
  readonly after: CursorPosition | null;
  readonly before: CursorPosition | null;
  readonly hasRowBefore: boolean;
  readonly totalCount: number | string;
  readonly window: CursorPosition[];
}

/** Cursors of one partitioned page, each naming a parent's row. */
export interface PartitionBounds {
  readonly after: null | PartitionedCursorPosition;
  readonly before: null | PartitionedCursorPosition;
}

/** One parent's counts: all children, those between cursors, and before. */
export interface PartitionCounts {
  readonly beforeCount: number;
  readonly totalCount: number;
  readonly windowCount: number;
}

/** Many parents' children, paged in a fixed statement count. */
export interface PartitionedConnectionQuery<Entity extends IdentifiedEntity> {
  /** The alias the column names below are written against, such as `token`. */
  readonly alias: string;
  /**
   * Builds a fresh query under `alias` joining every relation the connection
   * exposes, which the page's rows are then selected through.
   */
  readonly load: () => QueryBuilder<Entity>;
  /** The column naming each row's parent, such as `token.line_id`. */
  readonly parentKey: string;
  /** Reads the id of the parent a loaded row belongs to. */
  readonly parentOf: (entity: Entity) => string | undefined;
  /** The repository the rows are counted and windowed in. */
  readonly repository: Repository<Entity>;
  /** The column ordered by before the id tiebreaker, such as `token.index`. */
  readonly sortKey: string;
}

/** The row a cursor names in a partitioned connection, and its parent. */
export interface PartitionedCursorPosition extends CursorPosition {
  readonly parentId: string;
}

/** The select query builder a repository of this entity creates. */
export type QueryBuilder<Entity extends IdentifiedEntity> = ReturnType<
  Repository<Entity>["createQueryBuilder"]
>;

/** A SQL condition and the parameters it binds. */
export interface SqlCondition {
  readonly parameters: Record<string, unknown>;
  readonly sql: string;
}

/**
 * The `Text` column the API does not expose: its unstructured ingestion
 * metadata.
 */
export type TextDatabaseOnlyField = "metadata";

/** The `Text` relations the API exposes, each as its own GraphQL type. */
export type TextRelationField = "author" | "parentText";

/** The `Text` relations resolvers serve: child texts and lines. */
export type TextResolvedField = "childTexts" | "lines";

/** The `Token` relations the API exposes, each as its own GraphQL type. */
export type TokenRelationField = "author" | "line" | "text" | "word";
