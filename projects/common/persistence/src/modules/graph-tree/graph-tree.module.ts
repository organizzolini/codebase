import { Module } from "@nestjs/common";

import { GraphTreeService } from "./graph-tree.service";

/**
 * Registers the GraphTreeService, which reads a `@Tree` entity's rows as a
 * graph model, capped by depth and breadth, for the render commands to draw.
 */
@Module({
  controllers: [],
  exports: [GraphTreeService],
  imports: [],
  providers: [GraphTreeService],
})
export class GraphTreeModule {}
