/**
 * A boolean SQL expression over the derived events view, aliased `e`, with
 * the values its `$n` placeholders stand for.
 */
export interface CompiledEventFilter {
  parameters: unknown[];
  sql: string;
}

/**
 * Collects the values a compiled expression binds, numbering the `$n`
 * placeholders after the `offset` the query already binds.
 */
export interface EventFilterBinder {
  readonly offset: number;
  readonly parameters: unknown[];
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

/**
 * A comparison over a SQL expression, and whether the rule keeps the events
 * it does not hold for instead: `neq` and "is not between" compare for the
 * positive condition and flip it.
 */
export interface NumberCondition {
  negated: boolean;
  sql: string;
}
