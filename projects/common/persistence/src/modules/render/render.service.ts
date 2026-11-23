import { Injectable } from "@nestjs/common";

import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";
import { renderGraphMarkdown } from "../graph-mermaid/graph-mermaid.utilities";
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
    graph: GraphModel,
    rendering: GraphMermaidRendering,
  ): string[] {
    const { json, markdown } = plan.outputs;
    const files: GraphOutputFile[] = [];
    if (markdown !== undefined) {
      files.push({ content: renderGraphMarkdown(rendering), path: markdown });
    }
    if (json !== undefined) {
      files.push({ content: renderGraphJson(graph), path: json });
    }

    if (files.length === 0) process.stdout.write(`${rendering.diagram}\n`);
    writeGraphOutputs(files, { overwrite: plan.outputs.overwrite });
    for (const warning of rendering.warnings) {
      process.stderr.write(`⚠️ ${warning}\n`);
    }
    return files.map((file) => graphRenderWroteMessage(file.path));
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
      const graph = await drawing.read();
      const rendering = this.graphMermaid.render(graph, {
        direction: drawing.direction,
      });
      return this.emit(plan, graph, rendering);
    } catch (error) {
      throw maskedError(error, plan.connection.password);
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
