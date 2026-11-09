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
 * The whole filter tree: always a group, so a flat filter and a nested one
 * compile the same way.
 */
export type EventFilterQuery = FilterQuery<EventFilterValue>;

/**
 * One condition of the ReUI filter tree, as the calendar stores it.
 */
export type EventFilterRule = FilterRule<EventFilterValue>;

/**
 * A rule's value: a list of picks, a range pair, or one text value; anything else is an unfinished rule.
 */
export type EventFilterValue =
  | (null | number | string)[]
  | null
  | number
  | string;
