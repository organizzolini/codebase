import { Module } from "@nestjs/common";

import { GraphMermaidModule } from "../graph-mermaid/graph-mermaid.module";

import { RenderService } from "./render.service";

/**
 * Registers the RenderService, which connects, reads, and draws a graph
 * for the render commands, over the Mermaid renderer.
 */
@Module({
  controllers: [],
  exports: [RenderService],
  imports: [GraphMermaidModule],
  providers: [RenderService],
})
export class RenderModule {}
