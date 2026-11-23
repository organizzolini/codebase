import { Module } from "@nestjs/common";

import { GraphOptionsService } from "./graph-options.service";

/**
 * TODO: Document the graphOptions module.
 */
@Module({
  controllers: [],
  exports: [GraphOptionsService],
  imports: [],
  providers: [GraphOptionsService],
})
export class GraphOptionsModule {}
