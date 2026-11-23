// 🏷️ Types

import type { NamingStrategyInterface } from "typeorm";

/** An entity class a data source is built from; TypeORM reads its `@Entity`. */
export type GraphEntity = new (...args: never[]) => object;

/** A `@Tree` entity a pick can choose: its class, and the table TypeORM maps it to. */
export interface GraphTreeCandidate {
  /** The entity class, which the command reads its metadata by once connected. */
  readonly entity: GraphEntity;

  /** The unqualified table name the entity maps to. */
  readonly tableName: string;
}

/** What the tree pick reads: the entity classes, the naming strategy, and the options. */
export interface GraphTreePick {
  /** The entity classes the `--entities` globs imported. */
  readonly entities: readonly GraphEntity[];

  /** The `--entities` globs, named in the error when no tree matches. */
  readonly globs: readonly string[];

  /** The strategy that maps each entity's name to its table name. */
  readonly namingStrategy: NamingStrategyInterface;

  /** The table `--table` names, or `undefined` to pick the only tree. */
  readonly table: string | undefined;
}
