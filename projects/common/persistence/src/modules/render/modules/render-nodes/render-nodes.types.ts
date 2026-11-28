// 🏷️ Types

import type {
  GraphEdgeMetadata,
  GraphEntity,
} from "../render-entities/render-entities.types";

/** The picked edge entity and what its decorators described. */
export interface RenderNodesEdge {
  /** The decorators' description of the edge entity. */
  readonly edge: GraphEdgeMetadata;

  /** The edge entity class the run draws. */
  readonly picked: GraphEntity;
}

/** The labels a graph is drawn under. */
export interface RenderNodesLabels {
  /** The label of each node, by its id; a node with none keeps its id. */
  readonly nodes: ReadonlyMap<string, string>;

  /** The title of each label key, drawn on its edges. */
  readonly titles: ReadonlyMap<string, string>;
}
