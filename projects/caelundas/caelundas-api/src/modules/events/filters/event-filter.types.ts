/** A boolean SQL expression over the events view, aliased `e`. */
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

/** Values a compiled expression binds, numbered after the existing offset. */
export interface EventFilterParameters {
  readonly offset: number;
  readonly values: unknown[];
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

/** A SQL comparison; neq and not-between are negated, flipping it. */
export interface NumberCondition {
  negated: boolean;
  sql: string;
}
