import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { CalendarEventEntity } from "./calendar-event.entities";
import { CalendarWindowsArguments } from "./calendar-windows-arguments.entities";
import { CalendarWindowsEntity } from "./calendar-windows.entities";
import { EventFacetEntity } from "./event-facet.entities";
import { EventFilterCollectionEntity } from "./event-filter-collection.entities";
import { DEFAULT_EVENT_FILTER_COLLECTION_ID } from "./event-filter-collections.constants";
import { EventFilterGroupEntity } from "./event-filter.entities";
import { parseEventFilter } from "./event-filter.utilities";
import { EventGroupingEntity } from "./event-grouping.entities";
import { parseEventGrouping } from "./event-grouping.utilities";
import { EventsWindowInput } from "./events-window-input.entities";
import {
  EVENT_FILTER_ARGUMENT_DESCRIPTION,
  EVENT_GROUPING_ARGUMENT_DESCRIPTION,
} from "./events.constants";
import { EventsDatasetEntity } from "./events.entities";
import { EventsService } from "./events.service";

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
   * The days a view shows and the window to read events for.
   */
  @Query(() => CalendarWindowsEntity, {
    description:
      "The days a calendar view or a timeline scale shows around a day, and the window of events to read for them, a day wider either side: pass it to events and facets so only the span the view draws is read.",
    name: "calendarWindows",
  })
  public calendarWindows(
    @Arguments() args: CalendarWindowsArguments,
  ): CalendarWindowsEntity {
    return this.eventsService.findCalendarWindows(args);
  }

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
   * The collection the calendar opens on.
   */
  @Query(() => EventFilterCollectionEntity, {
    description:
      "The filter collection the calendar opens on, or null when the data has none of the tags it names.",
    name: "defaultFilterCollection",
    nullable: true,
  })
  public async defaultFilterCollection(): Promise<EventFilterCollectionEntity | null> {
    const collections = await this.eventsService.findFilterCollections();

    return (
      collections.find(({ id }) => id === DEFAULT_EVENT_FILTER_COLLECTION_ID) ??
      null
    );
  }

  /**
   * The events that overlap a window and meet a filter.
   */
  @Query(() => [CalendarEventEntity], {
    description:
      "The events that overlap a window and meet the filter, earliest first, each with its tags and the group keys it falls in at each grouping level.",
    name: "events",
  })
  public async events(
    @Arguments("window", { type: () => EventsWindowInput })
    window: EventsWindowInput,
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
      window,
      parseEventFilter(filter),
      parseEventGrouping(grouping),
    );
  }

  /**
   * The tag facets, counted over a window.
   */
  @Query(() => [EventFacetEntity], {
    description:
      "Every tag root and the tags beneath it, each counting the events that overlap the window and meet the filter, or every event when none is given.",
    name: "facets",
  })
  public async facets(
    @Arguments("window", { nullable: true, type: () => EventsWindowInput })
    window?: EventsWindowInput,
    @Arguments("filter", {
      description: EVENT_FILTER_ARGUMENT_DESCRIPTION,
      nullable: true,
      type: () => EventFilterGroupEntity,
    })
    filter?: EventFilterGroupEntity | null,
  ): Promise<EventFacetEntity[]> {
    return this.eventsService.findFacets(window, parseEventFilter(filter));
  }

  /**
   * The named filter collections.
   */
  @Query(() => [EventFilterCollectionEntity], {
    description:
      "The named filters the calendar offers, resolved against the tags the data has: a collection naming tags the data lacks applies to the ones it has, and one none of whose tags exist is left out.",
    name: "filterCollections",
  })
  public async filterCollections(): Promise<EventFilterCollectionEntity[]> {
    return this.eventsService.findFilterCollections();
  }
  // 🖋️ Mutations
  // 🔗 Relations
}
