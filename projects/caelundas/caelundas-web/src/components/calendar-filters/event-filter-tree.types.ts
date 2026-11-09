import type { EventFilterValue } from "./event-filters.types";

/**
 * A filter group from somewhere looser than the builder, such as a parsed link, where a rule's value may be missing.
 */
export interface LooseEventFilterGroup {
  combinator: "and" | "or";
  id: string;
  rules: readonly (LooseEventFilterGroup | LooseEventFilterRule)[];
  type: "group";
}

/**
 * A filter rule as it arrives from somewhere looser than the builder.
 */
export interface LooseEventFilterRule {
  id: string;
  negated?: boolean | undefined;
  operator: string;
  path: readonly string[];
  type: "rule";
  value?: EventFilterValue | undefined;
}
