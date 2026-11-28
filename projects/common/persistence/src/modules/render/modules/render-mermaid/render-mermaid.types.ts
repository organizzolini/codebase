// 🏷️ Types

/** How the file tree places each node, from one walk. */
export interface FileTreePlan {
  /** Each node's parents, in edge order. */
  readonly parents: ReadonlyMap<string, readonly string[]>;

  /** Each node's children, those it is the place of. */
  readonly placed: ReadonlyMap<string, readonly string[]>;

  /** The nodes drawn at the top level. */
  readonly roots: readonly string[];
}

/** Where a file tree line sits and how it is drawn. */
export interface FileTreePosition {
  /** The guides that start the line's children's lines. */
  readonly below: string;

  /** The branch drawn before the label. */
  readonly branch: string;

  /** The guides drawn before the branch. */
  readonly lead: string;

  /** The parent it is drawn under, none for a root. */
  readonly under: string | undefined;
}

/** What drawing the file tree reads and fills. */
export interface FileTreeView {
  /** The lines drawn so far. */
  readonly lines: string[];

  /** Every node, by id. */
  readonly nodes: ReadonlyMap<string, GraphNode>;

  /** The placement of each node. */
  readonly plan: FileTreePlan;
}

/** What a flowchart is drawn with, worked out once. */
export interface FlowchartContext {
  /** Whether edges have arrowheads. */
  readonly directed: boolean;

  /** The flowchart direction, also set inside each subgraph. */
  readonly direction: NonNullable<GraphMermaidOptions["direction"]>;

  /** Each node id's short id and declaration. */
  readonly nodes: ReadonlyMap<string, FlowchartNode>;

  /** The ids of the nodes a directed graph gives several parents. */
  readonly shared: ReadonlySet<string>;
}

/** A flowchart being drawn: its context, and the nodes declared so far. */
export interface FlowchartDrawing extends FlowchartContext {
  /** The ids of the nodes already declared, so each is declared once. */
  readonly declared: Set<string>;
}

/** An undirected edge walked from `from` to `to`. */
export interface FlowchartLink {
  /** The edge. */
  readonly edge: GraphEdge;

  /** The id of the node the walk came from. */
  readonly from: string;

  /** The id of the node the walk reaches. */
  readonly to: string;
}

/** A node's short id and the text that declares it. */
export interface FlowchartNode {
  /** The id and the escaped label, with any icon and note beneath. */
  readonly declaration: string;

  /** `n<position>`. */
  readonly shortId: string;
}

/** The undirected edges, and the ones a walk has used. */
export interface FlowchartWalk {
  /** The edges. */
  readonly edges: readonly GraphEdge[];

  /** The positions of the edges each node id touches. */
  readonly incident: ReadonlyMap<string, readonly number[]>;

  /** The positions of the edges already in a trail. */
  readonly used: Set<number>;
}

/** The diagram drawn: a text file tree or a Mermaid flowchart. */
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

/** Neighborhoods drawn together as one section, and the position of the first. */
export interface GraphGroup {
  /** The neighborhoods, in order. */
  readonly neighborhoods: readonly GraphNeighborhood[];

  /** The position of the first among all the neighborhoods, which numbers its subgraph. */
  readonly start: number;
}

/** What a rendering is written in: Mermaid or text. */
export type GraphLanguage = "mermaid" | "text";

/** Layout options for the diagram. */
export interface GraphMermaidOptions {
  /** The diagram to draw; defaults to `flowchart`. A file tree ignores `direction`. */
  readonly diagram?: GraphDiagram;

  /** The flowchart direction; defaults to `LR`. */
  readonly direction?: "BT" | "LR" | "RL" | "TB";

  /** Also split the drawing into small sections, for a Markdown document with an index. */
  readonly sections?: boolean;
}

/** A rendered diagram and the warnings about its limits. */
export interface GraphMermaidRendering {
  /** The whole drawing: Mermaid source starting with its `flowchart` header, or a text tree. */
  readonly diagram: string;

  /** What `diagram` is written in. */
  readonly language: GraphLanguage;

  /** Present when `sections` was asked for: the drawing as small diagrams, in order. */
  readonly sections?: readonly GraphMermaidSection[];

  /** Model warnings followed by limit warnings for the diagrams. */
  readonly warnings: readonly string[];
}

/** A few neighborhoods drawn as one small diagram of a Markdown document. */
export interface GraphMermaidSection {
  /** The diagram of these neighborhoods, in the rendering's language. */
  readonly diagram: string;

  /** The titles of the neighborhoods drawn, in order. */
  readonly titles: readonly string[];
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

  /** Whether the title is the label every edge shares, so the edges draw without it. */
  readonly hideLabels: boolean;

  /** The nodes, in model order. */
  readonly nodes: readonly GraphNode[];

  /** The subgraph title and section heading. */
  readonly title: string;
}

/** A vertex of a graph, identified by a model-defined `id`. */
export interface GraphNode {
  /** A lucide icon slug, drawn with the note when the node has one. */
  readonly icon?: string;

  /** Unique within the graph; never drawn, so it may be any text. */
  readonly id: string;

  /** The text drawn inside the node. */
  readonly label: string;

  /** Styles the node as a root or as a "… N more" truncation node. */
  readonly marker?: GraphNodeMarker;

  /** A note on what the node means, drawn beneath its label in a flowchart and after it in a file tree. */
  readonly note?: string;
}

/** A node's role in the drawing, if it has one. */
export type GraphNodeMarker = "root" | "truncation";

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
