import { Injectable } from "@nestjs/common";

import { renderGraphMermaid } from "./render-mermaid.utilities";

import type {
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphModel,
} from "./render-mermaid.types";

/**
 * Draws graph models as Mermaid flowcharts for the command line's commands.
 */
@Injectable()
export class RenderMermaidService {
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
