// 🏷️ Types

import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";

/**
 * A column of the table: what its cells show of each event.
 */
export interface TableColumn {
  id: string;
  kind: "end" | "group" | "name" | "start" | "tag";
  label: string;
  /**
   * For a tag column, the path whose tags the cells name, a root's name or a tag's whole path.
   */
  prefix?: string;
}

/**
 * How much of each list shows: the size of a page, the pages loaded for every list, and how far a list's own Show more row has loaded it.
 */
export interface TablePaging {
  limit?: number | undefined;
  limits?: ReadonlyMap<string, number> | undefined;
  pages?: number | undefined;
}

/**
 * A row of the table: a group of events, which opens and closes, an event, or a row that shows more events of a list.
 */
export type TableRowModel =
  | {
      depth: number;
      /**
       * The list it follows the first events of: a group's id, or the flat list's.
       */
      groupId: string;
      id: string;
      kind: "more";
      /**
       * How many events the next page adds: a page, or what is left of the list.
       */
      next: number;
      /**
       * How many events of the list are not shown yet.
       */
      remaining: number;
      /**
       * How many events of the list are shown.
       */
      shown: number;
      /**
       * How many events the list holds.
       */
      total: number;
    }
  | {
      depth: number;
      expanded: boolean;
      id: string;
      kind: "group";
      node: EventGroupNode;
    }
  | {
      depth: number;
      id: string;
      kind: "event";
      record: CalendarEventRecord;
    };

/**
 * A tag a tag column's cell names: its id, to find its icon by, and its name.
 */
export interface TagCellEntry {
  id: string;
  label: string;
}
