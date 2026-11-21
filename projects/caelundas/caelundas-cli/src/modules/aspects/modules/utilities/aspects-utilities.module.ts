import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { AspectCalculationSupportService } from "../calculation/aspect-calculation-support.service";
import { AspectEphemerisService } from "../calculation/aspect-ephemeris.service";
import { AspectGraphService } from "../calculation/aspect-graph.service";
import { CompoundPhaseService } from "../compound-phases/compound-phase.service";
import { ProgressiveCompoundEventService } from "../compound-phases/progressive-compound-event.service";
import { AspectEventFormattingService } from "../formatting/aspect-event-formatting.service";
import { AspectPhaseEmojiService } from "../formatting/aspect-phase-emoji.service";

import { AspectsUtilitiesService } from "./aspects-utilities.service";

/**
 * NestJS module providing core aspect detection utilities.
 * Exports {@link AspectsUtilitiesService} for orb checking and aspect-phase classification.
 */
@Module({
  controllers: [],
  exports: [
    AspectEphemerisService,
    AspectCalculationSupportService,
    AspectEventFormattingService,
    AspectPhaseEmojiService,
    AspectGraphService,
    AspectsUtilitiesService,
    CompoundPhaseService,
    ProgressiveCompoundEventService,
  ],
  imports: [EphemerisModule, MathModule],
  providers: [
    AspectEphemerisService,
    AspectCalculationSupportService,
    AspectEventFormattingService,
    AspectPhaseEmojiService,
    AspectGraphService,
    AspectsUtilitiesService,
    CompoundPhaseService,
    ProgressiveCompoundEventService,
  ],
})
export class AspectsUtilitiesModule {}
