import { COMPARISONS, NUMBER_PATTERN } from "./event-filter-numbers.constants";
import {
  DERIVED_FIELD_IDS,
  DERIVED_FIELD_SQL,
  EVENT_TAG_NUMBERS_SQL,
  NUMBER_OPERATORS,
  TAG_NUMBER_SQL,
} from "./event-filters.constants";

import type { SqlValue } from "../events-calendar/events-database.types";
import type {
  CompiledEventFilter,
  EventFilterRule,
  EventFilterValue,
} from "./event-filters.types";

// A rule's value comes from the builder or a hand-edited link, so numbers are
// read strictly and anything else leaves the rule out of the query. A rule's
// compiler reads its operands and builds its condition as two siblings rather
// than one calling the other, which would add a frame to every filter's call
// stack.

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
  const operands = isRangeOperator(rule.operator)
    ? readNumberRange(rule.value)
    : readSingleNumber(rule.value);
  const condition = compileNumberCondition(expression, rule.operator, operands);

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
 * number meets it, from the operands read for its operator. `neq` and "is not
 * between" keep the events that do not meet the positive condition, so
 * `negated` tells the caller to flip it.
 */
export function compileNumberCondition(
  expression: string,
  operator: string,
  operands: null | readonly number[],
): (CompiledEventFilter & { negated: boolean }) | null {
  const comparison = COMPARISONS[operator];
  const negated =
    operator === NUMBER_OPERATORS.neq ||
    operator === NUMBER_OPERATORS.notBetween;

  if (operands === null) {
    return null;
  }

  if (operands.length === 2) {
    return {
      negated,
      parameters: [...operands],
      sql: `(${expression} between ? and ?)`,
    };
  }

  return comparison === undefined
    ? null
    : {
        negated,
        parameters: [...operands],
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
  const operands = isRangeOperator(operator)
    ? readNumberRange(value)
    : readSingleNumber(value);
  const condition = compileNumberCondition(TAG_NUMBER_SQL, operator, operands);

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

/**
 * Whether an operator compares a number with a range of two.
 */
export function isRangeOperator(operator: string): boolean {
  return (
    operator === NUMBER_OPERATORS.between ||
    operator === NUMBER_OPERATORS.notBetween
  );
}

/**
 * Reads the two ends of a range a rule was given, or `null` when either is
 * not written as a number or they run backwards. A number is matched as
 * written, since `Number` reads null and a blank string as 0.
 */
export function readNumberRange(
  value: EventFilterValue | undefined,
): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }

  const [first, second] = value;

  if (
    !NUMBER_PATTERN.test(String(first)) ||
    !NUMBER_PATTERN.test(String(second))
  ) {
    return null;
  }

  const from = Number(first);
  const to = Number(second);

  return from > to ? null : [from, to];
}

/**
 * Reads the one number a comparison was given, or `null` when it is not
 * written as one.
 */
export function readSingleNumber(
  value: EventFilterValue | undefined,
): [number] | null {
  return Array.isArray(value) || !NUMBER_PATTERN.test(String(value))
    ? null
    : [Number(value)];
}
