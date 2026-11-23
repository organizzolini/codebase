import { Module } from "@nestjs/common";

import { GraphEntitiesService } from "./graph-entities.service";

/**
 * TODO: Document the graphEntities module.
 */
@Module({
  controllers: [],
  exports: [GraphEntitiesService],
  imports: [],
  providers: [GraphEntitiesService],
})
export class GraphEntitiesModule {}
