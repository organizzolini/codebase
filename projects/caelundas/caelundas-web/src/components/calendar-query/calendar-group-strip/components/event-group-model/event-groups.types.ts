import type {
  CalendarEventRecord,
  EventFacetValue,
  TagMenuFlag,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { FilterOption } from "@codebase/presentation";
import type { ReactNode } from "react";

/**
 * A derived field's id: a time period.
 */
export type DerivedGroupId =
  | "day"
  | "hour"
  | "month"
  | "quarter"
  | "week"
  | "weekday"
  | "year";

/**
 * A dimension events group by: a tag root or derived time.
 */
export interface EventGroupField {
  /**
   * What the field groups by, in a sentence the field picker shows beneath
   * its name.
   */
  description: string;
  /**
   * The root's lucide icon, drawn beside its name, when it has one.
   */
  icon?: ReactNode;
  /**
   * `tag:` and the root's id for a tag root, or a derived field's id.
   */
  id: string;
  label: string;
  /**
   * For a tag root, the tag names at each depth below it, from depth 1; empty for a derived field.
   */
  levels: readonly (readonly string[])[];
  /**
   * Whether each menu offers the field: a tag root's flags, all on for a derived field.
   */
  menus: Readonly<Record<TagMenuFlag, boolean>>;
  /**
   * For a tag root, its tags that have tags beneath them, depth first; empty for a derived field.
   */
  nodes: readonly GroupNodeOption[];
  /**
   * For a tag root, its tags in filter tree order; empty for a derived field.
   */
  options: readonly FilterOption[];
  /**
   * For a tag root, every tag beneath it, depth first, as the API lists them; empty for a derived field.
   */
  values: readonly EventFacetValue[];
}

/**
 * The levels events are grouped by, outermost first; empty for no grouping.
 */
export type EventGrouping = readonly EventGroupLevel[];

/**
 * One grouping level: a field and, for tags, a parent.
 */
export interface EventGroupLevel {
  depth?: number | undefined;
  field: string;
  /**
   * The id of the tag whose children the level groups by; the root's own when absent.
   */
  parent?: string | undefined;
  tags?: readonly string[] | undefined;
}

/**
 * One group of events at a level, with its child groups.
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
  /**
   * What sorts the group among its siblings: its tag's place in the tree, or its derived value.
   */
  rank?: string;
}

/**
 * A tag with tags beneath it, which a grouping can split.
 */
export interface GroupNodeOption {
  count: number;
  /**
   * How far beneath its root the tag sits, so a root's children are 1.
   */
  depth: number;
  icon?: ReactNode;
  id: string;
  name: string;
  note?: string;
  /**
   * The id of the tag above, or null for a tag directly beneath the root.
   */
  parentId: null | string;
  /**
   * The names from beneath the root down to the tag, joined by " / ".
   */
  path: string;
}

/**
 * A grouping level within its field, with its tag above.
 */
export interface ResolvedGroupLevel {
  above: null | string | undefined;
  level: EventGroupLevel;
}
