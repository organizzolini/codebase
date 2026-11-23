import { Injectable } from "@nestjs/common";

import { renderGraphMermaid } from "./graph-mermaid.utilities";

import type {
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphModel,
} from "./graph-mermaid.types";

/**
 * Draws graph models as Mermaid flowcharts for the command line's commands.
 */
@Injectable()
export class GraphMermaidService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Draws `graph` as Mermaid; see `renderGraphMermaid` for its rules. */
  render(
    graph: GraphModel,
    options?: GraphMermaidOptions,
  ): GraphMermaidRendering {
    return renderGraphMermaid(graph, options);
  }
}
