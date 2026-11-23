// 🏷️ Types

import type { GraphTreeTruncation } from "../render-mermaid/render-mermaid.types";
import type {
  GraphLimits,
  GraphReadOptions,
} from "../render-options/render-options.types";
import type { DataSource, EntityMetadata } from "typeorm";

/** Caps on the drawn tree, as for any graph. */
export type GraphTreeLimits = GraphLimits;

/** What a tree read draws: filters, sorts, paging, then caps. */
export type GraphTreeOptions = GraphReadOptions;

/** Inputs every batched read of one tree shares. */
export interface GraphTreeRead {
  /** The rows or parent ids one query reads at most. */
  readonly batchSize: number;

  /** The connection the tree is read through. */
  readonly dataSource: DataSource;

  /** The SQL the tree is read by. */
  readonly sql: GraphTreeSql;

  /** The table the rows are read from. */
  readonly table: GraphTreeTable;
}

/** One row of a tree table, reduced to what a diagram draws. */
export interface GraphTreeRow {
  /** The row's primary key, as text. */
  readonly id: string;

  /** The row's `name` column, or its primary key when it has none. */
  readonly label: string;

  /** The primary key of the row's parent; `undefined` for a root. */
  readonly parentId: string | undefined;
}

/** The SQL a tree is read by, over the table aliased `t`. */
export interface GraphTreeSql {
  /** The predicate for the rows whose parent is one of the ids. */
  readonly children: string;

  /** The columns a row is read by: id, label, and parent id, as text. */
  readonly columns: string;

  /** The table, aliased `t`. */
  readonly from: string;

  /** The predicate for the rows whose parent no row has, or that have none. */
  readonly roots: string;
}

/** The escaped SQL names a tree table is read by. */
export interface GraphTreeTable {
  /** The table, schema-qualified when its entity names a schema. */
  readonly from: string;

  /** The primary key column. */
  readonly id: string;

  /** The `name` column, or the primary key where there is none; text-cast. */
  readonly label: string;

  /** The entity's metadata, for its tree columns. */
  readonly metadata: EntityMetadata;
}

/** The ids a walk shows, and the truncations it made. */
export interface GraphTreeWalk {
  /** The ids shown, roots included. */
  readonly shown: ReadonlySet<string>;

  /** Each node whose children a cap hid, in walk order. */
  readonly truncations: readonly GraphTreeTruncation[];
}
