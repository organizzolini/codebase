// 🏷️ Types
import type { CalendarEvent } from "./entities/calendar-event.entity";
import type { UpdatableEntity } from "@codebase/persistence";

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
  "latitude" | "longitude" | "timezone" | keyof UpdatableEntity
> & {
  /** Raw tag strings, such as `aspects` and `moon`. */
  tags: string[];
};

/**
 * A stored {@link CalendarEvent} as `findInRange` returns it, with the names
 * of the tags it is linked to directly, ordered by code point. The nodes
 * above them in the tree are not included: the closure table holds those.
 */
export type StoredCalendarEvent = CalendarEvent &
  Pick<DetectedCalendarEvent, "tags">;
