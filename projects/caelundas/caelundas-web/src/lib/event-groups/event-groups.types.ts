import type { CalendarEventRecord } from "../events-database/events-database.types";
import type { FilterOption } from "@codebase/presentation";

/**
 * A derived field's id: a period an event starts in, or its duration.
 */
export type DerivedGroupId =
  | "day"
  | "duration"
  | "hour"
  | "month"
  | "quarter"
  | "week"
  | "weekday"
  | "year";

/**
 * A dimension the events can be grouped by: a tag root, whose tree the
 * grouping can go down into, or a value derived from each event's times.
 */
export interface EventGroupField {
  /**
   * What the field groups by, in a sentence the field picker shows beneath
   * its name.
   */
  description: string;
  /**
   * `tag:` and the root's id for a tag root, or a derived field's id.
   */
  id: string;
  label: string;
  /**
   * For a tag root, the names of the tags at each depth beneath it, from
   * depth 1 down, so the depth picker can say what each level holds; empty
   * for a derived field.
   */
  levels: readonly (readonly string[])[];
  /**
   * For a tag root, its tags in tree order as the filter lists them, so the
   * grouping picks from the same tree; empty for a derived field.
   */
  options: readonly FilterOption[];
}

/**
 * The levels events are grouped by, outermost first; empty for no grouping.
 */
export type EventGrouping = readonly EventGroupLevel[];

/**
 * One level of a grouping: the field it groups by and, for a tag root, the
 * tags it makes a group of, each holding the events under it. With none
 * picked it groups by the root's children, or by the tags `depth` beneath the
 * root of a link from before tags could be picked.
 */
export interface EventGroupLevel {
  depth?: number | undefined;
  field: string;
  tags?: readonly string[] | undefined;
}

/**
 * One group of events at one level of a grouping, and the groups it splits
 * into at the next level.
 */
export interface EventGroupNode {
  children: EventGroupNode[];
  /**
   * How many distinct events the group holds, however many of its own
   * groups each of them also falls in.
   */
  count: number;
  /**
   * Every event in the group, each once, earliest first.
   */
  events: CalendarEventRecord[];
  /**
   * Unique among every group of the tree: the keys of its ancestors and its
   * own, joined.
   */
  id: string;
  /**
   * The group's own key, or null for the events with no value at its level.
   */
  key: null | string;
  label: string;
  level: number;
  /**
   * The names from beneath the tag root down to the group's tag, for a tag
   * group; just its label otherwise.
   */
  path: readonly string[];
}
