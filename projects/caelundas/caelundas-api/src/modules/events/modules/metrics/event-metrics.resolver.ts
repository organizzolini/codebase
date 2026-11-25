import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { EventMetricsService } from "./event-metrics.service";
import { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";
import { EventMetricsResultEntity } from "./modules/results/event-metrics-result.entities";

/**
 * Serves the `eventMetrics` query: numbers computed in SQL over the groups of
 * the events a calendar shows.
 */
@Resolver()
export class EventMetricsResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventMetricsService)
    private readonly metricsService: EventMetricsService,
  ) {}

  // 🔎 Queries

  /**
   * The metrics over the whole set and each group.
   */
  @Query(() => EventMetricsResultEntity, {
    description:
      "Metrics computed in SQL over the events that overlap a period and meet a filter, as a whole and for each group of the grouping, nested a level each: every group measures its own distinct events, and an event in two groups of a level counts in both. At most 500 subgroups a group are returned.",
    name: "eventMetrics",
  })
  public async eventMetrics(
    @Arguments("input", { type: () => EventMetricsInputEntity })
    input: EventMetricsInputEntity,
  ): Promise<EventMetricsResultEntity> {
    return this.metricsService.findMetrics(input);
  }
  // 🖋️ Mutations
  // 🔗 Relations
}
