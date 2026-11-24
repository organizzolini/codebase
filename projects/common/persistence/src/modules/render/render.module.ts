import { Module } from "@nestjs/common";

import { RenderMermaidModule } from "./modules/render-mermaid/render-mermaid.module";
import { RenderService } from "./render.service";

/**
 * Registers the RenderService, which connects, reads, and draws a graph
 * for the render commands, over the Mermaid renderer.
 */
@Module({
  controllers: [],
  exports: [RenderService],
  imports: [RenderMermaidModule],
  providers: [RenderService],
})
export class RenderModule {}
