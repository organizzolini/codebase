/**
 * A group an event falls in: a tag or derived value.
 */
export interface CalendarEventGroupKey {
  key: string;
  label: null | string;
  /**
   * A tag's names from its root down, joined by " / "; null for a derived
   * value.
   */
  path: null | string;
  /**
   * What sorts a tag's group among its siblings as the tags are meant to read; null for a derived value.
   */
  rank?: null | string;
}

/**
 * An astronomical event; equal start and end mark an instant.
 */
export interface CalendarEventRecord {
  /**
   * The color views paint it in, set by `colorEvents`; none for a view's default.
   */
  color: null | string;
  /**
   * Whole minutes from start to end, 0 for an instant.
   */
  durationMinutes: number;
  end: Date;
  /**
   * The groups an event falls in, one list per grouping level: several for several tags, none for no tag.
   */
  groups: CalendarEventGroupKey[][];
  id: string;
  name: string;
  note: string;
  start: Date;
  tags: CalendarEventTag[];
  timezone: string;
}

/**
 * A node of the tag tree attached to an event.
 */
export interface CalendarEventTag {
  /**
   * How many ancestors the node has, so a root is 0.
   */
  depth: number;
  id: string;
  name: string;
  /**
   * Every name from the root down to this node, joined by " / ".
   */
  path: string;
}

/**
 * A tag root and every tag beneath it.
 */
export interface EventFacet {
  /**
   * The slug of the root's lucide icon, if it has one.
   */
  icon?: null | string;
  id: string;
  /**
   * Whether each menu offers the root; every menu does when absent.
   */
  isFilterable?: boolean;
  isGroupable?: boolean;
  isSelectable?: boolean;
  isSortable?: boolean;
  name: string;
  /**
   * What the root means, if it says.
   */
  note?: null | string;
  /**
   * The tags beneath the root, depth first.
   */
  values: EventFacetValue[];
}

/**
 * A tag a query offers.
 */
export interface EventFacetValue {
  /**
   * The other parents of a tag under several, as paths from the root.
   */
  alsoUnder?: readonly string[];
  /**
   * Events carrying the tag or any tag beneath it, among those overlapping the facets' window.
   */
  count: number;
  /**
   * How far beneath its root the tag sits, so a root's children are 1.
   */
  depth: number;
  /**
   * The slug of the tag's lucide icon, if it has one.
   */
  icon?: null | string;
  id: string;
  /**
   * Whether each menu offers the tag; a saved link to it works either way, and every menu offers it when absent.
   */
  isFilterable?: boolean;
  isGroupable?: boolean;
  isSelectable?: boolean;
  isSortable?: boolean;
  name: string;
  /**
   * What the tag means, if it says.
   */
  note?: null | string;
  /**
   * The names from beneath the root down to this tag, joined by " / ".
   */
  path: string;
}

/**
 * The span the data covers, and its zone.
 */
export interface EventsDataset {
  count: number;
  end: Date;
  start: Date;
  timezone: string;
}

/**
 * A tag a menu lists, and whether it is only a folder.
 */
export interface OfferedValue {
  folder: boolean;
  value: EventFacetValue;
}

/**
 * A half-open span of time: `start` is included and `end` is not.
 */
export interface Period {
  end: Date;
  start: Date;
}

/**
 * A menu flag: Filter, Group, Select or Sort.
 */
export type TagMenuFlag =
  | "isFilterable"
  | "isGroupable"
  | "isSelectable"
  | "isSortable";
