import { Module } from "@nestjs/common";

import { CalendarService } from "./calendar.service";

/**
 * NestJS module providing the instant event builder.
 * Exports {@link CalendarService} for detectors that report one-minute events.
 */
@Module({
  controllers: [],
  exports: [CalendarService],
  imports: [],
  providers: [CalendarService],
})
export class CalendarModule {}
