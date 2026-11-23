import { Module } from "@nestjs/common";

import { RenderTreesService } from "./render-trees.service";

/**
 * Registers the RenderTreesService, which reads a `@Tree` entity's rows as a
 * graph model, for the tree render command to draw.
 */
@Module({
  controllers: [],
  exports: [RenderTreesService],
  imports: [],
  providers: [RenderTreesService],
})
export class RenderTreesModule {}
