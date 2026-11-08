/**
 * One group an event falls in at one level of a grouping: a tag, with its
 * name and full path, or a value derived from the event's times, whose label
 * the app writes.
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
 * One astronomical event as the calendar shows it. `start` and `end` are
 * equal for an instant, and `timezone` is the observer's IANA zone.
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
   * The groups the event falls in, one list per level of the query's
   * grouping: several for an event with several tags in a dimension, none
   * for one with no tag there. Empty when the query asked for no grouping.
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
 * One tag root, the dimension it names, and every tag beneath it, so the
 * filters can offer a field per root without knowing the roots ahead.
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
   * The events that carry the tag or any tag beneath it, among those that
   * overlap the window the facets were read for, or all of them with none.
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
 * The span the whole dataset covers and the zone its events were computed
 * in, so the calendar can render local time and tell "nothing matches" apart
 * from "outside the data".
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
export interface EventsWindow {
  end: Date;
  start: Date;
}
