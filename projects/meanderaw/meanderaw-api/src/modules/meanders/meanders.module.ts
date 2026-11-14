import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeandersResolver } from "./meanders.resolver";
import { MeandersService } from "./meanders.service";

/**
 * Serves the `meanders` query from the tables `MeanderawDatabaseModule` opens.
 */
@Module({
  controllers: [],
  exports: [MeandersService],
  imports: [MeanderawDatabaseModule],
  providers: [MeandersResolver, MeandersService],
})
export class MeandersModule {}
