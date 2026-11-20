import { Module } from "@nestjs/common";

import { AspectsModule } from "../aspects/aspects.module";
import { EphemerisModule } from "../ephemeris/ephemeris.module";
import { DatetimeModule } from "../ephemeris/modules/datetime/datetime.module";

import { AnnualSolarCycleModule } from "./modules/annual-solar-cycle/annual-solar-cycle.module";
import { DailyCyclesModule } from "./modules/daily-cycles/daily-cycles.module";
import { EclipsesModule } from "./modules/eclipses/eclipses.module";
import { IngressesModule } from "./modules/ingresses/ingresses.module";
import { MonthlyLunarCycleModule } from "./modules/monthly-lunar-cycle/monthly-lunar-cycle.module";
import { PhasesModule } from "./modules/phases/phases.module";
import { RetrogradesModule } from "./modules/retrogrades/retrogrades.module";
import { TwilightsModule } from "./modules/twilights/twilights.module";
import { PerfectiveService } from "./perfective.service";

/**
 * NestJS module orchestrating per-minute astronomical event detection.
 * Imports all event sub-modules and exposes {@link PerfectiveService} which iterates
 * minute-by-minute over a date range to detect all perfective (instantaneous) events.
 */
@Module({
  controllers: [],
  exports: [PerfectiveService],
  imports: [
    DatetimeModule,
    EphemerisModule,
    AspectsModule,
    EclipsesModule,
    RetrogradesModule,
    IngressesModule,
    DailyCyclesModule,
    MonthlyLunarCycleModule,
    AnnualSolarCycleModule,
    TwilightsModule,
    PhasesModule,
  ],
  providers: [PerfectiveService],
})
export class PerfectiveModule {}
