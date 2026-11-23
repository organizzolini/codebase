import { Module } from "@nestjs/common";

import { GraphMermaidModule } from "../graph-mermaid/graph-mermaid.module";

import { GraphRenderService } from "./graph-render.service";

/**
 * Registers the GraphRenderService, which connects, reads, and draws a graph
 * for the render commands, over the Mermaid renderer.
 */
@Module({
  controllers: [],
  exports: [GraphRenderService],
  imports: [GraphMermaidModule],
  providers: [GraphRenderService],
})
export class GraphRenderModule {}
