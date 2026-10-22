import {
  COORDINATE_DECIMAL_PLACES,
  WRITTEN_ROWS_SCHEMA,
} from "./calendar-events.constants";

import type { DetectedCalendarEvent } from "../database/database.types";
import type { CalendarEventTagLink } from "./calendar-events.types";
import type { Moment } from "moment-timezone";

/**
 * The key an event is told apart by within one observer's upsert: its
 * summary and the instant it starts, the natural key less the coordinates
 * every event in the upsert shares.
 */
export function calendarEventKey(
  summary: string,
  start: Date | Moment,
): string {
  return `${summary}\u0000${start.toISOString()}`;
}

/**
 * A coordinate rounded to the decimals the column stores, as the string
 * `pg` exchanges a `numeric` as, so what is written and what is looked up
 * compare exactly.
 */
export function formatCoordinate(coordinate: number): string {
  return coordinate.toFixed(COORDINATE_DECIMAL_PLACES);
}

/**
 * The id each written row was stored under, by {@link calendarEventKey},
 * from the summary and start each row read back alongside its id, so the
 * order Postgres returns them in does not matter. They are checked rather
 * than trusted, because TypeORM types them loosely.
 */
export function mapWrittenIds(
  generatedMaps: readonly unknown[],
): Map<string, string> {
  return new Map(
    WRITTEN_ROWS_SCHEMA.parse(generatedMaps).map(({ id, start, summary }) => [
      calendarEventKey(summary, start),
      id,
    ]),
  );
}

/**
 * The links a written batch of events makes to the tag tree: one for each
 * node each event's raw tags resolve to, each pair once. Throws for an event
 * the write did not read back an id for, which would otherwise lose its tags.
 */
export function toTagLinks(
  batch: readonly (readonly [string, DetectedCalendarEvent])[],
  eventIds: ReadonlyMap<string, string>,
  tagIds: ReadonlyMap<string, readonly string[]>,
): CalendarEventTagLink[] {
  const links = new Map<string, CalendarEventTagLink>();

  for (const [key, event] of batch) {
    const calendarEventId = eventIds.get(key);

    if (calendarEventId === undefined) {
      throw new Error(`No id was read back for the event "${event.summary}"`);
    }

    for (const tagId of event.tags.flatMap((tag) => tagIds.get(tag) ?? [])) {
      links.set(`${calendarEventId}\u0000${tagId}`, { calendarEventId, tagId });
    }
  }

  return [...links.values()];
}
