import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { DatabaseModule } from "../../database.module";

import { NightSkyCommand } from "./night-sky.command";
import { NightSkyService } from "./night-sky.service";

/**
 * Ingests the stars and constellations caelundas-web's night sky draws into
 * the caelundas database.
 */
@Module({
  controllers: [],
  exports: [NightSkyCommand, NightSkyService],
  imports: [LoggerModule, DatabaseModule],
  providers: [NightSkyCommand, NightSkyService],
})
export class NightSkyModule {}
