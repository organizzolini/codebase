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
 * The calendar's only way to read events. One implementation runs in a
 * browser worker over sqlite-wasm and another over `node:sqlite` in tests;
 * both are built from the same SQL.
 */
export interface EventsDatabase {
  describeDataset(): Promise<EventsDataset | null>;
  findEvents(query: EventsQuery): Promise<CalendarEventRecord[]>;
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
 * What a query asks for. Only the window exists so far; filters and grouping
 * join it as their own fields.
 */
export interface EventsQuery {
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
 * Runs one read-only statement and resolves its rows. The browser's worker
 * and the tests' `node:sqlite` database each implement it, so both run the
 * same SQL through {@link createEventsDatabase}.
 */
export interface SqlExecutor {
  select(sql: string, parameters: readonly SqlValue[]): Promise<SqlRow[]>;
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
