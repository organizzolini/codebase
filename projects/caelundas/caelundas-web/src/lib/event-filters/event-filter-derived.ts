import {
  readDateRange,
  readIntegerRange,
  readIntegers,
  readTexts,
} from "./event-filter-values";
import {
  DERIVED_FIELD_IDS,
  DERIVED_FIELD_SQL,
  DERIVED_OPERATORS,
  DURATION_BUCKETS,
  WEEKDAY_LABELS,
} from "./event-filters.constants";

import type { SqlValue } from "../events-database/events-database.types";
import type {
  CompiledEventFilter,
  EventFilterRule,
  EventFilterValue,
} from "./event-filters.types";

const HOURS = { maximum: 23, minimum: 0 } as const;
const WEEKDAYS = { maximum: WEEKDAY_LABELS.length - 1, minimum: 0 } as const;

// Each compiler below is handed the value its reader already checked, so
// none of them calls on to another: the filters' call stacks stay shallow.

/**
 * Compiles a rule on a field derived from the event's own columns: its date
 * range, weekday, hour, duration, temporality, or text. Answers `null` for a
 * field it does not know and for a rule that is not finished.
 */
export function compileDerivedRule(
  rule: EventFilterRule,
): CompiledEventFilter | null {
  const { operator, value } = rule;

  switch (rule.path.join(".")) {
    case DERIVED_FIELD_IDS.date: {
      return compileRange(
        DERIVED_FIELD_SQL.dateRange,
        operator,
        readDateRange(value),
      );
    }
    case DERIVED_FIELD_IDS.duration: {
      return compileDurationRule(operator, readTexts(value));
    }
    case DERIVED_FIELD_IDS.hour: {
      return compileRange(
        DERIVED_FIELD_SQL.hourRange,
        operator,
        readIntegerRange(value, HOURS),
      );
    }
    case DERIVED_FIELD_IDS.temporality: {
      return compileSetRule(
        DERIVED_FIELD_SQL.temporality,
        operator,
        readTexts(value),
      );
    }
    case DERIVED_FIELD_IDS.text: {
      return compileTextRule(operator, value);
    }
    case DERIVED_FIELD_IDS.weekday: {
      return compileSetRule(
        DERIVED_FIELD_SQL.weekday,
        operator,
        readIntegers(value, WEEKDAYS),
      );
    }
    default: {
      return null;
    }
  }
}

/**
 * Keeps the events whose duration falls in any of the chosen buckets, or
 * drops them.
 */
function compileDurationRule(
  operator: string,
  bucketValues: readonly string[],
): CompiledEventFilter | null {
  const conditions: string[] = [];
  const parameters: SqlValue[] = [];

  for (const bucket of DURATION_BUCKETS) {
    if (bucketValues.includes(bucket.value)) {
      conditions.push(DERIVED_FIELD_SQL.duration);
      parameters.push(bucket.minimum, bucket.maximum);
    }
  }

  if (conditions.length === 0) {
    return null;
  }

  const sql = `(${conditions.join(" or ")})`;

  switch (operator) {
    case DERIVED_OPERATORS.isAnyOf: {
      return { parameters, sql };
    }
    case DERIVED_OPERATORS.isNoneOf: {
      return { parameters, sql: `(not ${sql})` };
    }
    default: {
      return null;
    }
  }
}

/**
 * Keeps the events a range condition holds for, or with "is not between"
 * drops them: the local days an event overlaps, or the local hour it starts.
 */
function compileRange(
  sql: string,
  operator: string,
  range: null | readonly [SqlValue, SqlValue],
): CompiledEventFilter | null {
  if (range === null) {
    return null;
  }

  switch (operator) {
    case DERIVED_OPERATORS.between: {
      return { parameters: [...range], sql };
    }
    case DERIVED_OPERATORS.notBetween: {
      return { parameters: [...range], sql: `(not ${sql})` };
    }
    default: {
      return null;
    }
  }
}

/**
 * Keeps the events whose value for an expression is any of the chosen ones,
 * or none of them.
 */
function compileSetRule(
  expression: string,
  operator: string,
  values: readonly SqlValue[],
): CompiledEventFilter | null {
  if (values.length === 0) {
    return null;
  }

  const placeholders = Array.from({ length: values.length })
    .fill("?")
    .join(", ");

  switch (operator) {
    case DERIVED_OPERATORS.isAnyOf: {
      return {
        parameters: [...values],
        sql: `(${expression} in (${placeholders}))`,
      };
    }
    case DERIVED_OPERATORS.isNoneOf: {
      return {
        parameters: [...values],
        sql: `(${expression} not in (${placeholders}))`,
      };
    }
    default: {
      return null;
    }
  }
}

/**
 * Keeps the events whose summary or description contains a piece of text,
 * ignoring case, or drops them. The text's own wildcards match literally,
 * and text of nothing but spaces leaves the rule unfinished.
 */
function compileTextRule(
  operator: string,
  text: EventFilterValue | undefined,
): CompiledEventFilter | null {
  if (typeof text !== "string" || text.trim() === "") {
    return null;
  }

  const pattern = `%${text.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`;
  const parameters = [pattern, pattern];

  switch (operator) {
    case DERIVED_OPERATORS.contains: {
      return { parameters, sql: DERIVED_FIELD_SQL.text };
    }
    case DERIVED_OPERATORS.notContains: {
      return { parameters, sql: `(not ${DERIVED_FIELD_SQL.text})` };
    }
    default: {
      return null;
    }
  }
}
