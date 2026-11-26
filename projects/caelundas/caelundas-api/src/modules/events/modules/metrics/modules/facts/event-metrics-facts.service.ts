import { Inject, Injectable } from "@nestjs/common";

import { EventFilterService } from "../../../filtering/event-filter.service";
import { TAG_FIELD_PREFIX } from "../../../filtering/modules/query-building/event-filter-fields.constants";
import { EventFilterParametersService } from "../../../filtering/modules/query-building/event-filter-parameters.service";
import { compileFactsScope } from "../../../filtering/modules/query-building/event-scope.utilities";
import { UUID_PATTERN } from "../../../filtering/modules/values/event-filter-values.constants";
import { EventGroupingService } from "../../../grouping/event-grouping.service";
import { collectMeasures } from "../catalog/event-metrics-catalog.utilities";
import {
  compileEventAggregate,
  compileMetricColumns,
  isSideMeasure,
  listEventColumns,
} from "../measures/event-metrics-measures.utilities";

import {
  FACTS_AGGREGATE_SQL,
  FACTS_CALENDAR_KEYS_SQL,
  FACTS_DIMENSION_SQL,
  FACTS_DISTINCT_SQL,
  FACTS_EVENTS_SQL,
  FACTS_LEVEL_SQL,
  FACTS_PICKED_KEYS_SQL,
  FACTS_SIDE_SQL,
  FACTS_TAG_ROOT_SQL,
  FACTS_TAGS_MATCHING_SQL,
} from "./event-metrics-facts.constants";
import { readEventColumn } from "./event-metrics-facts.utilities";

import type { EventFilterParameters } from "../../../filtering/event-filter.types";
import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type { EventMetricsQueryRequest } from "../../event-metrics.types";
import type { CatalogMeasure } from "../catalog/event-metrics-catalog.types";
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
    measures: readonly CatalogMeasure[],
    tagsWhere: string,
  ): string {
    const columns = this.compileMeasures(measures);
    const sides = measures.filter((measure) => isSideMeasure(measure));
    let sql = "";

    for (let level = -1; level < levels.length; level++) {
      const source = level < 0 ? "ev" : `x${String(level)}`;
      const suffix = level < 0 ? "_total" : String(level);
      const keys = this.listKeys(levels.length, level);

      sql += FACTS_AGGREGATE_SQL.replace("{suffix}", suffix)
        .replace("{level}", String(level))
        .replace("{gk}", () => this.compileGroupKey(level, "x"))
        .replace("{keys}", () => keys.select)
        .replace("{leaf}", level < 0 ? "null::text" : `x.t${String(level)}`)
        .replace("{measures}", () => columns)
        .replace("{source}", source)
        .replace("{groupBy}", () => keys.groupBy);

      const own = this.listKeys(level + 1, level).groupBy;

      for (const [index] of sides.entries()) {
        const { column, join } = FACTS_SIDE_SQL;

        sql += FACTS_DISTINCT_SQL.replace(
          "{name}",
          `side${String(index)}_${suffix}`,
        )
          .replace("{keys}", () => own)
          .replace("{column}", column)
          .replace("{zgk}", () => this.compileGroupKey(level, "z"))
          .replace("{source}", source)
          .replace("{join}", join)
          .replace("{where}", () => tagsWhere)
          .replaceAll("{outer}", () => own.replaceAll(", x.", ", z."));
      }
    }

    return sql;
  }

  /**
   * The period and key path of a level's groups as one text; a missing key
   * reads `~null~`.
   */
  private compileGroupKey(level: number, alias: string): string {
    const keys = [`${alias}.period::text`];

    for (let index = 0; index <= level; index++) {
      keys.push(`coalesce(${alias}.t${String(index)}, '~null~')`);
    }

    return keys.join(` || '|' || `);
  }

  /**
   * The columns that hold each level's keys, `k0`, `k1`.
   */
  private compileKeys(levels: readonly FactsLevel[]): string {
    return levels
      .map((level, index) => `, ${level.keys} as k${String(index)}`)
      .join("");
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
   * One column per measure counted in the group, named `m_<slug>`.
   */
  private compileMeasures(measures: readonly CatalogMeasure[]): string {
    let sql = "";

    for (const measure of measures) {
      if (!isSideMeasure(measure)) {
        sql += `,\n      (${compileEventAggregate(measure, "x")})::float8 as "m_${measure.slug}"`;
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
    measures: readonly CatalogMeasure[],
    parameters: EventFilterParameters,
  ): string {
    if (
      request.tagRoot === null ||
      !measures.some((measure) => isSideMeasure(measure))
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
  private listUnions(count: number, sides: readonly CatalogMeasure[]): string {
    const parts: string[] = [];

    for (let level = -1; level < count; level++) {
      const suffix = level < 0 ? "_total" : String(level);
      let columns = "";
      let joins = "";

      for (const [side, measure] of sides.entries()) {
        const alias = `d${String(side)}`;

        columns += `, coalesce(${alias}.v, 0)::float8 as "m_${measure.slug}"`;
        joins += ` left join side${String(side)}_${suffix} ${alias} on ${alias}.gk = a.gk`;
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

    const measures = collectMeasures(request.metrics, request.catalog);
    const tagsWhere = this.compileTagsWhere(request, measures, parameters);
    const picked = levels.flatMap((level) => level.picked);
    const named = picked.length > 0;
    const dimension = named
      ? FACTS_DIMENSION_SQL.replace("{picked}", () =>
          this.parametersService.bind(parameters, picked),
        )
      : "";

    return {
      levels: levels.length,
      parameters: parameters.values,
      sql: FACTS_EVENTS_SQL.replace(
        "{eventRows}",
        () => `true${compileFactsScope(request.scope, "f")}`,
      )
        .replace("{extra}", () =>
          listEventColumns(measures)
            .map((column) => `, ${readEventColumn(column)} as "${column}"`)
            .join(""),
        )
        .replace("{eventColumns}", () =>
          listEventColumns(measures)
            .map((column) => `, e."${column}"`)
            .join(""),
        )
        .replace("{periods}", () => periods)
        .replace("{keys}", () => this.compileKeys(levels))
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
        .replace("{keyColumns}", () =>
          levels.map((_, index) => `, r.t${String(index)}`).join(""),
        )
        .replace("{metrics}", () =>
          compileMetricColumns(request.metrics, {
            catalog: request.catalog,
            resolve: (measure) => `r."m_${measure.slug}"`,
          }),
        )
        .replace("{union}", () =>
          this.listUnions(
            levels.length,
            measures.filter((measure) => isSideMeasure(measure)),
          ),
        )
        .replace("{dimension}", () =>
          named ? " left join dim d on d.key = r.leaf" : "",
        ),
    };
  }
}
