import { Module } from "@nestjs/common";

import { GraphEdgesService } from "./graph-edges.service";

/**
 * Registers the GraphEdgesService, which reads a `@DirectedAcyclicGraph` entity's edges as a
 * graph model, paged and capped, for the render commands to draw.
 */
@Module({
  controllers: [],
  exports: [GraphEdgesService],
  imports: [],
  providers: [GraphEdgesService],
})
export class GraphEdgesModule {}
