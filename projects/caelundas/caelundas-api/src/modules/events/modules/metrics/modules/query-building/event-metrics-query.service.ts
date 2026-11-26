import { Inject, Injectable } from "@nestjs/common";

import { EventFilterService } from "../../../filtering/event-filter.service";
import { EventFilterParametersService } from "../../../filtering/modules/query-building/event-filter-parameters.service";
import { compileEventScope } from "../../../filtering/modules/query-building/event-scope.utilities";
import { UUID_PATTERN } from "../../../filtering/modules/values/event-filter-values.constants";
import { EventGroupingService } from "../../../grouping/event-grouping.service";
import { METRIC_COLUMN_PREFIX } from "../../event-metrics.constants";
import { EventMetric } from "../inputs/event-metric.entities";

import {
  EVENT_METRIC_SQL,
  EVENT_METRICS_SQL,
  METRIC_LEVEL_SQL,
  METRIC_REFINING_LEVEL_SQL,
  TAG_ROOT_SQL,
} from "./event-metrics-sql.constants";

import type { EventFilterParameters } from "../../../filtering/event-filter.types";
import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type {
  CompiledEventMetricsQuery,
  EventMetricsQueryRequest,
  LevelJoin,
  MetricsPeriod,
} from "../../event-metrics.types";

/**
 * Compiles the statement that measures the groups of one level, or the whole
 * set, over the events in a period and its previous one.
 */
@Injectable()
export class EventMetricsQueryService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventFilterService)
    private readonly filterService: EventFilterService,
    @Inject(EventGroupingService)
    private readonly groupingService: EventGroupingService,
    @Inject(EventFilterParametersService)
    private readonly parametersService: EventFilterParametersService,
  ) {}

  // 🔏 Private Methods

  /**
   * The lateral join of one level, refining the one before it where it names a parent.
   */
  private compileLevel(
    join: LevelJoin,
    parameters: EventFilterParameters,
  ): string {
    const { grouping, index, source } = join;
    const level = grouping[index];
    const before = grouping[index - 1];
    const refines =
      level?.parent !== undefined && before?.field === level.field;
    const parentEffective =
      index === 0 ? "null::text" : `l${String(index - 1)}.effective`;
    const parentId = index === 0 ? "''::text" : `l${String(index - 1)}.id`;
    const template = refines ? METRIC_REFINING_LEVEL_SQL : METRIC_LEVEL_SQL;

    const compiled = template
      .replaceAll("{level}", String(index))
      .replaceAll("{parentEffective}", parentEffective)
      .replaceAll("{parentId}", parentId)
      .replace("{source}", () => source);

    return refines
      ? compiled.replace("{parent}", () =>
          this.parametersService.bind(parameters, level.parent),
        )
      : compiled;
  }

  /**
   * The lateral joins of every level up to the one measured.
   */
  private compileLevels(
    grouping: readonly EventGroupLevel[],
    parameters: EventFilterParameters,
  ): string {
    const compiled = this.groupingService.compileSources(
      grouping,
      parameters.values.length,
    );
    let sql = "";

    parameters.values.push(...compiled.parameters);

    for (const [index, source] of compiled.sources.entries()) {
      sql += this.compileLevel({ grouping, index, source }, parameters);
    }

    return sql;
  }

  /**
   * One metric column per metric asked for, binding the tag root when counted.
   */
  private compileMetrics(
    request: EventMetricsQueryRequest,
    parameters: EventFilterParameters,
  ): string {
    let sql = "";
    let root = "";

    if (
      request.tagRoot !== null &&
      request.metrics.includes(EventMetric.UNIQUE_TAGS)
    ) {
      // A root that is no tag id has no tags beneath it, as a null matches.
      const bound = this.parametersService.bind(
        parameters,
        UUID_PATTERN.test(request.tagRoot) ? request.tagRoot : null,
      );

      root = TAG_ROOT_SQL.replaceAll("{root}", bound);
    }

    for (const [index, metric] of request.metrics.entries()) {
      sql += `,\n    (${EVENT_METRIC_SQL[metric].replace("{tagRoot}", () => root)})::float8 as ${METRIC_COLUMN_PREFIX}${String(index)}`;
    }

    return sql;
  }

  /**
   * One row of the `periods` list, numbered by whether it is the current or previous.
   */
  private compilePeriod(
    period: MetricsPeriod,
    index: number,
    parameters: EventFilterParameters,
  ): string {
    const start = this.parametersService.bind(parameters, period.start);
    const end = this.parametersService.bind(parameters, period.end);

    return `(${String(index)}, ${start}::timestamptz, ${end}::timestamptz)`;
  }

  /**
   * Binds the periods as the rows of the `periods` list.
   */
  private compilePeriods(
    request: EventMetricsQueryRequest,
    parameters: EventFilterParameters,
  ): string {
    const rows: string[] = [];

    for (const [index, period] of [
      request.period,
      request.previous,
    ].entries()) {
      if (period !== null) {
        rows.push(this.compilePeriod(period, index, parameters));
      }
    }

    return rows.join(", ");
  }

  /**
   * The columns that identify a group and what to group by, for a level.
   */
  private describeLevel(level: number): { columns: string; groupBy: string } {
    const alias = `l${String(level)}`;
    const parentId = level === 0 ? "''::text" : `l${String(level - 1)}.id`;
    const fields = ["key", "label", "path", "rank"]
      .map((field) => `${alias}."${field}"`)
      .join(", ");

    return {
      columns: `,\n    ${alias}.id as id, ${parentId} as parent_id, ${alias}."key" as "key", ${alias}.label as label, ${alias}."path" as "path", ${alias}."rank" as "rank"`,
      groupBy: `, ${alias}.id${level === 0 ? "" : `, ${parentId}`}, ${fields}`,
    };
  }

  // 🌎 Public Methods

  /**
   * Compiles the statement for one level, or for the whole set when the
   * request names none.
   */
  public compile(request: EventMetricsQueryRequest): CompiledEventMetricsQuery {
    const parameters: EventFilterParameters = { offset: 0, values: [] };
    const periods = this.compilePeriods(request, parameters);
    const filter = this.filterService.compile(
      request.filter,
      parameters.values.length,
    );

    parameters.values.push(...(filter?.parameters ?? []));

    const { level } = request;
    const levels =
      level === undefined
        ? ""
        : this.compileLevels(request.grouping.slice(0, level + 1), parameters);
    const { columns, groupBy } =
      level === undefined
        ? { columns: "", groupBy: "" }
        : this.describeLevel(level);
    const metrics = this.compileMetrics(request, parameters);
    const where =
      level === undefined ? "" : ` where not l${String(level)}.skipped`;

    return {
      parameters: parameters.values,
      sql: EVENT_METRICS_SQL.replace("{scope}", () =>
        compileEventScope(request.scope, "e.id"),
      )
        .replace("{periods}", () => periods)
        .replace("{filter}", () => (filter === null ? "" : `and ${filter.sql}`))
        .replace("{columns}", () => columns + metrics)
        .replace("{levels}", () => levels)
        .replace("{where}", () => where)
        .replace("{groupBy}", () => groupBy),
    };
  }
}
