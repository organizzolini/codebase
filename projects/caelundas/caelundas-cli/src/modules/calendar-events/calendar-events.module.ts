import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";

import { CalendarEventsService } from "./calendar-events.service";

/**
 * Stores the events a run detects and reads them back by range and
 * location. Exports {@link CalendarEventsService}.
 */
@Module({
  controllers: [],
  exports: [CalendarEventsService],
  imports: [DatabaseModule],
  providers: [CalendarEventsService],
})
export class CalendarEventsModule {}
