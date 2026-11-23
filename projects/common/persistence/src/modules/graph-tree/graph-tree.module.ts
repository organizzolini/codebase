import { Module } from "@nestjs/common";

import { GraphTreeService } from "./graph-tree.service";

/**
 * TODO: Document the graphTree module.
 */
@Module({
  controllers: [],
  exports: [GraphTreeService],
  imports: [],
  providers: [GraphTreeService],
})
export class GraphTreeModule {}
