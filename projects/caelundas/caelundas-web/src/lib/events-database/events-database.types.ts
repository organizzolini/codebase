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
   * The events that carry the tag or any tag beneath it.
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
 * The calendar's only way to read events. One implementation runs in a
 * browser worker over sqlite-wasm and another over `node:sqlite` in tests;
 * both are built from the same SQL.
 */
export interface EventsDatabase {
  describeDataset(): Promise<EventsDataset | null>;
  findEvents(query: EventsQuery): Promise<CalendarEventRecord[]>;
  findFacets(): Promise<EventFacet[]>;
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
 * What a query asks for: a window, and optionally a condition the events in
 * it must also meet, such as a compiled filter.
 */
export interface EventsQuery {
  filter?: null | SqlCondition | undefined;
  /**
   * One source of group keys per level of a grouping, in order.
   */
  groups?: readonly SqlGroupSource[] | undefined;
  window: EventsWindow;
}

/**
 * A half-open span of time: `start` is included and `end` is not.
 */
export interface EventsWindow {
  end: Date;
  start: Date;
}

/**
 * A boolean SQL expression over the derived events view, aliased `e`, with
 * its values bound to `?` placeholders in order.
 */
export interface SqlCondition {
  parameters: SqlValue[];
  sql: string;
}

/**
 * Runs one read-only statement and resolves its rows. The browser's worker
 * and the tests' `node:sqlite` database each implement it, so both run the
 * same SQL through {@link createEventsDatabase}.
 */
export interface SqlExecutor {
  select(sql: string, parameters: readonly SqlValue[]): Promise<SqlRow[]>;
}

/**
 * A select over the derived events view's row `e` answering the groups that
 * event falls in at one level, as `key`, `label` and `path` columns, with its
 * values bound to `?` placeholders in order.
 */
export interface SqlGroupSource {
  parameters: SqlValue[];
  sql: string;
}

/**
 * One result row, keyed by column name. Each driver types its columns its own
 * way, so values are read as unknown and narrowed where they are mapped.
 */
export type SqlRow = Readonly<Record<string, unknown>>;

/**
 * A value bound to a `?` placeholder.
 */
export type SqlValue = null | number | string;
