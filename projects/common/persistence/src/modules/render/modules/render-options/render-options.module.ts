import { Module } from "@nestjs/common";

import { RenderOptionsService } from "./render-options.service";

/**
 * Registers the RenderOptionsService, which validates the connection, entity,
 * table, and cap options every graph command shares before anything connects.
 */
@Module({
  controllers: [],
  exports: [RenderOptionsService],
  imports: [],
  providers: [RenderOptionsService],
})
export class RenderOptionsModule {}
