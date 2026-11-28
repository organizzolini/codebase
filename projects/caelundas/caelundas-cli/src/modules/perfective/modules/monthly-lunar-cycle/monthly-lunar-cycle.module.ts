import { Module } from "@nestjs/common";

import { CalendarModule } from "../../../calendar/calendar.module";
import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";

import { LunarApsidesService } from "./lunar-apsides.service";
import { MonthlyLunarCycleEdgesService } from "./monthly-lunar-cycle-edges.service";
import { MonthlyLunarCycleService } from "./monthly-lunar-cycle.service";

/**
 * NestJS module for monthly lunar cycle event detection.
 * Exports {@link MonthlyLunarCycleService} which identifies the eight lunar phases
 * and, through {@link LunarApsidesService}, lunar apogee and perigee, and
 * {@link MonthlyLunarCycleEdgesService}, which finds the ones a window cuts off.
 */
@Module({
  controllers: [],
  exports: [MonthlyLunarCycleEdgesService, MonthlyLunarCycleService],
  imports: [BoundarySearchModule, CalendarModule, EphemerisModule],
  providers: [
    LunarApsidesService,
    MonthlyLunarCycleEdgesService,
    MonthlyLunarCycleService,
  ],
})
export class MonthlyLunarCycleModule {}
