// 🏷️ Types
import type { DetectedCalendarEvent } from "../database/database.types";
import type { CalendarEventTag } from "../database/entities/calendar-event-tag.entity";
import type { CalendarEvent } from "../database/entities/calendar-event.entity";
import type { TagPath } from "../tags/tags.types";
import type { UpdatableEntity } from "@codebase/persistence";
import type { Moment } from "moment-timezone";

/** The row an event becomes for one observer, before the database adds its own columns. */
export type CalendarEventRow = Omit<CalendarEvent, keyof UpdatableEntity>;

/** One link an upsert writes between an event and a node of the tag tree. */
export type CalendarEventTagLink = Pick<
  CalendarEventTag,
  "calendarEventId" | "tagId"
>;

/** An event to write, with the tag paths it is classified under. */
export interface ClassifiedCalendarEvent {
  event: DetectedCalendarEvent;
  paths: readonly TagPath[];
}

/** An observer location in decimal degrees. */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

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
