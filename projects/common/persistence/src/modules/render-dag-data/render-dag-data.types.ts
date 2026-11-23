// 🏷️ Types

import type { GraphEntity } from "../graph-entities/graph-entities.types";
import type { GraphPlan } from "../graph-options/graph-options.types";
import type { DataSource } from "typeorm";

/** The plan `render-dag-data` runs, which is a graph plan. */
export type RenderDagDataPlan = GraphPlan;

/** The connection and picked entity a run reads through. */
export interface RenderDagDataTarget {
  /** The connection the DAG is read through. */
  readonly dataSource: DataSource;

  /** The `@Dag` entity class the run draws. */
  readonly picked: GraphEntity;
}
