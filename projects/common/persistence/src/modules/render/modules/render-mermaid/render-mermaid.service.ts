import { Injectable } from "@nestjs/common";

import { renderGraphFileTree } from "./render-mermaid-file-tree.utilities";
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

  /**
   * Draws `graph` as the diagram `options` name: a flowchart by default, see
   * `renderGraphMermaid`, or a file tree, see `renderGraphFileTree`.
   */
  render(
    graph: GraphModel,
    options?: GraphMermaidOptions,
  ): GraphMermaidRendering {
    return options?.diagram === "filetree"
      ? renderGraphFileTree(graph, options)
      : renderGraphMermaid(graph, options);
  }
}
