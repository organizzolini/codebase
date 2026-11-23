import { Module } from "@nestjs/common";

import { GraphDagService } from "./graph-dag.service";

/**
 * Registers the GraphDagService, which reads a `@Dag` entity's edges as a
 * graph model, paged and capped, for the render commands to draw.
 */
@Module({
  controllers: [],
  exports: [GraphDagService],
  imports: [],
  providers: [GraphDagService],
})
export class GraphDagModule {}
