import { Module } from "@nestjs/common";

import { AspectsModule } from "../aspects/aspects.module";
import { AnnualSolarCycleModule } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.module";
import { EclipsesModule } from "../perfective/modules/eclipses/eclipses.module";
import { IngressesModule } from "../perfective/modules/ingresses/ingresses.module";
import { MonthlyLunarCycleModule } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.module";
import { PhasesModule } from "../perfective/modules/phases/phases.module";
import { RetrogradesModule } from "../perfective/modules/retrogrades/retrogrades.module";
import { TwilightsModule } from "../perfective/modules/twilights/twilights.module";

import { ProgressiveService } from "./progressive.service";

/**
 * NestJS module orchestrating progressive (span) event detection.
 * Imports all event sub-modules and exposes {@link ProgressiveService} which converts
 * instantaneous events into time-spanning progressive events.
 */
@Module({
  controllers: [],
  exports: [ProgressiveService],
  imports: [
    AnnualSolarCycleModule,
    AspectsModule,
    EclipsesModule,
    IngressesModule,
    MonthlyLunarCycleModule,
    PhasesModule,
    RetrogradesModule,
    TwilightsModule,
  ],
  providers: [ProgressiveService],
})
export class ProgressiveModule {}
