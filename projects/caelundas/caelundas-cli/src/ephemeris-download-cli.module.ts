import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { EphemerisDownloadModule } from "./modules/ephemeris-download/ephemeris-download.module";

/**
 * The root of the ephemeris download application: the download command and
 * nothing that touches the database, so it runs on a machine with none.
 */
@Module({
  imports: [DiscoveryModule, LoggerModule, EphemerisDownloadModule],
})
export class EphemerisDownloadCliModule {}
