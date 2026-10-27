import type { SqlCondition } from "../events-database/events-database.types";
import type {
  FilterField,
  FilterNode,
  FilterQuery,
  FilterRule,
} from "@codebase/presentation";

/**
 * A filter compiled to a boolean SQL expression over the derived events
 * view, the condition `EventsDatabase.findEvents` applies.
 */
export type CompiledEventFilter = SqlCondition;

/**
 * A field the filter builder offers, holding the calendar's rule values.
 */
export type EventFilterField = FilterField<EventFilterValue>;

/**
 * A condition or a nested group of them.
 */
export type EventFilterNode = FilterNode<EventFilterValue>;

/**
 * The whole filter tree: always a group, so a flat filter and a nested one
 * compile the same way.
 */
export type EventFilterQuery = FilterQuery<EventFilterValue>;

/**
 * One condition of the ReUI filter tree, as the calendar stores it.
 */
export type EventFilterRule = FilterRule<EventFilterValue>;

/**
 * What a rule may hold: a list of picks for "is any of", a pair for a range,
 * or one value for text. Anything else in a restored link is treated as a
 * rule that is not finished yet.
 */
export type EventFilterValue =
  | (null | number | string)[]
  | null
  | number
  | string;
