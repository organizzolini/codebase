// 🏷️ Types
import type { CalendarEvent, CalendarEventTag } from "@codebase/caelundas-db";
import type { PostgresqlUpdatableEntity } from "@codebase/persistence";
import type { Moment } from "moment-timezone";

/** Event row for one observer, before the database adds or generates columns. */
export type CalendarEventRow = Omit<
  CalendarEvent,
  | "endLocalDay"
  | "startLocalDay"
  | "startLocalHour"
  | keyof PostgresqlUpdatableEntity
>;

/** Upsert link from an event to a tag node. */
export type CalendarEventTagLink = Pick<
  CalendarEventTag,
  "calendarEventId" | "tagId"
>;

/** A detected event, in iCalendar terms, before its row. */
export interface DetectedCalendarEvent {
  /** Detail on it, stored as the row's `note`. */
  description: string;
  end: Moment;
  start: Moment;
  /** What happened, stored as the row's `name`. */
  summary: string;
  /** Raw tag strings, such as `aspects` and `moon`. */
  tags: string[];
}

/** An observer location and the IANA timezone derived from it. */
export interface Observer extends Coordinates {
  timezone: string;
}

/**
 * `RETURNING` row: database id, and name, start and end.
 */
export interface WrittenCalendarEvent {
  end: Date | Moment;
  id: string;
  name: string;
  start: Date | Moment;
}

/** An observer location in decimal degrees. */
interface Coordinates {
  latitude: number;
  longitude: number;
}
