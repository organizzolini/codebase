// 🏷️ Types

import type {
  GraphOptions,
  GraphPlan,
} from "../graph-options/graph-options.types";

/** Options `render-tree-data` receives. The graph options are validated by the command. */
export interface RenderTreeDataCommandOptions extends GraphOptions {
  /** Check the options and list the entity files, without connecting to a database. */
  readonly dryRun?: boolean | undefined;
}

/** The plan `render-tree-data` runs, which is a graph plan. */
export type RenderTreeDataPlan = GraphPlan;
