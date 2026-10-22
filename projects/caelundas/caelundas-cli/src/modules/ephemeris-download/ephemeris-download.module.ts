import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { EphemerisDownloadCommand } from "./ephemeris-download.command";
import { EphemerisDownloadService } from "./ephemeris-download.service";

/** Downloads the Swiss Ephemeris data files. */
@Module({
  controllers: [],
  exports: [EphemerisDownloadCommand, EphemerisDownloadService],
  imports: [LoggerModule],
  providers: [EphemerisDownloadCommand, EphemerisDownloadService],
})
export class EphemerisDownloadModule {}
