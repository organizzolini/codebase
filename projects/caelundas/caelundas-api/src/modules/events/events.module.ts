import { Module } from "@nestjs/common";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventFilterService } from "./modules/filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "./modules/filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "./modules/filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "./modules/filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "./modules/filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "./modules/grouping/event-grouping.service";
import { PresetsService } from "./modules/presets/presets.service";
import { WindowsService } from "./modules/windows/windows.service";

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
