import { tagPathKey } from "../tags/tags.utilities";

import { COORDINATE_DECIMAL_PLACES } from "./calendar-events.constants";

import type { CalendarEvent } from "../database/entities/calendar-event.entity";
import type {
  CalendarEventTagLink,
  ClassifiedCalendarEvent,
} from "./calendar-events.types";
import type { Moment } from "moment-timezone";

/**
 * The key an event is told apart by within one observer's upsert: its
 * summary and the instants it starts and ends, the natural key less the
 * coordinates every event in the upsert shares. A boundary and a span may
 * share a title and a start, so the end tells them apart.
 */
export function calendarEventKey(
  summary: string,
  start: Date | Moment,
  end: Date | Moment,
): string {
  return `${summary}\u0000${start.toISOString()}\u0000${end.toISOString()}`;
}

/**
 * A coordinate rounded to the decimals the column stores, as the text the
 * column holds, so what is written and what is looked up compare exactly.
 */
export function formatCoordinate(coordinate: number): string {
  return coordinate.toFixed(COORDINATE_DECIMAL_PLACES);
}

/**
 * The id each stored row is stored under, by {@link calendarEventKey}, from
 * the summary, start and end each row reads back with its id, so the order
 * SQLite answers in does not matter. Only the rows whose key is in `wanted`
 * are included, as the select that reads them back also finds neighbors.
 */
export function mapWrittenIds(
  stored: readonly Pick<CalendarEvent, "end" | "id" | "start" | "summary">[],
  wanted: ReadonlySet<string>,
): Map<string, string> {
  const ids = new Map<string, string>();

  for (const { end, id, start, summary } of stored) {
    const key = calendarEventKey(summary, start, end);

    if (wanted.has(key)) {
      ids.set(key, id);
    }
  }

  return ids;
}

/**
 * Text with no leading or trailing whitespace and each run of whitespace
 * inside it collapsed to one space, so a title never begins with a space or
 * carries a double one, whatever a detector built it from.
 */
export function tidyText(text: string): string {
  return text.replaceAll(/\s+/gu, " ").trim();
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
