// 🏷️ Types

import type { DataSource, EntityMetadata } from "typeorm";

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

/** A nested-set row's interval, which places it among its ancestors. */
export interface NestedSetRow {
  /** The row's primary key, as text. */
  readonly id: string;

  /** The left bound of the row's interval. */
  readonly left: number;

  /** The right bound of the row's interval. */
  readonly right: number;
}
