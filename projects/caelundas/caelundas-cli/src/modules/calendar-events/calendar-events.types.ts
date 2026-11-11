// 🏷️ Types
import type { CalendarEvent, CalendarEventTag } from "@codebase/caelundas-db";
import type { PostgresqlUpdatableEntity } from "@codebase/persistence";
import type { Moment } from "moment-timezone";

/** Event row for one observer, before the database adds columns. */
export type CalendarEventRow = Omit<
  CalendarEvent,
  keyof PostgresqlUpdatableEntity
>;

/** Upsert link from an event to a tag node. */
export type CalendarEventTagLink = Pick<
  CalendarEventTag,
  "calendarEventId" | "tagId"
>;

/** Detected event with raw tag strings, before the upsert's columns. */
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

/** Stored event from `findInRange`, with its directly linked tag names. */
export type StoredCalendarEvent = CalendarEvent &
  Pick<DetectedCalendarEvent, "tags">;

/**
 * `RETURNING` row: database id, and summary, start and end.
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
