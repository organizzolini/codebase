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
 * Compiles a numeric rule on the start hour or duration in minutes; the
 * hour's ranges go to its own compiler.
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
 * Compiles a numeric comparison over a SQL expression; `null` for an operator
 * that compares nothing or non-numeric operands.
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
 * Compiles a numeric rule on a tag root named for numbers: a matching tag
 * beneath it, or none for negated operators.
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
 * Whether a derived field's rule compares a number: any numeric operator on
 * duration, or a comparison (not a range) on hour.
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
