import { Inject, Injectable } from "@nestjs/common";

import { TAG_FIELD_PREFIX } from "../filtering/modules/query-building/event-filter-fields.constants";
import { EventFilterParametersService } from "../filtering/modules/query-building/event-filter-parameters.service";
import { UUID_PATTERN } from "../filtering/modules/values/event-filter-values.constants";

import {
  CALENDAR_GROUP_IDS,
  CALENDAR_GROUP_KEY_SQL,
  CALENDAR_GROUP_SQL,
  eventGroupingSchema,
  GROUP_COLUMN_SQL,
  NO_GROUP_SQL,
  PARENT_TAG_GROUP_SQL,
  PICKED_TAG_GROUP_SQL,
  TAG_GROUP_SQL,
} from "./event-grouping.constants";

import type { EventFilterParameters } from "../filtering/event-filter.types";
import type {
  CompiledEventGrouping,
  EventGroupingSources,
  EventGroupLevel,
} from "./event-grouping.types";

/**
 * Validates the grouping a query was given and compiles it to SQL.
 */
@Injectable()
export class EventGroupingService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventFilterParametersService)
    private readonly parametersService: EventFilterParametersService,
  ) {}

  /**
   * Compiles one level of a grouping to its source of keys.
   */
  private compileGroupLevel(
    level: EventGroupLevel,
    parameters: EventFilterParameters,
  ): string {
    if (
      level.field.startsWith(TAG_FIELD_PREFIX) &&
      level.parent !== undefined
    ) {
      return PARENT_TAG_GROUP_SQL.replace("{parent}", () =>
        this.parametersService.bind(parameters, level.parent),
      );
    }

    if (level.field.startsWith(TAG_FIELD_PREFIX) && level.tags.length > 0) {
      // A pick that is no tag id matches nothing, as a tag the data lacks
      // would, rather than failing the cast.
      const known = level.tags.filter((tag) => UUID_PATTERN.test(tag));

      return PICKED_TAG_GROUP_SQL.replace("{tags}", () =>
        this.parametersService.bind(parameters, known),
      );
    }

    if (level.field.startsWith(TAG_FIELD_PREFIX)) {
      const root = this.parametersService.bind(
        parameters,
        level.field.slice(TAG_FIELD_PREFIX.length),
      );
      const depth = this.parametersService.bind(parameters, level.depth ?? 1);

      return TAG_GROUP_SQL.replaceAll("{depth}", depth).replace("{root}", root);
    }

    const id = CALENDAR_GROUP_IDS.find(
      (candidate) => candidate === level.field,
    );

    return id === undefined
      ? NO_GROUP_SQL
      : CALENDAR_GROUP_SQL.replace("{key}", () => CALENDAR_GROUP_KEY_SQL[id]);
  }

  /**
   * Compiles a grouping to one select-list column per level, numbering
   * placeholders after offset.
   */
  public compile(
    grouping: readonly EventGroupLevel[],
    offset: number,
  ): CompiledEventGrouping {
    const { parameters, sources } = this.compileSources(grouping, offset);
    let sql = "";

    for (const [index, source] of sources.entries()) {
      sql += GROUP_COLUMN_SQL.replace("{source}", () => source).replace(
        "{column}",
        `group_${String(index)}`,
      );
    }

    return { parameters, sql };
  }

  /**
   * Compiles each level to its source of keys, numbering placeholders after
   * offset.
   */
  public compileSources(
    grouping: readonly EventGroupLevel[],
    offset: number,
  ): EventGroupingSources {
    const parameters: EventFilterParameters = { offset, values: [] };
    const sources: string[] = [];

    // A loop rather than a mapping callback keeps the call stacks shallow.
    for (const level of grouping) {
      sources.push(this.compileGroupLevel(level, parameters));
    }

    return { parameters: parameters.values, sources };
  }

  /**
   * Validates a grouping and appends the color level last. Throws a `ZodError`
   * for more than three levels.
   */
  public parse(grouping: unknown): EventGroupLevel[] {
    const { colorBy, levels } = eventGroupingSchema.parse(grouping ?? {});

    return colorBy === undefined ? levels : [...levels, colorBy];
  }
}
