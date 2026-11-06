/**
 * A boolean SQL expression over the derived events view, aliased `e`, with
 * the values its `$n` placeholders stand for.
 */
export interface CompiledEventFilter {
  parameters: unknown[];
  sql: string;
}

/**
 * Conditions and nested groups joined under one combinator, validated.
 */
export interface EventFilterGroup {
  combinator: "and" | "or";
  groups: EventFilterGroup[];
  rules: EventFilterRule[];
}

/**
 * One validated condition of a filter.
 */
export interface EventFilterRule {
  negated: boolean;
  operator: string;
  path: string[];
  values: string[];
}
