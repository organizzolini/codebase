import { Module } from "@nestjs/common";

import { AspectsModule } from "../aspects/aspects.module";
import { AnnualSolarCycleEdgesService } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle-edges.service";
import { AnnualSolarCycleModule } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.module";
import { DailyCyclesEdgesService } from "../perfective/modules/daily-cycles/daily-cycles-edges.service";
import { DailyCyclesModule } from "../perfective/modules/daily-cycles/daily-cycles.module";
import { EclipsesEdgesService } from "../perfective/modules/eclipses/eclipses-edges.service";
import { EclipsesModule } from "../perfective/modules/eclipses/eclipses.module";
import { IngressesModule } from "../perfective/modules/ingresses/ingresses.module";
import { MonthlyLunarCycleEdgesService } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle-edges.service";
import { MonthlyLunarCycleModule } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.module";
import { PhasesEdgesService } from "../perfective/modules/phases/phases-edges.service";
import { PhasesModule } from "../perfective/modules/phases/phases.module";
import { RetrogradesModule } from "../perfective/modules/retrogrades/retrogrades.module";
import { TwilightsEdgesService } from "../perfective/modules/twilights/modules/edges/twilights-edges.service";
import { TwilightsModule } from "../perfective/modules/twilights/twilights.module";

import { EDGE_EVENTS_FINDERS_TOKEN } from "./progressive.constants";
import { ProgressiveService } from "./progressive.service";

import type { EdgeEventsFinder } from "../ephemeris/modules/boundary-search/boundary-search.types";

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
    DailyCyclesModule,
    EclipsesModule,
    IngressesModule,
    MonthlyLunarCycleModule,
    PhasesModule,
    RetrogradesModule,
    TwilightsModule,
  ],
  providers: [
    {
      inject: [
        AnnualSolarCycleEdgesService,
        DailyCyclesEdgesService,
        EclipsesEdgesService,
        MonthlyLunarCycleEdgesService,
        PhasesEdgesService,
        TwilightsEdgesService,
      ],
      provide: EDGE_EVENTS_FINDERS_TOKEN,
      useFactory: (...finders: EdgeEventsFinder[]): EdgeEventsFinder[] =>
        finders,
    },
    ProgressiveService,
  ],
})
export class ProgressiveModule {}
