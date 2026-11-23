// 🏷️ Types

/** The labels a graph is drawn under. */
export interface RenderNodesLabels {
  /** The label of each node, by its id; a node with none keeps its id. */
  readonly nodes: ReadonlyMap<string, string>;

  /** The title of each graph, by its key, drawn on its edges. */
  readonly titles: ReadonlyMap<string, string>;
}
