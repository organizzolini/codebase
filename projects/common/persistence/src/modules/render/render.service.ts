import { Injectable } from "@nestjs/common";

import { RenderMermaidService } from "./modules/render-mermaid/render-mermaid.service";
import { renderGraphPagesMarkdown } from "./modules/render-mermaid/render-mermaid.utilities";
import {
  renderGraphJson,
  writeGraphOutputs,
} from "./modules/render-options/render-options-outputs.utilities";
import { maskedError } from "./modules/render-options/render-options.utilities";
import { graphRenderWroteMessage } from "./render.constants";

import type {
  GraphMermaidRendering,
  GraphModel,
} from "./modules/render-mermaid/render-mermaid.types";
import type {
  GraphOutputFile,
  GraphPaging,
  GraphPlan,
} from "./modules/render-options/render-options.types";
import type { GraphDrawing, GraphPages } from "./render.types";

/**
 * Draws a graph a render command reads: connects, reads, renders it as Mermaid,
 * then writes the diagram to stdout, or to the files the plan names, with the
 * warnings on stderr.
 */
@Injectable()
export class RenderService {
  // 🏗 Dependency Injection

  constructor(private readonly renderMermaid: RenderMermaidService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Writes the diagram to stdout, or to the named files, then warnings to stderr; returns a line per file. */
  private emit(
    plan: GraphPlan,
    { graphs, headings }: GraphPages,
    renderings: readonly GraphMermaidRendering[],
  ): string[] {
    const { json, markdown } = plan.outputs;
    const files: GraphOutputFile[] = [];
    if (markdown !== undefined) {
      files.push({
        content: renderGraphPagesMarkdown(renderings, headings),
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

  /** Reads every page of `--limit` roots, stopping at the first past the last. */
  private async readEveryPage(
    paging: GraphPaging,
    drawing: GraphDrawing,
  ): Promise<GraphPages> {
    const graphs: GraphModel[] = [];
    for (let page = 1; ; page += 1) {
      const graph = await drawing.read({ ...paging, page });
      if (page === 1 || graph.nodes.length > 0) graphs.push(graph);
      if (graph.nodes.length === 0) break;
    }
    return {
      graphs,
      headings: graphs.map(
        (_, index) => `Page ${index + 1} of ${graphs.length}`,
      ),
    };
  }

  /** Reads each page `--page` names, or every page when it is left out. */
  private async readPages(
    plan: GraphPlan,
    drawing: GraphDrawing,
  ): Promise<GraphPages> {
    const { paging } = plan;
    if (paging?.all === true) return this.readEveryPage(paging, drawing);
    const named = paging?.pages ?? [];
    if (paging === undefined || named.length === 0) {
      return { graphs: [await drawing.read(paging)], headings: [] };
    }
    const graphs: GraphModel[] = [];
    for (const page of named) {
      graphs.push(await drawing.read({ ...paging, page }));
    }
    return { graphs, headings: named.map((page) => `Page ${page}`) };
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
      const pages = await this.readPages(plan, drawing);
      const renderings: GraphMermaidRendering[] = [];
      for (const graph of pages.graphs) {
        renderings.push(
          this.renderMermaid.render(graph, {
            diagram: plan.diagram,
            direction: drawing.direction,
          }),
        );
      }
      return this.emit(plan, pages, renderings);
    } catch (error) {
      throw maskedError(error, plan.connection.password);
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
