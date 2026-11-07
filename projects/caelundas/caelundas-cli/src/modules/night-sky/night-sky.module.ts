import { Module } from "@nestjs/common";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import { NightSkyCommand } from "./night-sky.command";
import { NightSkyService } from "./night-sky.service";

/**
 * Ingests the stars and constellations caelundas-web's night sky draws into
 * the caelundas database.
 */
@Module({
  controllers: [],
  exports: [NightSkyCommand, NightSkyService],
  imports: [LoggerModule, CaelundasDatabaseModule],
  providers: [NightSkyCommand, NightSkyService],
})
export class NightSkyModule {}
