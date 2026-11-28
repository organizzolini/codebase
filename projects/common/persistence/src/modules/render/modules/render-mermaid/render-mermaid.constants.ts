// ♟️ Constants

/** Mermaid's maximum number of edges in one diagram. */
export const RENDER_MERMAID_MAXIMUM_EDGES = 500;

/** Mermaid's maximum diagram text, in characters. */
export const RENDER_MERMAID_MAXIMUM_CHARACTERS = 50_000;

/** The share of a limit at which a warning starts. */
export const RENDER_MERMAID_WARNING_THRESHOLD = 0.9;

/** The indent of every line under the `flowchart` header. */
export const RENDER_MERMAID_INDENT = "    ";

/** The most nodes in a section before the next starts. */
export const RENDER_MERMAID_SECTION_NODES = 40;

/** The most distinct edge labels a title joins. */
export const RENDER_MERMAID_TITLE_LABELS = 3;

/** How many subgraphs sit side by side in a row. */
export const RENDER_MERMAID_GRID_COLUMNS = 3;

/** The `classDef` a root node is styled with. */
export const RENDER_MERMAID_ROOT_CLASS = "root";

/** The `classDef` a node with several parents is styled with. */
export const RENDER_MERMAID_SHARED_CLASS = "shared";

/** The `classDef` a truncation node is styled with. */
export const RENDER_MERMAID_TRUNCATION_CLASS = "truncation";

/** The style of each class, in the order the classes are declared. */
export const RENDER_MERMAID_CLASS_STYLES = [
  [RENDER_MERMAID_ROOT_CLASS, "fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px"],
  [RENDER_MERMAID_SHARED_CLASS, "fill:#fff4e5,stroke:#e8710a,stroke-width:2px"],
  [
    RENDER_MERMAID_TRUNCATION_CLASS,
    "fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
  ],
] as const;

/** The branch drawn before a file tree entry that has later siblings. */
export const RENDER_MERMAID_TREE_BRANCH = "├── ";

/** The branch before a file tree entry that is last. */
export const RENDER_MERMAID_TREE_LAST_BRANCH = "└── ";

/** The guide drawn under a file tree entry that has later siblings. */
export const RENDER_MERMAID_TREE_GUIDE = "│   ";

/** The gap under a file tree entry that is last. */
export const RENDER_MERMAID_TREE_GAP = "    ";
