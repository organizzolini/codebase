import { DERIVED_OPERATORS } from "./event-filters.constants";

// ♟️ Constants

/**
 * Range operators; a rule holding fewer ends is unfinished.
 */
export const RANGE_OPERATORS: ReadonlySet<string> = new Set([
  DERIVED_OPERATORS.between,
  DERIVED_OPERATORS.notBetween,
]);
