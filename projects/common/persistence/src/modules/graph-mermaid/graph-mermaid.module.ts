import { Module } from "@nestjs/common";

import { GraphMermaidService } from "./graph-mermaid.service";

/**
 * Provides the Mermaid renderer to the command line's graph commands.
 */
@Module({
  controllers: [],
  exports: [GraphMermaidService],
  imports: [],
  providers: [GraphMermaidService],
})
export class GraphMermaidModule {}
