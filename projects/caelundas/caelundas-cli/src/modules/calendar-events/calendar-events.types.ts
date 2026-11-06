// 🏷️ Types
import type {
  CalendarEvent,
  CalendarEventTag,
} from "@codebase/caelundas-entities";
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
 * A {@link CalendarEvent} as a detector builds it and a writer reads it:
 * without the fields the database owns, the id and audit columns, or the
 * observer's coordinates and timezone, which `CalendarEventsService.upsert`
 * adds for the observer it stores the event for. Its `tags` are raw strings,
 * which the upsert resolves to nodes of the tag tree. A stored row is one as
 * well, and the writers are passed the stored rows `findInRange` returns, not
 * detected ones.
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
 * A stored {@link CalendarEvent} as `findInRange` returns it, with the names
 * of the tags it is linked to directly, ordered by code point. The nodes
 * above them in the tree are not included: the closure table holds those.
 */
export type StoredCalendarEvent = CalendarEvent &
  Pick<DetectedCalendarEvent, "tags">;

/** An observer location in decimal degrees. */
interface Coordinates {
  latitude: number;
  longitude: number;
}
