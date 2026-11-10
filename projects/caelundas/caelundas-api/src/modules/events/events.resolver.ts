import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { CalendarEventEntity } from "./calendar-event.entities";
import { EventFacetEntity } from "./event-facet.entities";
import { EventFilterGroupEntity } from "./event-filter.entities";
import { parseEventFilter } from "./event-filter.utilities";
import { EventGroupingEntity } from "./event-grouping.entities";
import { parseEventGrouping } from "./event-grouping.utilities";
import {
  EVENT_FILTER_ARGUMENT_DESCRIPTION,
  EVENT_GROUPING_ARGUMENT_DESCRIPTION,
} from "./events.constants";
import { EventsDatasetEntity } from "./events.entities";
import { EventsService } from "./events.service";
import { PeriodInput } from "./period-input.entities";
import { PresetEntity } from "./preset.entities";
import { DEFAULT_PRESET_ID } from "./presets.constants";
import { WindowsArguments } from "./windows-arguments.entities";
import { WindowsEntity } from "./windows.entities";

/**
 * Serves the dataset, events and facets queries over the Caelundas Postgres.
 */
@Resolver()
export class EventsResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventsService) private readonly eventsService: EventsService,
  ) {}
  // 🔎 Queries

  /**
   * The span and zone of the whole dataset.
   */
  @Query(() => EventsDatasetEntity, {
    description:
      "The span the whole dataset covers and the zone its events were computed in, or null when it is empty.",
    name: "dataset",
    nullable: true,
  })
  public async dataset(): Promise<EventsDatasetEntity | null> {
    return this.eventsService.describeDataset();
  }

  /**
   * The preset the calendar opens on.
   */
  @Query(() => PresetEntity, {
    description:
      "The preset the calendar opens on, or null when the data has none of the tags it names.",
    name: "defaultPreset",
    nullable: true,
  })
  public async defaultPreset(): Promise<null | PresetEntity> {
    const presets = await this.eventsService.findPresets();

    return presets.find(({ id }) => id === DEFAULT_PRESET_ID) ?? null;
  }

  /**
   * The events that overlap a period and meet a filter.
   */
  @Query(() => [CalendarEventEntity], {
    description:
      "The events that overlap a period and meet the filter, earliest first, each with its tags and the group keys it falls in at each grouping level.",
    name: "events",
  })
  public async events(
    @Arguments("period", { type: () => PeriodInput })
    period: PeriodInput,
    @Arguments("filter", {
      description: EVENT_FILTER_ARGUMENT_DESCRIPTION,
      nullable: true,
      type: () => EventFilterGroupEntity,
    })
    filter?: EventFilterGroupEntity | null,
    @Arguments("grouping", {
      description: EVENT_GROUPING_ARGUMENT_DESCRIPTION,
      nullable: true,
      type: () => EventGroupingEntity,
    })
    grouping?: EventGroupingEntity | null,
  ): Promise<CalendarEventEntity[]> {
    return this.eventsService.findEvents(
      period,
      parseEventFilter(filter),
      parseEventGrouping(grouping),
    );
  }

  /**
   * The tag facets, counted over a period.
   */
  @Query(() => [EventFacetEntity], {
    description:
      "Every tag root and the tags beneath it, each counting the events that overlap the period and meet the filter, or every event when none is given.",
    name: "facets",
  })
  public async facets(
    @Arguments("period", { nullable: true, type: () => PeriodInput })
    period?: PeriodInput,
    @Arguments("filter", {
      description: EVENT_FILTER_ARGUMENT_DESCRIPTION,
      nullable: true,
      type: () => EventFilterGroupEntity,
    })
    filter?: EventFilterGroupEntity | null,
  ): Promise<EventFacetEntity[]> {
    return this.eventsService.findFacets(period, parseEventFilter(filter));
  }

  /**
   * The named presets.
   */
  @Query(() => [PresetEntity], {
    description:
      "The named filters the calendar offers, resolved against the tags the data has: a preset naming tags the data lacks applies to the ones it has, and one none of whose tags exist is left out.",
    name: "presets",
  })
  public async presets(): Promise<PresetEntity[]> {
    return this.eventsService.findPresets();
  }

  /**
   * The days a view shows and the period to read events for.
   */
  @Query(() => WindowsEntity, {
    description:
      "The days a calendar view or a timeline scale shows around a day, and the period of events to read for them, a day wider either side: pass it to events and facets so only the span the view draws is read.",
    name: "windows",
  })
  public windows(@Arguments() args: WindowsArguments): WindowsEntity {
    return this.eventsService.findWindows(args);
  }
  // 🖋️ Mutations
  // 🔗 Relations
}
