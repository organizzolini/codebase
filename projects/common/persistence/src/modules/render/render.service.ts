import { Injectable } from "@nestjs/common";

import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";
import { renderGraphPagesMarkdown } from "../graph-mermaid/graph-mermaid.utilities";
import {
  renderGraphJson,
  writeGraphOutputs,
} from "../graph-options/graph-options-outputs.utilities";
import { maskedError } from "../graph-options/graph-options.utilities";

import { graphRenderWroteMessage } from "./render.constants";

import type {
  GraphMermaidRendering,
  GraphModel,
} from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphOutputFile,
  GraphPlan,
} from "../graph-options/graph-options.types";
import type { GraphDrawing } from "./render.types";

/**
 * Draws a graph a render command reads: connects, reads, renders it as Mermaid,
 * then writes the diagram to stdout, or to the files the plan names, with the
 * warnings on stderr.
 */
@Injectable()
export class RenderService {
  // 🏗 Dependency Injection

  constructor(private readonly graphMermaid: GraphMermaidService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Writes the diagram to stdout, or to the named files, then warnings to stderr; returns a line per file. */
  private emit(
    plan: GraphPlan,
    graphs: readonly GraphModel[],
    renderings: readonly GraphMermaidRendering[],
  ): string[] {
    const { json, markdown } = plan.outputs;
    const files: GraphOutputFile[] = [];
    if (markdown !== undefined) {
      files.push({
        content: renderGraphPagesMarkdown(renderings),
        path: markdown,
      });
    }
    if (json !== undefined) {
      const [only] = graphs;
      const content =
        graphs.length === 1 && only !== undefined
          ? renderGraphJson(only)
          : `${JSON.stringify(graphs, null, 2)}\n`;
      files.push({ content, path: json });
    }

    if (files.length === 0) {
      const diagrams = renderings.map(({ diagram }) => diagram);
      process.stdout.write(`${diagrams.join("\n\n")}\n`);
    }
    writeGraphOutputs(files, { overwrite: plan.outputs.overwrite });
    for (const { warnings } of renderings) {
      for (const warning of warnings) process.stderr.write(`⚠️ ${warning}\n`);
    }
    return files.map((file) => graphRenderWroteMessage(file.path));
  }

  /** Reads the page `--page` names, or every page of `--limit` roots when it is left out. */
  private async readPages(
    plan: GraphPlan,
    drawing: GraphDrawing,
  ): Promise<GraphModel[]> {
    const { paging } = plan;
    if (!paging?.all) return [await drawing.read(paging)];
    const graphs: GraphModel[] = [];
    for (let page = 1; ; page += 1) {
      const graph = await drawing.read({ ...paging, page });
      if (page === 1 || graph.nodes.length > 0) graphs.push(graph);
      if (graph.nodes.length === 0) return graphs;
    }
  }

  // 🌎 Public Methods

  /**
   * Connects, reads, and draws the graph, returning a line naming each file written.
   * @throws Error with the password masked.
   */
  async render(plan: GraphPlan, drawing: GraphDrawing): Promise<string[]> {
    const { dataSource } = drawing;
    try {
      await dataSource.initialize();
      const graphs = await this.readPages(plan, drawing);
      const renderings: GraphMermaidRendering[] = [];
      for (const graph of graphs) {
        renderings.push(
          this.graphMermaid.render(graph, { direction: drawing.direction }),
        );
      }
      return this.emit(plan, graphs, renderings);
    } catch (error) {
      throw maskedError(error, plan.connection.password);
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
