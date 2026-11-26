import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { EventMetricsService } from "./event-metrics.service";
import { EventMetricCatalogEntity } from "./modules/catalog/event-metrics-catalog.entities";
import { EventMetricsCatalogService } from "./modules/catalog/event-metrics-catalog.service";
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
    @Inject(EventMetricsCatalogService)
    private readonly catalogService: EventMetricsCatalogService,
    @Inject(EventMetricsService)
    private readonly metricsService: EventMetricsService,
  ) {}

  // 🔎 Queries

  /**
   * The measures and the metrics a metrics query may name.
   */
  @Query(() => EventMetricCatalogEntity, {
    description:
      "The metrics an eventMetrics query may name by slug, with each one's name, icon, note, unit and whether its groups add up to their parent, and the measures they are built from. Read from the metrics and measures tables.",
    name: "eventMetricCatalog",
  })
  public async eventMetricCatalog(): Promise<EventMetricCatalogEntity> {
    return this.catalogService.describe();
  }

  /**
   * The metrics over the whole set and each group.
   */
  @Query(() => EventMetricsResultEntity, {
    description:
      "Metrics, named by slug, computed in SQL over the events that overlap a period and meet a filter, as a whole and for each group of the grouping, nested a level each: every group measures its own distinct events, and an event in two groups of a level counts in both. Durations are in seconds, a start is epoch milliseconds, and a percent runs from 0 to 100. At most 500 subgroups a group are returned.",
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
