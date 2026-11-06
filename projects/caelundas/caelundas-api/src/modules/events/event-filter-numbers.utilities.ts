import { bindParameter } from "./event-filter-binder.utilities";
import {
  COMPARISONS,
  DERIVED_FIELD_IDS,
  NUMBER_OPERATORS,
} from "./event-filter-fields.constants";
import {
  DERIVED_FIELD_SQL,
  EVENT_TAG_NUMBERS_SQL,
  TAG_NUMBER_SQL,
} from "./event-filter-sql.constants";
import {
  readNumberRange,
  readSingleNumber,
} from "./event-filter-values.utilities";

import type {
  EventFilterBinder,
  EventFilterRule,
  NumberCondition,
} from "./event-filter.types";

// A rule's compiler reads its operands and builds its condition as two
// siblings rather than one calling the other, which would add a frame to
// every filter's call stack.

/**
 * Compiles a numeric rule on a field derived from the event's own columns:
 * the hour it starts or its duration in minutes. The hour keeps its own range
 * reader for "is between", so only its comparisons arrive here.
 */
export function compileDerivedNumberRule(
  rule: EventFilterRule,
  fieldId: string,
  binder: EventFilterBinder,
): null | string {
  const expression =
    fieldId === DERIVED_FIELD_IDS.hour
      ? DERIVED_FIELD_SQL.hour
      : DERIVED_FIELD_SQL.durationMinutes;
  const condition = compileNumberCondition(expression, rule, binder);

  if (condition === null) {
    return null;
  }

  return condition.negated ? `(not ${condition.sql})` : condition.sql;
}

/**
 * Compiles a numeric comparison over a SQL expression for the events whose
 * number meets it, reading the operands the rule's operator takes: a range
 * of two, or one number. Answers `null` for an operator that compares
 * nothing or operands that were not written as numbers.
 */
export function compileNumberCondition(
  expression: string,
  rule: EventFilterRule,
  binder: EventFilterBinder,
): null | NumberCondition {
  const { operator } = rule;
  const operands = isRangeOperator(operator)
    ? readNumberRange(rule.values)
    : readSingleNumber(rule.values);
  const comparison = Object.hasOwn(COMPARISONS, operator)
    ? COMPARISONS[operator]
    : undefined;
  const negated =
    operator === NUMBER_OPERATORS.neq ||
    operator === NUMBER_OPERATORS.notBetween;

  if (operands === null) {
    return null;
  }

  if (operands.length === 2) {
    const from = bindParameter(binder, String(operands[0]));
    const to = bindParameter(binder, String(operands[1]));

    return {
      negated,
      sql: `(${expression} between ${from}::numeric and ${to}::numeric)`,
    };
  }

  if (comparison === undefined) {
    return null;
  }

  const operand = bindParameter(binder, String(operands[0]));

  return { negated, sql: `(${expression} ${comparison} ${operand}::numeric)` };
}

/**
 * Compiles a numeric rule on a tag root whose tags are named for numbers:
 * events with a tag beneath the root whose number meets the comparison, or
 * with `neq` and "is not between", with none that does.
 */
export function compileTagNumberRule(
  rootId: string,
  rule: EventFilterRule,
  binder: EventFilterBinder,
): null | string {
  const condition = compileNumberCondition(TAG_NUMBER_SQL, rule, binder);

  if (condition === null) {
    return null;
  }

  const root = bindParameter(binder, rootId);
  const exists = `exists (${EVENT_TAG_NUMBERS_SQL.replace("{root}", () => root).replace("{condition}", () => condition.sql)})`;

  return condition.negated ? `(not ${exists})` : `(${exists})`;
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
    return isNumberOperator(operator);
  }

  return (
    fieldId === DERIVED_FIELD_IDS.hour && Object.hasOwn(COMPARISONS, operator)
  );
}

/**
 * Whether an operator compares a number rather than picking from a list.
 */
export function isNumberOperator(operator: string): boolean {
  return Object.hasOwn(COMPARISONS, operator) || isRangeOperator(operator);
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
