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
}

/**
 * An astronomical event; equal start and end mark an instant.
 */
export interface CalendarEventRecord {
  color: null | string;
  description: string;
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
  location: null | string;
  start: Date;
  summary: string;
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
  id: string;
  name: string;
  /**
   * The tags beneath the root, depth first.
   */
  values: EventFacetValue[];
}

/**
 * A tag a facet offers.
 */
export interface EventFacetValue {
  /**
   * Events carrying the tag or any tag beneath it, among those overlapping the facets' window.
   */
  count: number;
  /**
   * How far beneath its root the tag sits, so a root's children are 1.
   */
  depth: number;
  id: string;
  name: string;
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
 * A half-open span of time: `start` is included and `end` is not.
 */
export interface Period {
  end: Date;
  start: Date;
}
