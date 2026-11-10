import { z } from "zod";

import type { EventFilterGroup, EventFilterRule } from "./event-filter.types";

// ♟️ Constants

/**
 * The most conditions, nested groups, path segments or values one filter
 * node may hold, so a request cannot ask the database for an unbounded
 * expression.
 */
export const EVENT_FILTER_MAXIMUM_BREADTH = 256;

/**
 * Validates one condition as it arrives from GraphQL, where the optional
 * fields may be absent or null.
 */
export const eventFilterRuleSchema: z.ZodType<EventFilterRule> = z.object({
  negated: z
    .boolean()
    .nullish()
    .transform((negated) => negated === true),
  operator: z.string(),
  path: z.array(z.string()).max(EVENT_FILTER_MAXIMUM_BREADTH),
  values: z
    .array(z.string())
    .max(EVENT_FILTER_MAXIMUM_BREADTH)
    .nullish()
    .transform((values) => values ?? []),
});

/**
 * Validates a filter group and every group nested in it, filling the lists a
 * request left out with empty ones.
 */
export const eventFilterGroupSchema: z.ZodType<EventFilterGroup> = z.object({
  combinator: z.enum(["and", "or"]),
  groups: z
    .array(z.lazy(() => eventFilterGroupSchema))
    .max(EVENT_FILTER_MAXIMUM_BREADTH)
    .nullish()
    .transform((groups) => groups ?? []),
  rules: z
    .array(eventFilterRuleSchema)
    .max(EVENT_FILTER_MAXIMUM_BREADTH)
    .nullish()
    .transform((rules) => rules ?? []),
});
