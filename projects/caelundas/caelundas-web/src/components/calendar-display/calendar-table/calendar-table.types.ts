// 🏷️ Types

import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";

/**
 * Days: `from` included, `through` excluded, both `YYYY-MM-DD` in `timeZone`.
 */
export interface DayRange {
  from: string;
  through: string;
  timeZone: string;
}

/**
 * A row's clip-path and divider color.
 */
export interface StickyPlan {
  clip: string;
  line: string;
  shift: string;
}

/**
 * A body row's edges, group depth, and whether it is stuck.
 */
export interface StickyRow {
  bottom: number;
  depth: number | undefined;
  stuck: boolean;
  top: number;
}

/**
 * A column of the table: what its cells show of each event.
 */
export interface TableColumn {
  /**
   * The lucide slug that leads the header's name when it has no symbol.
   */
  icon?: string;
  id: string;
  kind: "duration" | "end" | "group" | "name" | "number" | "start" | "tag";
  label: string;
  /**
   * For a deep tag column, the tag's own name.
   */
  name?: string;
  /**
   * For a tag column, the path whose tags the cells name, a root's name or a tag's whole path.
   */
  prefix?: string;
}

/**
 * How much of each list shows: page size and pages loaded.
 */
export interface TablePaging {
  limit?: number | undefined;
  limits?: ReadonlyMap<string, number> | undefined;
  pages?: number | undefined;
}

/**
 * A table row: a group, an event, or a row showing more.
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
      /**
       * Its place in its list, from 1, counting the pages loaded before it.
       */
      position: number;
      record: CalendarEventRecord;
    };

/**
 * A tag a tag column names: its id and its name.
 */
export interface TagCellEntry {
  id: string;
  label: string;
}
