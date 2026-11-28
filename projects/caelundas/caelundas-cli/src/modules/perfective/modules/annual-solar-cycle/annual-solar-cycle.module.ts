import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { AnnualSolarCycleEdgesService } from "./annual-solar-cycle-edges.service";
import { AnnualSolarCycleEventsService } from "./annual-solar-cycle-events.service";
import { AnnualSolarCycleService } from "./annual-solar-cycle.service";

/**
 * NestJS module for annual solar cycle event detection.
 * Exports {@link AnnualSolarCycleService} which identifies solstices, equinoxes,
 * cross-quarter days, hexadecans, and solar apsis (perihelion/aphelion), and
 * {@link AnnualSolarCycleEdgesService}, which finds the ones a window cuts off.
 */
@Module({
  controllers: [],
  exports: [AnnualSolarCycleEdgesService, AnnualSolarCycleService],
  imports: [BoundarySearchModule, EphemerisModule, ProgressiveUtilitiesModule],
  providers: [
    AnnualSolarCycleEdgesService,
    AnnualSolarCycleEventsService,
    AnnualSolarCycleService,
  ],
})
export class AnnualSolarCycleModule {}
