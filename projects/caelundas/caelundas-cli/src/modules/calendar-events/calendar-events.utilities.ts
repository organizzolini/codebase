import { tagPathKey } from "../tags/tags.utilities";

import {
  COORDINATE_DECIMAL_PLACES,
  WRITTEN_ROWS_SCHEMA,
} from "./calendar-events.constants";

import type {
  CalendarEventTagLink,
  ClassifiedCalendarEvent,
} from "./calendar-events.types";
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
 * path each event is classified under, to the node `tagIds` resolved it to,
 * each pair once. Throws for an event the write did not read back an id
 * for, or a path `tagIds` lacks, either of which would lose its tags.
 */
export function toTagLinks(
  batch: readonly (readonly [string, ClassifiedCalendarEvent])[],
  eventIds: ReadonlyMap<string, string>,
  tagIds: ReadonlyMap<string, string>,
): CalendarEventTagLink[] {
  const links = new Map<string, CalendarEventTagLink>();

  for (const [key, { event, paths }] of batch) {
    const calendarEventId = eventIds.get(key);

    if (calendarEventId === undefined) {
      throw new Error(`No id was read back for the event "${event.summary}"`);
    }

    for (const path of paths) {
      const tagId = tagIds.get(tagPathKey(path));
      if (tagId === undefined) {
        throw new Error(
          `The tag "${path.join(" > ")}" of the event "${event.summary}" was not resolved`,
        );
      }
      links.set(`${calendarEventId}\u0000${tagId}`, { calendarEventId, tagId });
    }
  }

  return [...links.values()];
}
