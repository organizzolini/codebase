import { Module } from "@nestjs/common";

import { RenderMermaidService } from "./render-mermaid.service";

/**
 * Provides the Mermaid renderer to the command line's graph commands.
 */
@Module({
  controllers: [],
  exports: [RenderMermaidService],
  imports: [],
  providers: [RenderMermaidService],
})
export class RenderMermaidModule {}
