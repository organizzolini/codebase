import { Module } from "@nestjs/common";

import { RenderEntitiesService } from "./render-entities.service";

/**
 * Registers the RenderEntitiesService, which resolves a graph command's entity
 * globs, imports their entity classes, and picks the tree to draw from them.
 */
@Module({
  controllers: [],
  exports: [RenderEntitiesService],
  imports: [],
  providers: [RenderEntitiesService],
})
export class RenderEntitiesModule {}
