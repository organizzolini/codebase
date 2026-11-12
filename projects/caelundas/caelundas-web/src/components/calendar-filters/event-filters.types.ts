import type {
  FilterField,
  FilterNode,
  FilterQuery,
  FilterRule,
} from "@codebase/presentation";

/**
 * A field the filter builder offers, holding the calendar's rule values.
 */
export type EventFilterField = FilterField<EventFilterValue>;

/**
 * A condition or a nested group of them.
 */
export type EventFilterNode = FilterNode<EventFilterValue>;

/**
 * The whole filter tree, always a group.
 */
export type EventFilterQuery = FilterQuery<EventFilterValue>;

/**
 * One condition of the ReUI filter tree, as the calendar stores it.
 */
export type EventFilterRule = FilterRule<EventFilterValue>;

/**
 * A rule value: picks, a range, or text; else unfinished.
 */
export type EventFilterValue =
  | (null | number | string)[]
  | null
  | number
  | string;
