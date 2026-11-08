import { bindParameter } from "./event-filter-binder.utilities";
import {
  DERIVED_FIELD_IDS,
  DERIVED_OPERATORS,
  DURATION_BUCKETS,
  HOURS,
  WEEKDAYS,
} from "./event-filter-fields.constants";
import { DERIVED_FIELD_SQL } from "./event-filter-sql.constants";
import {
  readDateRange,
  readIntegerRange,
  readIntegers,
  readTexts,
} from "./event-filter-values.utilities";

import type { EventFilterBinder, EventFilterRule } from "./event-filter.types";

// Each compiler below is handed the value its reader already checked, so
// none of them calls on to another: the filters' call stacks stay shallow.

/**
 * Compiles a rule on a field derived from the event's own columns: its date
 * range, weekday, hour, duration, temporality, or text. Answers `null` for a
 * field it does not know and for a rule that is not finished.
 */
export function compileDerivedRule(
  rule: EventFilterRule,
  binder: EventFilterBinder,
): null | string {
  const { operator, values } = rule;

  switch (rule.path.join(".")) {
    case DERIVED_FIELD_IDS.date: {
      return compileDateRule(operator, readDateRange(values), binder);
    }
    case DERIVED_FIELD_IDS.duration: {
      return compileDurationRule(operator, readTexts(values), binder);
    }
    case DERIVED_FIELD_IDS.hour: {
      return compileHourRule(operator, readIntegerRange(values, HOURS), binder);
    }
    case DERIVED_FIELD_IDS.temporality: {
      return compileTemporalityRule(operator, readTexts(values), binder);
    }
    case DERIVED_FIELD_IDS.text: {
      return compileTextRule(operator, values, binder);
    }
    case DERIVED_FIELD_IDS.weekday: {
      return compileWeekdayRule(
        operator,
        readIntegers(values, WEEKDAYS),
        binder,
      );
    }
    default: {
      return null;
    }
  }
}

/**
 * Keeps the events that overlap any day of a range, or with "is not between"
 * drops them, the days read in each event's own zone.
 */
function compileDateRule(
  operator: string,
  range: null | readonly [string, string],
  binder: EventFilterBinder,
): null | string {
  if (
    range === null ||
    (operator !== DERIVED_OPERATORS.between &&
      operator !== DERIVED_OPERATORS.notBetween)
  ) {
    return null;
  }

  const from = bindParameter(binder, range[0]);
  const to = bindParameter(binder, range[1]);
  const sql = `(${DERIVED_FIELD_SQL.endLocalDay} >= ${from}::text and ${DERIVED_FIELD_SQL.startLocalDay} <= ${to}::text)`;

  return operator === DERIVED_OPERATORS.between ? sql : `(not ${sql})`;
}

/**
 * Keeps the events whose duration falls in any of the chosen buckets, or
 * drops them.
 */
function compileDurationRule(
  operator: string,
  bucketValues: readonly string[],
  binder: EventFilterBinder,
): null | string {
  const picked = DURATION_BUCKETS.filter((bucket) =>
    bucketValues.includes(bucket.value),
  );

  if (
    picked.length === 0 ||
    (operator !== DERIVED_OPERATORS.isAnyOf &&
      operator !== DERIVED_OPERATORS.isNoneOf)
  ) {
    return null;
  }

  const conditions: string[] = [];

  for (const bucket of picked) {
    const minimum = bindParameter(binder, bucket.minimum);
    const maximum = bindParameter(binder, bucket.maximum);

    conditions.push(
      `(${DERIVED_FIELD_SQL.durationMinutes} between ${minimum}::bigint and ${maximum}::bigint)`,
    );
  }

  const sql = `(${conditions.join(" or ")})`;

  return operator === DERIVED_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
}

/**
 * Keeps the events that start in a range of local hours, or with "is not
 * between" drops them.
 */
function compileHourRule(
  operator: string,
  range: null | readonly [number, number],
  binder: EventFilterBinder,
): null | string {
  if (
    range === null ||
    (operator !== DERIVED_OPERATORS.between &&
      operator !== DERIVED_OPERATORS.notBetween)
  ) {
    return null;
  }

  const from = bindParameter(binder, range[0]);
  const to = bindParameter(binder, range[1]);
  const sql = `(${DERIVED_FIELD_SQL.hour} between ${from}::integer and ${to}::integer)`;

  return operator === DERIVED_OPERATORS.between ? sql : `(not ${sql})`;
}

/**
 * Keeps the events that are any of the chosen temporalities, or none of them.
 */
function compileTemporalityRule(
  operator: string,
  temporalities: readonly string[],
  binder: EventFilterBinder,
): null | string {
  if (
    temporalities.length === 0 ||
    (operator !== DERIVED_OPERATORS.isAnyOf &&
      operator !== DERIVED_OPERATORS.isNoneOf)
  ) {
    return null;
  }

  const picked = bindParameter(binder, [...temporalities]);
  const sql = `(${DERIVED_FIELD_SQL.temporality} = any(${picked}::text[]))`;

  return operator === DERIVED_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
}

/**
 * Keeps the events whose summary or description contains a piece of text,
 * ignoring case, or drops them. The text's own wildcards match literally,
 * and text of nothing but spaces leaves the rule unfinished.
 */
function compileTextRule(
  operator: string,
  values: readonly string[],
  binder: EventFilterBinder,
): null | string {
  const [text] = values;

  if (
    values.length !== 1 ||
    text === undefined ||
    text.trim() === "" ||
    (operator !== DERIVED_OPERATORS.contains &&
      operator !== DERIVED_OPERATORS.notContains)
  ) {
    return null;
  }

  const pattern = bindParameter(
    binder,
    `%${text.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`,
  );
  const sql = String.raw`(lower(e."summary") like lower(${pattern}::text) escape '\' or lower(e.description) like lower(${pattern}::text) escape '\')`;

  return operator === DERIVED_OPERATORS.contains ? sql : `(not ${sql})`;
}

/**
 * Keeps the events whose weekday, numbered from Sunday, is any of the chosen
 * ones, or none of them, the weekday read in each event's own zone.
 */
function compileWeekdayRule(
  operator: string,
  weekdays: readonly number[],
  binder: EventFilterBinder,
): null | string {
  if (
    weekdays.length === 0 ||
    (operator !== DERIVED_OPERATORS.isAnyOf &&
      operator !== DERIVED_OPERATORS.isNoneOf)
  ) {
    return null;
  }

  const picked = bindParameter(binder, [...weekdays]);
  const sql = `(${DERIVED_FIELD_SQL.weekday} = any(${picked}::integer[]))`;

  return operator === DERIVED_OPERATORS.isAnyOf ? sql : `(not ${sql})`;
}
