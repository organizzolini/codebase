import { normalizeRule } from "./filter-limits.utilities";
import {
  DEFAULT_ROWS_FILTER,
  OPERATORS_BY_TYPE,
  ROWS_FILTER_FIELD,
} from "./filter-model.constants";

import type { FilterRule, RowsFilter } from "./filter-model.types";

// 🔏 Private Functions

/**
 * Keeps a linked rows rule that is a whole-number comparison, ranges low first; else the default.
 */
export function sanitizeRows(rows: RowsFilter | undefined): RowsFilter {
  if (
    rows === undefined ||
    !OPERATORS_BY_TYPE.number.includes(rows.operator) ||
    !hasSoundValue(rows)
  ) {
    return DEFAULT_ROWS_FILTER;
  }

  const { operator, value } = normalizeRule(toRowsRule(rows));

  return { operator, value };
}

// 🌎 Public Functions

/**
 * Names the rows filter as the rule it is, on the rows field.
 */
export function toRowsRule(rows: RowsFilter): FilterRule {
  return { field: ROWS_FILTER_FIELD.key, ...rows };
}

/**
 * Whether the value suits the operator: whole numbers, a pair for a range.
 */
function hasSoundValue({ operator, value }: RowsFilter): boolean {
  if (operator === "between") {
    return (
      Array.isArray(value) &&
      value.every((number) => Number.isSafeInteger(number))
    );
  }

  return typeof value === "number" && Number.isSafeInteger(value);
}
