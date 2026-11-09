// 🏷️ Types
import type { CalendarEvent, CalendarEventTag } from "@codebase/caelundas-db";
import type { PostgresqlUpdatableEntity } from "@codebase/persistence";
import type { Moment } from "moment-timezone";

/** The row an event becomes for one observer, before the database adds its own columns. */
export type CalendarEventRow = Omit<
  CalendarEvent,
  keyof PostgresqlUpdatableEntity
>;

/** One link an upsert writes between an event and a node of the tag tree. */
export type CalendarEventTagLink = Pick<
  CalendarEventTag,
  "calendarEventId" | "tagId"
>;

/**
 * A detected event, without the id, audit columns, coordinates or timezone the upsert adds; its tags are raw strings.
 */
export type DetectedCalendarEvent = Omit<
  CalendarEvent,
  "latitude" | "longitude" | "timezone" | keyof PostgresqlUpdatableEntity
> & {
  /** Raw tag strings, such as `aspects` and `moon`. */
  tags: string[];
};

/** The range and location whose events {@link CalendarEventsService.findInRange} returns. */
export interface FindInRangeParameters extends Coordinates {
  /** Exclusive end of the range. */
  end: Moment;

  /** Inclusive start of the range. */
  start: Moment;
}

/** An observer location and the IANA timezone derived from it. */
export interface Observer extends Coordinates {
  timezone: string;
}

/**
 * A stored event as `findInRange` returns it, with the names of its directly linked tags.
 */
export type StoredCalendarEvent = CalendarEvent &
  Pick<DetectedCalendarEvent, "tags">;

/**
 * A `RETURNING` row: its database id, and the summary, start and end that
 * identify it per observer; `Date`s, not `Moment`s.
 */
export interface WrittenCalendarEvent {
  end: Date | Moment;
  id: string;
  start: Date | Moment;
  summary: string;
}

/** An observer location in decimal degrees. */
interface Coordinates {
  latitude: number;
  longitude: number;
}
