import { Module } from "@nestjs/common";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import { AspectsModule } from "../aspects/aspects.module";
import { MajorAspectsModule } from "../aspects/modules/major-aspects/major-aspects.module";
import { MinorAspectsModule } from "../aspects/modules/minor-aspects/minor-aspects.module";
import { QuadrupleAspectsModule } from "../aspects/modules/quadruple-aspects/quadruple-aspects.module";
import { QuintupleAspectsModule } from "../aspects/modules/quintuple-aspects/quintuple-aspects.module";
import { SextupleAspectsModule } from "../aspects/modules/sextuple-aspects/sextuple-aspects.module";
import { SpecialtyAspectsModule } from "../aspects/modules/specialty-aspects/specialty-aspects.module";
import { StelliumModule } from "../aspects/modules/stellium/stellium.module";
import { TripleAspectsModule } from "../aspects/modules/triple-aspects/triple-aspects.module";
import { CalendarEventsModule } from "../calendar-events/calendar-events.module";
import { EphemerisModule } from "../ephemeris/ephemeris.module";
import { MathModule } from "../ephemeris/modules/math/math.module";
import { InputModule } from "../input/input.module";
import { AnnualSolarCycleModule } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.module";
import { DailyCyclesModule } from "../perfective/modules/daily-cycles/daily-cycles.module";
import { EclipsesModule } from "../perfective/modules/eclipses/eclipses.module";
import { IngressesModule } from "../perfective/modules/ingresses/ingresses.module";
import { MonthlyLunarCycleModule } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.module";
import { PhasesModule } from "../perfective/modules/phases/phases.module";
import { RetrogradesModule } from "../perfective/modules/retrogrades/retrogrades.module";
import { TwilightsModule } from "../perfective/modules/twilights/twilights.module";
import { PerfectiveModule } from "../perfective/perfective.module";
import { ProgressiveModule } from "../progressive/progressive.module";

import { CaelundasCommand } from "./caelundas.command";

/**
 * Root NestJS application module.
 *
 * Imports all domain modules and the global config module so that every
 * service can read environment variables via {@link ConfigService}.
 */
@Module({
  controllers: [],
  exports: [CaelundasCommand],
  imports: [
    LoggerModule,
    InputModule,
    MathModule,
    EphemerisModule,
    CaelundasDatabaseModule,
    CalendarEventsModule,
    AspectsModule,
    MajorAspectsModule,
    MinorAspectsModule,
    TripleAspectsModule,
    QuadrupleAspectsModule,
    QuintupleAspectsModule,
    SextupleAspectsModule,
    SpecialtyAspectsModule,
    StelliumModule,
    EclipsesModule,
    RetrogradesModule,
    IngressesModule,
    DailyCyclesModule,
    MonthlyLunarCycleModule,
    AnnualSolarCycleModule,
    TwilightsModule,
    PhasesModule,
    PerfectiveModule,
    ProgressiveModule,
  ],
  providers: [CaelundasCommand],
})
export class CaelundasModule {}
