import { Inject, Injectable } from "@nestjs/common";

import { TAG_FIELD_PREFIX } from "../filters/event-filter-fields.constants";
import { EventFilterParametersService } from "../filters/event-filter-parameters.service";
import { UUID_PATTERN } from "../filters/event-filter-values.constants";

import {
  CALENDAR_GROUP_IDS,
  CALENDAR_GROUP_KEY_SQL,
  CALENDAR_GROUP_SQL,
  eventGroupingSchema,
  GROUP_COLUMN_SQL,
  NO_GROUP_SQL,
  PICKED_TAG_GROUP_SQL,
  TAG_GROUP_SQL,
} from "./event-grouping.constants";

import type { EventFilterParameters } from "../filters/event-filter.types";
import type {
  CompiledEventGrouping,
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
   * Compiles a grouping to one select-list column per level, `group_0`
   * onward, each a JSON array of the group keys an event falls in at that
   * level, over the derived events view aliased `e`, whose placeholders are
   * numbered after the `offset` parameters the query already binds. A tag level
   * answers the picked tags, or every tag of that root at its depth, the event
   * is under, so an event with two planets falls in both; a derived level
   * answers one key. A field the calendar does not know answers none.
   */
  public compile(
    grouping: readonly EventGroupLevel[],
    offset: number,
  ): CompiledEventGrouping {
    const parameters: EventFilterParameters = { offset, values: [] };
    let sql = "";

    // A loop rather than a mapping callback keeps the call stacks shallow.
    for (const [index, level] of grouping.entries()) {
      sql += GROUP_COLUMN_SQL.replace("{source}", () =>
        this.compileGroupLevel(level, parameters),
      ).replace("{column}", `group_${String(index)}`);
    }

    return { parameters: parameters.values, sql };
  }

  /**
   * Validates the grouping a query was given and appends the level the events
   * are colored by, so the color's keys come last. Throws a `ZodError` that
   * names the offending field for a malformed one, including more than three
   * levels of grouping.
   */
  public parse(grouping: unknown): EventGroupLevel[] {
    const { colorBy, levels } = eventGroupingSchema.parse(grouping ?? {});

    return colorBy === undefined ? levels : [...levels, colorBy];
  }
}
