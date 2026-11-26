import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { PhaseCalculationService } from "./modules/calculation/phase-calculation.service";
import { ElongationSpansService } from "./modules/elongation/elongation-spans.service";
import { MartianPhaseService } from "./modules/martian/martian-phase.service";
import { MercurianPhaseService } from "./modules/mercurian/mercurian-phase.service";
import { VenusianPhaseService } from "./modules/venusian/venusian-phase.service";
import { PhasesEdgesService } from "./phases-edges.service";
import { PhasesService } from "./phases.service";

/**
 * NestJS module for inner-planet phase event detection.
 * Exports {@link PhasesService} which identifies Venus, Mercury, and Mars phase events
 * such as maximum elongation, maximum brightness, and morning/evening visibility transitions,
 * and {@link PhasesEdgesService}, which finds the ones a window cuts off.
 */
@Module({
  controllers: [],
  exports: [PhasesEdgesService, PhasesService],
  imports: [
    BoundarySearchModule,
    EphemerisModule,
    MathModule,
    ProgressiveUtilitiesModule,
  ],
  providers: [
    ElongationSpansService,
    PhaseCalculationService,
    VenusianPhaseService,
    MercurianPhaseService,
    MartianPhaseService,
    PhasesEdgesService,
    PhasesService,
  ],
})
export class PhasesModule {}
