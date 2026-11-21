import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { PhaseCalculationService } from "./modules/calculation/phase-calculation.service";
import { MartianPhaseService } from "./modules/martian/martian-phase.service";
import { MercurianPhaseService } from "./modules/mercurian/mercurian-phase.service";
import { VenusianPhaseService } from "./modules/venusian/venusian-phase.service";
import { PhasesService } from "./phases.service";

/**
 * NestJS module for inner-planet phase event detection.
 * Exports {@link PhasesService} which identifies Venus, Mercury, and Mars phase events
 * such as maximum elongation, maximum brightness, and morning/evening visibility transitions.
 */
@Module({
  controllers: [],
  exports: [PhasesService],
  imports: [EphemerisModule, MathModule, ProgressiveUtilitiesModule],
  providers: [
    PhaseCalculationService,
    VenusianPhaseService,
    MercurianPhaseService,
    MartianPhaseService,
    PhasesService,
  ],
})
export class PhasesModule {}
