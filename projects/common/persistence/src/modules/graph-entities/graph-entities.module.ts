import { Module } from "@nestjs/common";

import { GraphEntitiesService } from "./graph-entities.service";

/**
 * Registers the GraphEntitiesService, which resolves a graph command's entity
 * globs, imports their entity classes, and picks the tree to draw from them.
 */
@Module({
  controllers: [],
  exports: [GraphEntitiesService],
  imports: [],
  providers: [GraphEntitiesService],
})
export class GraphEntitiesModule {}
