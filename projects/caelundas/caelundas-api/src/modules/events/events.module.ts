import { Module } from "@nestjs/common";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventFilterService } from "./modules/filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "./modules/filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "./modules/filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "./modules/filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "./modules/filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "./modules/grouping/event-grouping.service";
import { EventMetricsResolver } from "./modules/metrics/event-metrics.resolver";
import { EventMetricsService } from "./modules/metrics/event-metrics.service";
import { EventMetricsCatalogService } from "./modules/metrics/modules/catalog/event-metrics-catalog.service";
import { EventMetricsFactsService } from "./modules/metrics/modules/facts/event-metrics-facts.service";
import { EventMetricsQueryService } from "./modules/metrics/modules/query-building/event-metrics-query.service";
import { PresetsService } from "./modules/presets/presets.service";
import { TagFlagsService } from "./modules/tag-flags/tag-flags.service";
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
    EventMetricsCatalogService,
    EventMetricsFactsService,
    EventMetricsQueryService,
    EventMetricsResolver,
    EventMetricsService,
    EventsResolver,
    EventsService,
    PresetsService,
    TagFlagsService,
    WindowsService,
  ],
})
export class EventsModule {}
