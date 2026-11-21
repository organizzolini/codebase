import { z } from "zod";

import type { EventFilterGroup, EventFilterRule } from "./event-filter.types";

// ♟️ Constants

/** Caps each node's size, so requests cannot build unbounded SQL. */
export const EVENT_FILTER_MAXIMUM_BREADTH = 256;

/** Validates one condition from GraphQL, whose optional fields may be null. */
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

/** Validates a filter group and its nested groups, defaulting missing lists. */
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
