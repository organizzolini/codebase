// 🏷️ Types

/** The Mermaid diagram drawn: a file tree or a flowchart. */
export type GraphDiagram = "filetree" | "flowchart";

/** A connection from `source` to `target`, by node id. */
export interface GraphEdge {
  /** Text drawn on the edge. */
  readonly label?: string;

  /** The id of the node the edge starts from. */
  readonly source: string;

  /** The id of the node the edge ends at. */
  readonly target: string;

  /** A finite number drawn on the edge, after its label. */
  readonly weight?: number;
}

/** Layout options for the Mermaid flowchart. */
export interface GraphMermaidOptions {
  /** The diagram to draw; defaults to `flowchart`. A file tree ignores `direction`. */
  readonly diagram?: GraphDiagram;

  /** The flowchart direction; defaults to `LR`. */
  readonly direction?: "BT" | "LR" | "RL" | "TB";
}

/** A rendered Mermaid flowchart and the warnings about its limits. */
export interface GraphMermaidRendering {
  /** The Mermaid source, starting with its `flowchart` or `treeView-beta` header. */
  readonly diagram: string;

  /** Model warnings followed by limit warnings for this diagram. */
  readonly warnings: readonly string[];
}

/** A tree or graph, normalized for rendering and JSON output. */
export interface GraphModel {
  /** Whether edges have a direction; undirected edges draw without arrows. */
  readonly directed: boolean;

  /** Every edge; each endpoint must name a node in `nodes`. */
  readonly edges: readonly GraphEdge[];

  /** Every node, including those no edge touches. */
  readonly nodes: readonly GraphNode[];

  /** Notes the producer of the model attached, carried into the output. */
  readonly warnings: readonly string[];
}

/** A weakly connected group of nodes, drawn as one Mermaid subgraph. */
export interface GraphNeighborhood {
  /** The edges whose endpoints are in `nodes`, in model order. */
  readonly edges: readonly GraphEdge[];

  /** The nodes, in model order. */
  readonly nodes: readonly GraphNode[];

  /** The subgraph drawn around it; absent for a lone neighborhood. */
  readonly subgraph?: GraphSubgraph;
}

/** A vertex of a graph, identified by a model-defined `id`. */
export interface GraphNode {
  /** Unique within the graph; never drawn, so it may be any text. */
  readonly id: string;

  /** The text drawn inside the node. */
  readonly label: string;

  /** Styles the node as a root or as a "… N more" truncation node. */
  readonly marker?: GraphNodeMarker;
}

/** A node's role in the drawing, if it has one. */
export type GraphNodeMarker = "root" | "truncation";

/** The Mermaid subgraph a neighborhood is drawn in. */
export interface GraphSubgraph {
  /** The Mermaid id, `nb<position>`. */
  readonly id: string;

  /** The text drawn as its title. */
  readonly title: string;
}

/** A node whose children a cap hid. */
export interface GraphTreeTruncation {
  /** The number of children the cap hid. */
  readonly hidden: number;

  /** The flag whose cap hid them. */
  readonly limit: "--truncate-breadth" | "--truncate-depth";

  /** The cap's value. */
  readonly maximum: number;

  /** The id of the node whose children were hidden. */
  readonly parent: string;
}
