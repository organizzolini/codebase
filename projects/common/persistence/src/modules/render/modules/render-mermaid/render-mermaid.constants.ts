// ♟️ Constants

/** Mermaid's maximum number of edges in one diagram. */
export const RENDER_MERMAID_MAXIMUM_EDGES = 500;

/** Mermaid's maximum diagram text, in characters. */
export const RENDER_MERMAID_MAXIMUM_CHARACTERS = 50_000;

/** The share of a limit at which a warning starts. */
export const RENDER_MERMAID_WARNING_THRESHOLD = 0.9;

/** The indent of every line under the `flowchart` header. */
export const RENDER_MERMAID_INDENT = "    ";

/** The `classDef` a root node is styled with. */
export const RENDER_MERMAID_ROOT_CLASS = "root";

/** The `classDef` a truncation node is styled with. */
export const RENDER_MERMAID_TRUNCATION_CLASS = "truncation";

/** The style lines every diagram declares, one per marked class. */
export const RENDER_MERMAID_CLASS_DEFINITIONS: readonly string[] = [
  `classDef ${RENDER_MERMAID_ROOT_CLASS} fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px`,
  `classDef ${RENDER_MERMAID_TRUNCATION_CLASS} fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5`,
];
