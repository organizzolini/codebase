// 🏷️ Types

import type {
  GraphFilter,
  GraphSort,
} from "../graph-options/graph-options.types";
import type { DataSource, EntityMetadata } from "typeorm";

/** Caps on the drawn tree; an absent cap draws every level or child. */
export interface GraphTreeLimits {
  /** The most children drawn under one node; `undefined` draws every child. */
  readonly maximumBreadth?: number | undefined;

  /** The deepest level drawn, with roots at level 1; `undefined` draws every level. */
  readonly maximumDepth?: number | undefined;
}

/** What a tree read draws: its row filters and sort keys, then its caps. */
export interface GraphTreeOptions extends GraphTreeLimits {
  /** The row filters, each by a column name; a row must match all of them. */
  readonly filters: readonly GraphFilter[];

  /** The sort keys, applied in order among siblings. */
  readonly sorts: readonly GraphSort[];
}

/** Reads one tree table's rows, whichever storage it uses. */
export type GraphTreeReader = (
  dataSource: DataSource,
  table: GraphTreeTable,
) => Promise<GraphTreeRow[]>;

/** One row of a tree table, reduced to what a diagram draws. */
export interface GraphTreeRow {
  /** The row's primary key, as text. */
  readonly id: string;

  /** The row's `name` column, or its primary key when it has none. */
  readonly label: string;

  /** The primary key of the row's parent; `undefined` for a root. */
  readonly parentId: string | undefined;
}

/** A tree's storage, as `@Tree` names it. */
export type GraphTreeStorage = NonNullable<EntityMetadata["treeType"]>;

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

/** A node whose children a cap hid: its id, the count hidden, and the cap. */
export interface GraphTreeTruncation {
  /** The number of children the cap hid. */
  readonly hidden: number;

  /** The flag whose cap hid them. */
  readonly limit: "--max-breadth" | "--max-depth";

  /** The cap's value. */
  readonly maximum: number;

  /** The id of the node whose children were hidden. */
  readonly parent: string;
}

/** The ids a walk shows, and the truncations it made to hide the rest. */
export interface GraphTreeWalk {
  /** The ids shown, roots included. */
  readonly shown: ReadonlySet<string>;

  /** Each node whose children a cap hid, in walk order. */
  readonly truncations: readonly GraphTreeTruncation[];
}

/** A nested-set row's interval, which places it among its ancestors. */
export interface NestedSetRow {
  /** The row's primary key, as text. */
  readonly id: string;

  /** The left bound of the row's interval. */
  readonly left: number;

  /** The right bound of the row's interval. */
  readonly right: number;
}
