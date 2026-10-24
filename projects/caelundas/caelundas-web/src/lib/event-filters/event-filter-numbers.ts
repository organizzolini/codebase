import {
  DERIVED_FIELD_IDS,
  DERIVED_FIELD_SQL,
  EVENT_TAG_NUMBERS_SQL,
  NUMBER_OPERATORS,
  TAG_NUMBER_SQL,
} from "./event-filters.constants";

import type { SqlValue } from "../events-database/events-database.types";
import type {
  CompiledEventFilter,
  EventFilterRule,
  EventFilterValue,
} from "./event-filters.types";

const COMPARISONS: Readonly<Record<string, string>> = {
  [NUMBER_OPERATORS.eq]: "=",
  [NUMBER_OPERATORS.gt]: ">",
  [NUMBER_OPERATORS.gte]: ">=",
  [NUMBER_OPERATORS.lt]: "<",
  [NUMBER_OPERATORS.lte]: "<=",
  [NUMBER_OPERATORS.neq]: "=",
};

// A rule's value comes from the builder or a hand-edited link, so numbers are
// read strictly and anything else leaves the rule out of the query. Each
// function below reads its values itself rather than through a helper, which
// would add a frame to every filter's call stack.

/**
 * Compiles a numeric rule on a field derived from the event's own columns:
 * the hour it starts or its duration in minutes. The hour keeps its own range
 * reader for "is between", so only its comparisons arrive here.
 */
export function compileDerivedNumberRule(
  rule: EventFilterRule,
  fieldId: string,
): CompiledEventFilter | null {
  const expression =
    fieldId === DERIVED_FIELD_IDS.hour
      ? DERIVED_FIELD_SQL.hour
      : DERIVED_FIELD_SQL.durationMinutes;
  const condition = compileNumberCondition(
    expression,
    rule.operator,
    rule.value,
  );

  if (condition === null) {
    return null;
  }

  return {
    parameters: condition.parameters,
    sql: condition.negated ? `(not ${condition.sql})` : condition.sql,
  };
}

/**
 * Compiles a numeric comparison over a SQL expression for the events whose
 * number meets it. `neq` and "is not between" keep the events that do not
 * meet the positive condition, so `negated` tells the caller to flip it.
 */
export function compileNumberCondition(
  expression: string,
  operator: string,
  value: EventFilterValue | undefined,
): (CompiledEventFilter & { negated: boolean }) | null {
  const negated =
    operator === NUMBER_OPERATORS.neq ||
    operator === NUMBER_OPERATORS.notBetween;

  if (
    operator === NUMBER_OPERATORS.between ||
    operator === NUMBER_OPERATORS.notBetween
  ) {
    if (!Array.isArray(value) || value.length !== 2) {
      return null;
    }

    const [first, second] = value;
    const from = Number(first);
    const to = Number(second);

    // `Number` reads null and a blank string as 0, which is not a number the
    // rule was given.
    if (
      first === null ||
      second === null ||
      (typeof first === "string" && first.trim() === "") ||
      (typeof second === "string" && second.trim() === "") ||
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      from > to
    ) {
      return null;
    }

    return {
      negated,
      parameters: [from, to],
      sql: `(${expression} between ? and ?)`,
    };
  }

  const comparison = COMPARISONS[operator];
  const number = Number(value);

  if (
    comparison === undefined ||
    value === null ||
    Array.isArray(value) ||
    (typeof value === "string" && value.trim() === "") ||
    !Number.isFinite(number)
  ) {
    return null;
  }

  return {
    negated,
    parameters: [number],
    sql: `(${expression} ${comparison} ?)`,
  };
}

/**
 * Compiles a numeric rule on a tag root whose tags are named for numbers:
 * events with a tag beneath the root whose number meets the comparison, or
 * with `neq` and "is not between", with none that does.
 */
export function compileTagNumberRule(
  rootId: string,
  operator: string,
  value: EventFilterValue | undefined,
): CompiledEventFilter | null {
  const condition = compileNumberCondition(TAG_NUMBER_SQL, operator, value);

  if (condition === null) {
    return null;
  }

  const exists = `exists (${EVENT_TAG_NUMBERS_SQL.replace("{condition}", () => condition.sql)})`;
  const parameters: SqlValue[] = [rootId, ...condition.parameters];

  return {
    parameters,
    sql: condition.negated ? `(not ${exists})` : `(${exists})`,
  };
}

/**
 * Whether a rule on a derived field compares a number: any numeric operator
 * on the duration in minutes, and a comparison but not a range on the hour,
 * whose range is read within its bounds.
 */
export function isDerivedNumberRule(
  fieldId: string,
  operator: string,
): boolean {
  if (fieldId === DERIVED_FIELD_IDS.durationMinutes) {
    return (
      operator in COMPARISONS ||
      operator === NUMBER_OPERATORS.between ||
      operator === NUMBER_OPERATORS.notBetween
    );
  }

  return fieldId === DERIVED_FIELD_IDS.hour && operator in COMPARISONS;
}

/**
 * Whether an operator compares a number rather than picking from a list.
 */
export function isNumberOperator(operator: string): boolean {
  return (
    operator in COMPARISONS ||
    operator === NUMBER_OPERATORS.between ||
    operator === NUMBER_OPERATORS.notBetween
  );
}
