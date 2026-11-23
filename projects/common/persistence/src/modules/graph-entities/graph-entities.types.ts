// 🏷️ Types

import type { EntityMetadata } from "typeorm";

/** An entity class a data source is built from; TypeORM reads its `@Entity`. */
export type GraphEntity = new (...args: never[]) => object;

/** The metadata a tree pick reads: the entity, its table, and its tree storage. */
export type GraphTreeCandidate = Pick<
  EntityMetadata,
  "name" | "tableName" | "treeType"
>;
