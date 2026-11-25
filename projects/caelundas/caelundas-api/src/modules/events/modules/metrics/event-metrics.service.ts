import { Inject, Injectable } from "@nestjs/common";

import { EventsService } from "../../events.service";
import { EventFilterService } from "../filtering/event-filter.service";
import { TAG_FIELD_PREFIX } from "../filtering/modules/query-building/event-filter-fields.constants";
import { UUID_PATTERN } from "../filtering/modules/values/event-filter-values.constants";
import { EventGroupingService } from "../grouping/event-grouping.service";

import {
  METRIC_COLUMN_PREFIX,
  metricRowSchema,
  metricValueSchema,
  TAG_NAMES_SQL,
  tagNameRowSchema,
} from "./event-metrics.constants";
import { factsRowSchema } from "./modules/facts/event-metrics-facts.constants";
import { EventMetricsFactsService } from "./modules/facts/event-metrics-facts.service";
import { toMeasuredRows } from "./modules/facts/event-metrics-facts.utilities";
import { EventMetricsQueryService } from "./modules/query-building/event-metrics-query.service";
import { rollupZoneSchema } from "./modules/rollups/event-metrics-rollup.constants";
import {
  compileRollupGuard,
  compileRollupRead,
  findRollupTarget,
  isRollupRequest,
} from "./modules/rollups/event-metrics-rollup.utilities";
import {
  buildMetricTree,
  toMetricValues,
} from "./modules/tree/event-metrics-tree.utilities";

import type { EventGroupLevel } from "../grouping/event-grouping.types";
import type { PeriodInput } from "../windows/period-input.entities";
import type {
  EventMetricsQueryRequest,
  EventMetricsRow,
  MetricsPeriod,
} from "./event-metrics.types";
import type {
  CompiledFactsQuery,
  MeasuredRows,
} from "./modules/facts/event-metrics-facts.types";
import type { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";
import type { EventMetricsResultEntity } from "./modules/results/event-metrics-result.entities";

/**
 * Measures the events in a period and filter, over the whole set and over the
 * tree of groups a grouping makes of them, a SQL statement a level.
 */
@Injectable()
export class EventMetricsService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventsService) private readonly eventsService: EventsService,
    @Inject(EventFilterService)
    private readonly filterService: EventFilterService,
    @Inject(EventGroupingService)
    private readonly groupingService: EventGroupingService,
    @Inject(EventMetricsFactsService)
    private readonly factsService: EventMetricsFactsService,
    @Inject(EventMetricsQueryService)
    private readonly queryService: EventMetricsQueryService,
  ) {}

  // 🔏 Private Methods

  /**
   * The facts statement for a request the rollups do not wholly cover, or none
   * when the facts cannot answer it either.
   */
  private compileFacts(
    request: EventMetricsQueryRequest,
    zone: null | string,
  ): CompiledFactsQuery | null {
    const covered =
      zone !== null &&
      request.grouping.every(
        (_, level) => findRollupTarget({ ...request, level }) !== null,
      );

    return covered ? null : this.factsService.compile(request);
  }

  /**
   * The zone the rollups answer in, when they hold the periods exactly as the
   * events do.
   */
  private async findZone(
    request: EventMetricsQueryRequest,
  ): Promise<null | string> {
    if (!isRollupRequest(request)) {
      return null;
    }

    const { parameters, sql } = compileRollupGuard(request);
    const [row] = await this.eventsService.select(
      sql,
      parameters,
      rollupZoneSchema,
    );

    return row?.timezone ?? null;
  }

  /**
   * Measures the whole set and every level: with the facts in one statement,
   * else with a statement each over the rollups or the events.
   */
  private async measure(
    request: EventMetricsQueryRequest,
    zone: null | string,
  ): Promise<MeasuredRows> {
    const facts = this.compileFacts(request, zone);

    if (facts !== null) {
      const rows = await this.eventsService.selectTuned(
        facts.sql,
        facts.parameters,
        factsRowSchema,
      );

      return toMeasuredRows(rows, { ...facts, metrics: request.metrics });
    }

    const [total, levels] = await Promise.all([
      this.readRows(request, zone),
      Promise.all(
        request.grouping.map(async (_, level) =>
          this.readRows({ ...request, level }, zone),
        ),
      ),
    ]);

    return { levels, total };
  }

  /**
   * Names the tags a "No …" group is called after, one statement for all.
   */
  private async readNames(
    grouping: readonly EventGroupLevel[],
  ): Promise<Map<string, string>> {
    const ids = new Set<string>();

    for (const level of grouping) {
      const id =
        level.parent ??
        (level.field.startsWith(TAG_FIELD_PREFIX)
          ? level.field.slice(TAG_FIELD_PREFIX.length)
          : "");

      if (UUID_PATTERN.test(id)) {
        ids.add(id);
      }
    }

    if (ids.size === 0) {
      return new Map();
    }

    const rows = await this.eventsService.select(
      TAG_NAMES_SQL,
      [[...ids]],
      tagNameRowSchema,
    );

    return new Map(rows.map(({ id, name }) => [id, name]));
  }

  /**
   * Runs one metrics statement, over the rollups where they answer it and over
   * the events where not, and reads each row's metric columns.
   */
  private async readRows(
    request: EventMetricsQueryRequest,
    zone: null | string,
  ): Promise<EventMetricsRow[]> {
    const rollup = zone === null ? null : compileRollupRead(request, zone);
    const { parameters, sql } = rollup ?? this.queryService.compile(request);
    const rows = await this.eventsService.selectTuned(
      sql,
      parameters,
      metricRowSchema,
    );

    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      orderKey: row.orderKey,
      parentId: row.parent_id,
      path: row.path,
      period: row.period,
      values: request.metrics.map((_, index) =>
        metricValueSchema.parse(row[`${METRIC_COLUMN_PREFIX}${String(index)}`]),
      ),
    }));
  }

  /**
   * The period as ISO text, and the one of equal length right before it.
   */
  private toPeriods(
    period: PeriodInput,
    compare: boolean,
  ): { current: MetricsPeriod; previous: MetricsPeriod | null } {
    const start = new Date(period.start);
    const end = new Date(period.end);
    const before = new Date(start.getTime() * 2 - end.getTime());

    return {
      current: { end: end.toISOString(), start: start.toISOString() },
      previous: compare
        ? { end: start.toISOString(), start: before.toISOString() }
        : null,
    };
  }

  // 🌎 Public Methods

  /**
   * The metrics over every matching event and over each group of the tree.
   */
  public async findMetrics(
    input: EventMetricsInputEntity,
  ): Promise<EventMetricsResultEntity> {
    const compare = input.compareToPrevious === true;
    const metrics = [...new Set(input.metrics)];
    const grouping = this.groupingService.parse({
      levels: input.grouping ?? [],
    });
    const { current, previous } = this.toPeriods(input.period, compare);
    const base: EventMetricsQueryRequest = {
      filter: this.filterService.parse(input.filter),
      grouping,
      metrics,
      period: current,
      previous,
      tagRoot: input.tagRoot ?? null,
    };
    const zone = await this.findZone(base);
    const [{ levels: rows, total }, names, dataset] = await Promise.all([
      this.measure(base, zone),
      this.readNames(grouping),
      this.eventsService.describeDataset(),
    ]);

    return {
      groups: buildMetricTree({
        compare,
        levels: grouping,
        metrics,
        names,
        rows,
      }),
      timezone: dataset?.timezone ?? "UTC",
      total: toMetricValues(metrics, {
        compare,
        current: total.find(({ period }) => period === 0)?.values,
        previous: total.find(({ period }) => period === 1)?.values,
      }),
    };
  }
}
