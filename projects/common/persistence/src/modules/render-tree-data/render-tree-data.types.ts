// 🏷️ Types

import type { GraphEntity } from "../graph-entities/graph-entities.types";
import type { GraphPlan } from "../graph-options/graph-options.types";
import type { DataSource } from "typeorm";

/** The plan `render-tree-data` runs, which is a graph plan. */
export type RenderTreeDataPlan = GraphPlan;

/** The connection and picked entity a run reads through. */
export interface RenderTreeDataTarget {
  /** The connection the tree is read through. */
  readonly dataSource: DataSource;

  /** The `@Tree` entity class the run draws. */
  readonly picked: GraphEntity;
}
