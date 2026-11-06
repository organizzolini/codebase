import { Module } from "@nestjs/common";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";

import { TagsModule } from "../tags/tags.module";

import { CalendarEventsService } from "./calendar-events.service";

/**
 * Stores the events a run detects and reads them back by range and
 * location. Exports {@link CalendarEventsService}.
 */
@Module({
  controllers: [],
  exports: [CalendarEventsService],
  imports: [CaelundasDatabaseModule, TagsModule],
  providers: [CalendarEventsService],
})
export class CalendarEventsModule {}
