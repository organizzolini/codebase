import { Inject, Injectable } from "@nestjs/common";

import {
  CALENDAR_FIELD_IDS,
  CALENDAR_OPERATORS,
  DURATION_BUCKETS,
  HOURS,
  WEEKDAYS,
} from "./event-filter-fields.constants";
import { EventFilterParametersService } from "./event-filter-parameters.service";
import { CALENDAR_FIELD_SQL } from "./event-filter-sql.constants";
import { EventFilterValuesService } from "./event-filter-values.service";

import type {
  EventFilterParameters,
  EventFilterRule,
} from "./event-filter.types";

// Each compiler below is handed the value its reader already checked, so
// none of them calls on to another: the filters' call stacks stay shallow.

/**
 * Compiles the rules of a filter on the fields of an event's own columns: its
 * date range, weekday, hour, duration, temporality, and text.
 */
@Injectable()
export class EventFilterCalendarFieldsService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventFilterParametersService)
    private readonly parametersService: EventFilterParametersService,
    @Inject(EventFilterValuesService)
    private readonly valuesService: EventFilterValuesService,
  ) {}

  /**
   * Keeps events overlapping a day range, or drops them for "is not between".
   */
  private compileDateRule(
    operator: string,
    range: null | readonly [string, string],
    parameters: EventFilterParameters,
  ): null | string {
    if (
      range === null ||
      (operator !== CALENDAR_OPERATORS.between &&
        operator !== CALENDAR_OPERATORS.notBetween)
    ) {
      return null;
    }

    const from = this.parametersService.bind(parameters, range[0]);
    const to = this.parametersService.bind(parameters, range[1]);
    const sql = `(${CALENDAR_FIELD_SQL.endLocalDay} >= ${from}::text and ${CALENDAR_FIELD_SQL.startLocalDay} <= ${to}::text)`;

    return operator === CALENDAR_OPERATORS.between ? sql : `(not ${sql})`;
  }

  /**
   * Keeps the events whose duration falls in any of the chosen buckets, or
   * drops them.
   */
  private compileDurationRule(
    operator: string,
    bucketValues: readonly string[],
    parameters: EventFilterParameters,
  ): null | string {
    const picked = DURATION_BUCKETS.filter((bucket) =>
      bucketValues.includes(bucket.value),
    );

    if (
      picked.length === 0 ||
      (operator !== CALENDAR_OPERATORS.isAnyOf &&
        operator !== CALENDAR_OPERATORS.isNoneOf)
    ) {
      return null;
    }

    const conditions: string[] = [];

    for (const bucket of picked) {
      const minimum = this.parametersService.bind(parameters, bucket.minimum);
      const maximum = this.parametersService.bind(parameters, bucket.maximum);

      conditions.push(
        `(${CALENDAR_FIELD_SQL.durationMinutes} between ${minimum}::bigint and ${maximum}::bigint)`,
      );
    }

    const sql = `(${conditions.join(" or ")})`;

    return operator === CALENDAR_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
  }

  /**
   * Keeps the events that start in a range of local hours, or with "is not
   * between" drops them.
   */
  private compileHourRule(
    operator: string,
    range: null | readonly [number, number],
    parameters: EventFilterParameters,
  ): null | string {
    if (
      range === null ||
      (operator !== CALENDAR_OPERATORS.between &&
        operator !== CALENDAR_OPERATORS.notBetween)
    ) {
      return null;
    }

    const from = this.parametersService.bind(parameters, range[0]);
    const to = this.parametersService.bind(parameters, range[1]);
    const sql = `(${CALENDAR_FIELD_SQL.hour} between ${from}::integer and ${to}::integer)`;

    return operator === CALENDAR_OPERATORS.between ? sql : `(not ${sql})`;
  }

  /**
   * Keeps the events that are any of the chosen temporalities, or none of them.
   */
  private compileTemporalityRule(
    operator: string,
    temporalities: readonly string[],
    parameters: EventFilterParameters,
  ): null | string {
    if (
      temporalities.length === 0 ||
      (operator !== CALENDAR_OPERATORS.isAnyOf &&
        operator !== CALENDAR_OPERATORS.isNoneOf)
    ) {
      return null;
    }

    const picked = this.parametersService.bind(parameters, [...temporalities]);
    const sql = `(${CALENDAR_FIELD_SQL.temporality} = any(${picked}::text[]))`;

    return operator === CALENDAR_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
  }

  /**
   * Keeps events whose summary or description contains the text, ignoring
   * case. Wildcards match literally.
   */
  private compileTextRule(
    operator: string,
    values: readonly string[],
    parameters: EventFilterParameters,
  ): null | string {
    const [text] = values;

    if (
      values.length !== 1 ||
      text === undefined ||
      text.trim() === "" ||
      (operator !== CALENDAR_OPERATORS.contains &&
        operator !== CALENDAR_OPERATORS.notContains)
    ) {
      return null;
    }

    const pattern = this.parametersService.bind(
      parameters,
      `%${text.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`,
    );
    const sql = String.raw`(lower(e."summary") like lower(${pattern}::text) escape '\' or lower(e.description) like lower(${pattern}::text) escape '\')`;

    return operator === CALENDAR_OPERATORS.contains ? sql : `(not ${sql})`;
  }

  /**
   * Keeps events on the chosen weekdays, Sunday is 0, or none of them.
   */
  private compileWeekdayRule(
    operator: string,
    weekdays: readonly number[],
    parameters: EventFilterParameters,
  ): null | string {
    if (
      weekdays.length === 0 ||
      (operator !== CALENDAR_OPERATORS.isAnyOf &&
        operator !== CALENDAR_OPERATORS.isNoneOf)
    ) {
      return null;
    }

    const picked = this.parametersService.bind(parameters, [...weekdays]);
    const sql = `(${CALENDAR_FIELD_SQL.weekday} = any(${picked}::integer[]))`;

    return operator === CALENDAR_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
  }

  /**
   * Compiles a rule on a derived calendar field. Answers `null` for an unknown
   * field or an unfinished rule.
   */
  public compileCalendarRule(
    rule: EventFilterRule,
    parameters: EventFilterParameters,
  ): null | string {
    const { operator, values } = rule;

    switch (rule.path.join(".")) {
      case CALENDAR_FIELD_IDS.date: {
        return this.compileDateRule(
          operator,
          this.valuesService.readDateRange(values),
          parameters,
        );
      }
      case CALENDAR_FIELD_IDS.duration: {
        return this.compileDurationRule(
          operator,
          this.valuesService.readTexts(values),
          parameters,
        );
      }
      case CALENDAR_FIELD_IDS.hour: {
        return this.compileHourRule(
          operator,
          this.valuesService.readIntegerRange(values, HOURS),
          parameters,
        );
      }
      case CALENDAR_FIELD_IDS.temporality: {
        return this.compileTemporalityRule(
          operator,
          this.valuesService.readTexts(values),
          parameters,
        );
      }
      case CALENDAR_FIELD_IDS.text: {
        return this.compileTextRule(operator, values, parameters);
      }
      case CALENDAR_FIELD_IDS.weekday: {
        return this.compileWeekdayRule(
          operator,
          this.valuesService.readIntegers(values, WEEKDAYS),
          parameters,
        );
      }
      default: {
        return null;
      }
    }
  }
}
