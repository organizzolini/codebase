import { Module } from "@nestjs/common";

import { CalendarModule } from "../../../calendar/calendar.module";
import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";

import { DailyCyclesBuilderService } from "./daily-cycles-builder.service";
import { DailyCyclesEdgesService } from "./daily-cycles-edges.service";
import { DailyCyclesService } from "./daily-cycles.service";

/**
 * NestJS module for daily solar and lunar cycle event detection.
 * Exports {@link DailyCyclesService} which identifies sunrise, solar noon, sunset,
 * solar midnight, moonrise, lunar noon, moonset, and lunar midnight events, and
 * {@link DailyCyclesEdgesService}, which finds the moonrise or moonset a window cuts off.
 */
@Module({
  controllers: [],
  exports: [DailyCyclesEdgesService, DailyCyclesService],
  imports: [BoundarySearchModule, CalendarModule, EphemerisModule, MathModule],
  providers: [
    DailyCyclesBuilderService,
    DailyCyclesEdgesService,
    DailyCyclesService,
  ],
})
export class DailyCyclesModule {}
