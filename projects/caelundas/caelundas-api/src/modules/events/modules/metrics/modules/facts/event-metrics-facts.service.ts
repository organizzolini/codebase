import { Inject, Injectable } from "@nestjs/common";

import { EventFilterService } from "../../../filtering/event-filter.service";
import { TAG_FIELD_PREFIX } from "../../../filtering/modules/query-building/event-filter-fields.constants";
import { EventFilterParametersService } from "../../../filtering/modules/query-building/event-filter-parameters.service";
import { compileFactsScope } from "../../../filtering/modules/query-building/event-scope.utilities";
import { UUID_PATTERN } from "../../../filtering/modules/values/event-filter-values.constants";
import { EventGroupingService } from "../../../grouping/event-grouping.service";
import { pinGrain } from "../../event-metrics.utilities";
import { EventMetric } from "../inputs/event-metric.entities";
import {
  DISTINCT_MEASURE_SQL,
  MEASURE_SQL,
} from "../measures/event-metrics-measures.constants";
import {
  findMeasures,
  isDistinctMeasure,
} from "../measures/event-metrics-measures.utilities";

import {
  FACTS_AGGREGATE_SQL,
  FACTS_CALENDAR_KEYS_SQL,
  FACTS_DIMENSION_SQL,
  FACTS_DISTINCT_SQL,
  FACTS_EVENTS_SQL,
  FACTS_LEVEL_SQL,
  FACTS_PICKED_KEYS_SQL,
  FACTS_TAG_ROOT_SQL,
  FACTS_TAGS_MATCHING_SQL,
} from "./event-metrics-facts.constants";

import type { EventFilterParameters } from "../../../filtering/event-filter.types";
import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type { EventMetricsQueryRequest } from "../../event-metrics.types";
import type {
  EventDistinctMeasure,
  EventMeasure,
} from "../measures/event-metrics-measures.types";
import type {
  CompiledFactsQuery,
  FactsLevel,
} from "./event-metrics-facts.types";

/**
 * Compiles every level of a request into one statement over the event facts,
 * each event measured once for each key path it falls under.
 */
@Injectable()
export class EventMetricsFactsService {
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
   * The CTEs that measure the whole set and each level, and count apart the
   * distinct values of the measures that need it.
   */
  private compileAggregates(
    levels: readonly FactsLevel[],
    measures: readonly EventMeasure[],
    tagsWhere: string,
  ): string {
    const columns = this.compileMeasures(measures);
    let sql = "";

    for (let level = -1; level < levels.length; level++) {
      const source = level < 0 ? "ev" : `x${String(level)}`;
      const suffix = level < 0 ? "_total" : String(level);
      const keys = this.listKeys(levels.length, level);

      sql += FACTS_AGGREGATE_SQL.replace("{suffix}", suffix)
        .replace("{level}", String(level))
        .replace("{keys}", () => keys.select)
        .replace("{leaf}", level < 0 ? "null::text" : `x.t${String(level)}`)
        .replace("{measures}", () => columns)
        .replace("{source}", source)
        .replace("{groupBy}", () => keys.groupBy);

      const own = this.listKeys(level + 1, level).groupBy;

      for (const name of measures.filter((measure) =>
        isDistinctMeasure(measure),
      )) {
        const { column, join } = DISTINCT_MEASURE_SQL[name];

        sql += FACTS_DISTINCT_SQL.replaceAll("{name}", name)
          .replace("{suffix}", suffix)
          .replace("{keys}", () => own)
          .replace("{column}", column)
          .replace("{source}", source)
          .replace("{join}", join)
          .replace("{where}", () => tagsWhere)
          .replaceAll("{outer}", () => own.replaceAll(", x.", ", z."));
      }
    }

    return sql;
  }

  /**
   * One level's source of keys, or none for a level the facts do not answer.
   */
  private compileLevel(
    level: EventGroupLevel,
    parameters: EventFilterParameters,
  ): FactsLevel | null {
    if (!level.field.startsWith(TAG_FIELD_PREFIX)) {
      const compiled = this.groupingService.compileSources(
        [level],
        parameters.values.length,
      );

      parameters.values.push(...compiled.parameters);

      return {
        keys: FACTS_CALENDAR_KEYS_SQL.replace(
          "{source}",
          () => compiled.sources[0] ?? "",
        ),
        picked: [],
      };
    }

    if (level.parent !== undefined || level.tags.length === 0) {
      return null;
    }

    // A pick that is no tag id matches nothing, as a tag the data lacks would.
    const picked = level.tags.filter((tag) => UUID_PATTERN.test(tag));

    return {
      keys: FACTS_PICKED_KEYS_SQL.replace("{tags}", () =>
        this.parametersService.bind(parameters, picked),
      ),
      picked,
    };
  }

  /**
   * Every level's source of keys, or none when one is out of the facts' reach.
   */
  private compileLevels(
    grouping: readonly EventGroupLevel[],
    parameters: EventFilterParameters,
  ): FactsLevel[] | null {
    const levels: FactsLevel[] = [];

    for (const level of grouping) {
      const compiled = this.compileLevel(level, parameters);

      if (compiled === null) {
        return null;
      }

      levels.push(compiled);
    }

    return levels;
  }

  /**
   * One column per measure, named `m_<measure>`.
   */
  private compileMeasures(measures: readonly EventMeasure[]): string {
    let sql = "";

    for (const measure of measures) {
      if (!isDistinctMeasure(measure)) {
        sql += `,\n      (${MEASURE_SQL[measure]})::float8 as "m_${measure}"`;
      }
    }

    return sql;
  }

  /**
   * The rows of the `periods` list, numbered current then previous.
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
        const start = this.parametersService.bind(parameters, period.start);
        const end = this.parametersService.bind(parameters, period.end);

        rows.push(
          `(${String(index)}, ${start}::timestamptz, ${end}::timestamptz)`,
        );
      }
    }

    return rows.join(", ");
  }

  /**
   * The steps that expand the events by each level's keys, one level a step.
   */
  private compileSteps(count: number): string {
    let sql = "";

    for (let level = 0; level < count; level++) {
      sql += FACTS_LEVEL_SQL.replaceAll("{level}", () => String(level)).replace(
        "{source}",
        level === 0 ? "ev" : `x${String(level - 1)}`,
      );
    }

    return sql;
  }

  /**
   * The condition limiting the unique tags to those beneath the tag root, or
   * none when the tags are not asked for or not limited.
   */
  private compileTagsWhere(
    request: EventMetricsQueryRequest,
    parameters: EventFilterParameters,
  ): string {
    if (
      request.tagRoot === null ||
      !request.metrics.includes(EventMetric.UNIQUE_TAGS)
    ) {
      return "";
    }

    // A root that is no tag id has no tags beneath it, as a null matches.
    const root = this.parametersService.bind(
      parameters,
      UUID_PATTERN.test(request.tagRoot) ? request.tagRoot : null,
    );

    return FACTS_TAG_ROOT_SQL.replaceAll("{root}", () => root);
  }

  /**
   * The select list and the group by of a level's key columns, the ones past
   * it null.
   */
  private listKeys(
    count: number,
    level: number,
  ): { groupBy: string; select: string } {
    let groupBy = "";
    let select = "";

    for (let index = 0; index < count; index++) {
      const key = `t${String(index)}`;

      if (index <= level) {
        groupBy += `, x.${key}`;
        select += `, x.${key}`;
      } else {
        select += `, null::text as ${key}`;
      }
    }

    return { groupBy, select };
  }

  /**
   * The union of every level's rows, each joined to the distinct counts.
   */
  private listUnions(
    count: number,
    distinct: readonly EventDistinctMeasure[],
  ): string {
    const parts: string[] = [];

    for (let level = -1; level < count; level++) {
      const suffix = level < 0 ? "_total" : String(level);
      let columns = "";
      let joins = "";

      for (const name of distinct) {
        const alias = `d_${name}`;

        columns += `, coalesce(${alias}.${name}, 0)::float8 as ${name}`;
        joins += ` left join ${name}${suffix} ${alias} on ${alias}.period = a.period`;

        for (let index = 0; index <= level; index++) {
          // A plain equality, which Postgres hashes; no key is "~null~".
          joins += ` and coalesce(${alias}.t${String(index)}, '~null~') = coalesce(a.t${String(index)}, '~null~')`;
        }
      }

      parts.push(`select a.*${columns} from a${suffix} a${joins}`);
    }

    return parts.join(" union all ");
  }

  // 🌎 Public Methods

  /**
   * The statement measuring the whole set and each level, or none when a
   * level is out of the facts' reach.
   */
  public compile(request: EventMetricsQueryRequest): CompiledFactsQuery | null {
    const parameters: EventFilterParameters = { offset: 0, values: [] };
    const levels = this.compileLevels(request.grouping, parameters);

    if (levels === null) {
      return null;
    }

    const periods = this.compilePeriods(request, parameters);
    const filter = this.filterService.compile(
      request.filter,
      parameters.values.length,
      FACTS_TAGS_MATCHING_SQL,
    );

    parameters.values.push(...(filter?.parameters ?? []));

    const measures = findMeasures(request.metrics);
    const tagsWhere = this.compileTagsWhere(request, parameters);
    const picked = levels.flatMap((level) => level.picked);
    const named = picked.length > 0;
    const dimension = named
      ? FACTS_DIMENSION_SQL.replace("{picked}", () =>
          this.parametersService.bind(parameters, picked),
        )
      : "";
    let keys = "";

    for (const [index, level] of levels.entries()) {
      keys += `, ${level.keys} as k${String(index)}`;
    }

    return {
      levels: levels.length,
      measures,
      parameters: parameters.values,
      sql: FACTS_EVENTS_SQL.replace(
        "{eventRows}",
        () =>
          `${pinGrain("f", "event")}${compileFactsScope(request.scope, "f")}`,
      )
        .replace("{periods}", () => periods)
        .replace("{keys}", () => keys)
        .replace("{where}", () =>
          filter === null ? "" : `where ${filter.sql}`,
        )
        .replace("{levels}", () => this.compileSteps(levels.length))
        .replace(
          "{aggregates}",
          () => this.compileAggregates(levels, measures, tagsWhere) + dimension,
        )
        .replace("{names}", () =>
          named
            ? `, d.tag_name as label, d.tag_path as path, d."rank" as "rank"`
            : `, null::text as label, null::text as path, null::text as "rank"`,
        )
        .replace("{union}", () =>
          this.listUnions(
            levels.length,
            measures.filter((measure) => isDistinctMeasure(measure)),
          ),
        )
        .replace("{dimension}", () =>
          named ? " left join dim d on d.key = r.leaf" : "",
        ),
    };
  }
}
