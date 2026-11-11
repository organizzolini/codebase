// ♟️ Constants

/** Placeholder diagram for a project with no modules. */
export const MODULE_GRAPH_UNCONNECTED =
  "_This project defines no NestJS modules to graph._";

/** Mermaid diagram type and direction the graph is rendered as. */
export const MODULE_GRAPH_MERMAID_HEADER = "flowchart LR";

/** Legend explaining the rounded-node convention for an ambient module. */
export const MODULE_GRAPH_AMBIENT_LEGEND =
  "_Rounded modules are global: every module can inject them, so their edges are left out._";

/** Smallest graph the ambient rule fires on; smaller ones have normal hubs. */
export const MODULE_GRAPH_AMBIENT_MINIMUM_MODULES = 4;
