import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { CharacteristicsResolver } from "./characteristics.resolver";
import { CharacteristicsService } from "./characteristics.service";

/**
 * Serves the `characteristics` query from the catalog and value-count tables
 * `MeanderawDatabaseModule` opens.
 */
@Module({
  controllers: [],
  exports: [CharacteristicsService],
  imports: [MeanderawDatabaseModule],
  providers: [CharacteristicsResolver, CharacteristicsService],
})
export class CharacteristicsModule {}
