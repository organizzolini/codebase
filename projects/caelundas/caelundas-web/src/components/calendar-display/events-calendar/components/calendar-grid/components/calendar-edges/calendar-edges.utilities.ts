import { formatCalendarDate } from "../../../calendar-window/calendar-window.utilities";

import {
  DAY_MILLISECONDS,
  EDGE_ID_PREFIX,
  MINUTE_MILLISECONDS,
  SECOND_FORMATS,
  SECOND_MILLISECONDS,
  SECONDS_PER_PART,
} from "./calendar-edges.constants";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { EdgeBlocks, EdgeOptions } from "./calendar-edges.types";

// 🔏 Private Functions

/**
 * Adds a block for each long event's start day, from its start to midnight, and its end day, from midnight to its end.
 */
export function addEdgeBlocks(
  events: readonly CalendarEventRecord[],
  options: Readonly<EdgeOptions>,
): EdgeBlocks {
  const origins = new Map<string, CalendarEventRecord>();
  const blocks: CalendarEventRecord[] = [];

  for (const event of events) {
    if (event.end.getTime() - event.start.getTime() > DAY_MILLISECONDS) {
      for (const block of getEventBlocks(event, options)) {
        blocks.push(block);
        origins.set(block.id, event);
      }
    }
  }

  return { blocks, origins };
}

/**
 * Whether an event id is a block marking where a long event starts or ends.
 */
export function isEdgeId(id: string): boolean {
  return id.startsWith(EDGE_ID_PREFIX);
}

/**
 * A block standing for a long event over a stretch inside one of its days.
 */
function createBlock(
  event: CalendarEventRecord,
  edge: Readonly<{ end: Date; side: "end" | "start"; start: Date }>,
): CalendarEventRecord {
  return {
    ...event,
    durationMinutes: Math.round(
      (edge.end.getTime() - edge.start.getTime()) / MINUTE_MILLISECONDS,
    ),
    end: edge.end,
    id: `${EDGE_ID_PREFIX}${edge.side}:${event.id}`,
    start: edge.start,
  };
}

/**
 * The span of a long event's last day: from midnight to its real end.
 */
function getEndEdge(
  event: CalendarEventRecord,
  into: number,
): { end: Date; side: "end"; start: Date } {
  return {
    end: event.end,
    side: "end",
    start: new Date(event.end.getTime() - into),
  };
}

/**
 * The blocks one long event gets on the days shown.
 */
function getEventBlocks(
  event: CalendarEventRecord,
  options: Readonly<EdgeOptions>,
): CalendarEventRecord[] {
  const { firstDay, lastDay, timeZone } = options;
  const startDay = formatCalendarDate(event.start, timeZone);
  const endDay = formatCalendarDate(
    new Date(event.end.getTime() - 1),
    timeZone,
  );
  const blocks: CalendarEventRecord[] = [];

  if (startDay >= firstDay && startDay <= lastDay) {
    const into = getMillisecondOfDay(event.start, timeZone);

    blocks.push(createBlock(event, getStartEdge(event, into)));
  }

  if (endDay >= firstDay && endDay <= lastDay) {
    const last = new Date(event.end.getTime() - 1);
    const into = getMillisecondOfDay(last, timeZone) + 1;

    blocks.push(createBlock(event, getEndEdge(event, into)));
  }

  return blocks;
}

// 🌎 Public Functions

/**
 * The milliseconds from the zone's midnight to an instant.
 */
function getMillisecondOfDay(date: Date, timeZone: string): number {
  let format = SECOND_FORMATS.get(timeZone);

  if (format === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      minute: "numeric",
      second: "numeric",
      timeZone,
    });
    SECOND_FORMATS.set(timeZone, format);
  }

  let seconds = 0;

  for (const part of format.formatToParts(date)) {
    const weight = SECONDS_PER_PART.get(part.type);

    // A literal such as ":" is no number, and would make the whole sum one.
    seconds += weight === undefined ? 0 : Number(part.value) * weight;
  }

  return (
    seconds * SECOND_MILLISECONDS +
    (((date.getTime() % SECOND_MILLISECONDS) + SECOND_MILLISECONDS) %
      SECOND_MILLISECONDS)
  );
}

/**
 * The span of a long event's first day: from its real start to midnight.
 */
function getStartEdge(
  event: CalendarEventRecord,
  into: number,
): { end: Date; side: "start"; start: Date } {
  return {
    end: new Date(event.start.getTime() + DAY_MILLISECONDS - into),
    side: "start",
    start: event.start,
  };
}
