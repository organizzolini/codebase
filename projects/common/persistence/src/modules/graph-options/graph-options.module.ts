import { Module } from "@nestjs/common";

import { GraphOptionsService } from "./graph-options.service";

/**
 * Registers the GraphOptionsService, which validates the connection, entity,
 * table, and cap options every graph command shares before anything connects.
 */
@Module({
  controllers: [],
  exports: [GraphOptionsService],
  imports: [],
  providers: [GraphOptionsService],
})
export class GraphOptionsModule {}
