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
 * A SQL comparison, negated for `neq` and "is not between", which flip the
 * positive condition.
 */
export interface NumberCondition {
  negated: boolean;
  sql: string;
}
