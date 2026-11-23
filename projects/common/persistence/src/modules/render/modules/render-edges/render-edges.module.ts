import { Module } from "@nestjs/common";

import { RenderEdgesService } from "./render-edges.service";

/**
 * Registers the RenderEdgesService, which reads a `@DirectedAcyclicGraph` entity's edges as a
 * graph model, paged and capped, for the render commands to draw.
 */
@Module({
  controllers: [],
  exports: [RenderEdgesService],
  imports: [],
  providers: [RenderEdgesService],
})
export class RenderEdgesModule {}
