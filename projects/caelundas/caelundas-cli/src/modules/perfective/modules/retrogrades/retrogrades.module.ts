import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { RetrogradesService } from "./retrogrades.service";

/**
 * NestJS module for planetary retrograde event detection.
 * Exports {@link RetrogradesService} which identifies when planets reverse apparent direction,
 * and the retrograde and direct periods between.
 */
@Module({
  controllers: [],
  exports: [RetrogradesService],
  imports: [
    BoundarySearchModule,
    EphemerisModule,
    MathModule,
    ProgressiveUtilitiesModule,
  ],
  providers: [RetrogradesService],
})
export class RetrogradesModule {}
