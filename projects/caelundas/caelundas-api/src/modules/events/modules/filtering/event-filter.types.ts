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
  /** Selects an event's tags, in place of its tag table. */
  readonly tagsMatching?: string | undefined;
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

/** Kinds of event a query reads; each is left out unless asked. */
export interface EventScope {
  /** Also reads the Forming and Dissolving boundary instants. */
  includePhaseBoundaries: boolean;
}

/** A SQL comparison; neq and not-between are negated, flipping it. */
export interface NumberCondition {
  negated: boolean;
  sql: string;
}
