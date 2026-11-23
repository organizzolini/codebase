import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * Whether similar events are clustered, and which clusters are open.
 */
export interface AgendaClustering {
  expanded: ReadonlySet<string>;
}

/**
 * An agenda row that is an event.
 */
export type AgendaEventRow = Extract<AgendaRow, { kind: "event" }>;

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

/** An agenda row: a group, day, event cluster, or event. */
export type AgendaRow =
  | {
      /**
       * How many events the cluster stands for.
       */
      count: number;
      /**
       * Whether its events are listed beneath it.
       */
      expanded: boolean;
      group?: string | undefined;
      id: string;
      kind: "cluster";
      label: string;
      ongoing: boolean;
    }
  | {
      /**
       * The day as `YYYY-MM-DD` in the data's zone.
       */
      day: string;
      group?: string | undefined;
      kind: "day";
    }
  | {
      /**
       * What clusters the event with the day's others: its kind and whether it was already under way.
       */
      clusterKey: string;
      group?: string | undefined;
      kind: "event";
      /**
       * The name of the event's kind, which clusters it with the day's others of it.
       */
      kindLabel: string;
      /**
       * Whether the event began before the agenda's first day, under which
       * it is listed rather than under the day it began.
       */
      ongoing: boolean;
      record: CalendarEventRecord;
    }
  | { kind: "group"; node: EventGroupNode };
