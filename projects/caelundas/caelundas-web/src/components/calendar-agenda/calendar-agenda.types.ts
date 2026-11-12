import type { EventGroupNode } from "../calendar-group-by/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/calendar-records.types";

// 🏷️ Types

/**
 * An agenda row: a day, an event, or the show-more button.
 */
export type AgendaListRow = AgendaRow | { kind: "later" };

/**
 * Agenda days: `from` included, `through` excluded, both `YYYY-MM-DD` in `timeZone`.
 */
export interface AgendaRange {
  from: string;
  through: string;
  timeZone: string;
}

/**
 * An agenda row: a group, a day, or an event.
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
