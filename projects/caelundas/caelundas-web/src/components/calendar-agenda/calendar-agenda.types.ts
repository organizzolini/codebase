import type { EventGroupNode } from "../calendar-group-by/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/events-database.types";

// 🏷️ Types

/**
 * A row the agenda draws: a day, an event, or the button that lists more.
 */
export type AgendaListRow = AgendaRow | { kind: "later" };

/**
 * The days an agenda lists: `from` is included and `through` is not, both as
 * `YYYY-MM-DD` in `timeZone`.
 */
export interface AgendaRange {
  from: string;
  through: string;
  timeZone: string;
}

/**
 * One row of the agenda: a group's heading, a day's heading, or one event
 * under it. A day or an event in a group carries the group's id, because an
 * event in two groups is listed in both.
 */
export type AgendaRow =
  | {
      /**
       * The day as `YYYY-MM-DD` in the data's zone.
       */
      day: string;
      group?: string | undefined;
      kind: "day";
    }
  | {
      group?: string | undefined;
      kind: "event";
      /**
       * Whether the event began before the agenda's first day, under which
       * it is listed rather than under the day it began.
       */
      ongoing: boolean;
      record: CalendarEventRecord;
    }
  | { kind: "group"; node: EventGroupNode };
