import { Module } from "@nestjs/common";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventFilterCalendarFieldsService } from "./filters/event-filter-calendar-fields.service";
import { EventFilterNumbersService } from "./filters/event-filter-numbers.service";
import { EventFilterParametersService } from "./filters/event-filter-parameters.service";
import { EventFilterValuesService } from "./filters/event-filter-values.service";
import { EventFilterService } from "./filters/event-filter.service";
import { EventGroupingService } from "./grouping/event-grouping.service";
import { PresetsService } from "./presets/presets.service";
import { WindowsService } from "./windows/windows.service";

/**
 * Events module: reads the calendar's events, tag facets and dataset span
 * from the Caelundas Postgres, through the connection that
 * `CaelundasDatabaseModule` opens.
 */
@Module({
  controllers: [],
  exports: [EventsService],
  imports: [],
  providers: [
    EventFilterCalendarFieldsService,
    EventFilterNumbersService,
    EventFilterParametersService,
    EventFilterService,
    EventFilterValuesService,
    EventGroupingService,
    EventsResolver,
    EventsService,
    PresetsService,
    WindowsService,
  ],
})
export class EventsModule {}
