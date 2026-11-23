// 🏷️ Types

import type { GraphEntity } from "../graph-entities/graph-entities.types";
import type {
  GraphOptions,
  GraphPlan,
} from "../graph-options/graph-options.types";
import type { DataSource } from "typeorm";

/** Options `render-tree-data` receives. The graph options are validated by the command. */
export interface RenderTreeDataCommandOptions extends GraphOptions {
  /** Check the options and list the entity files, without connecting to a database. */
  readonly dryRun?: boolean | undefined;
}

/** The plan `render-tree-data` runs, which is a graph plan. */
export type RenderTreeDataPlan = GraphPlan;

/** The connection and picked entity a run reads through. */
export interface RenderTreeDataTarget {
  /** The connection the tree is read through. */
  readonly dataSource: DataSource;

  /** The `@Tree` entity class the run draws. */
  readonly picked: GraphEntity;
}
