import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { CalendarEventEntity } from "./calendar-event.entities";
import { EventFacetEntity } from "./event-facet.entities";
import { EventFilterGroupEntity } from "./event-filter.entities";
import { parseEventFilter } from "./event-filter.utilities";
import { EventsWindowInput } from "./events-window-input.entities";
import { EVENT_FILTER_ARGUMENT_DESCRIPTION } from "./events.constants";
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
   * The events that overlap a window and meet a filter.
   */
  @Query(() => [CalendarEventEntity], {
    description:
      "The events that overlap a window and meet the filter, earliest first, each with its tags.",
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
  ): Promise<CalendarEventEntity[]> {
    return this.eventsService.findEvents(window, parseEventFilter(filter));
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
  // 🖋️ Mutations
  // 🔗 Relations
}
