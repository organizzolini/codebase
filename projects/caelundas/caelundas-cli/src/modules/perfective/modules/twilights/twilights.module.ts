import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { TwilightsEdgesService } from "./modules/edges/twilights-edges.service";
import { TwilightsBuilderService } from "./twilights-builder.service";
import { TwilightsComposerService } from "./twilights-composer.service";
import { TwilightsDetectorService } from "./twilights-detector.service";
import { TwilightsService } from "./twilights.service";

/**
 * NestJS module for solar twilight event detection.
 * Exports {@link TwilightsService} which identifies astronomical, nautical, and civil
 * dawn and dusk transitions based on solar depression angles, and
 * {@link TwilightsEdgesService}, which finds the ones a window cuts off.
 */
@Module({
  controllers: [],
  exports: [TwilightsEdgesService, TwilightsService],
  imports: [
    BoundarySearchModule,
    EphemerisModule,
    MathModule,
    ProgressiveUtilitiesModule,
  ],
  providers: [
    TwilightsBuilderService,
    TwilightsComposerService,
    TwilightsDetectorService,
    TwilightsEdgesService,
    TwilightsService,
  ],
})
export class TwilightsModule {}
