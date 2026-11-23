import { Module } from "@nestjs/common";

import { RenderNodesService } from "./render-nodes.service";

/**
 * Registers the RenderNodesService, which reads the labels a drawn graph's
 * nodes and neighborhoods carry, for the edge reader to apply.
 */
@Module({
  controllers: [],
  exports: [RenderNodesService],
  imports: [],
  providers: [RenderNodesService],
})
export class RenderNodesModule {}
