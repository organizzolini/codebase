import { DERIVED_OPERATORS } from "./event-filters.constants";

// ♟️ Constants

/**
 * The operators that compare with the two ends of a range, which a rule
 * holding fewer has not finished.
 */
export const RANGE_OPERATORS: ReadonlySet<string> = new Set([
  DERIVED_OPERATORS.between,
  DERIVED_OPERATORS.notBetween,
]);
