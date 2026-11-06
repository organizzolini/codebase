import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { CalendarEventEntity } from "./calendar-event.entities";
import { EventsWindowInput } from "./events-window-input.entities";
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
   * The events that overlap a window.
   */
  @Query(() => [CalendarEventEntity], {
    description:
      "The events that overlap a window, earliest first, each with its tags.",
    name: "events",
  })
  public async events(
    @Arguments("window", { type: () => EventsWindowInput })
    window: EventsWindowInput,
  ): Promise<CalendarEventEntity[]> {
    return this.eventsService.findEvents(window);
  }
  // 🖋️ Mutations
  // 🔗 Relations
}
