// 🏷️ Types

import type { TableRowModel } from "../../components/calendar-display/calendar-table/calendar-table.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventGroupField,
  EventGroupLevel,
} from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

/**
 * The events and how they are grouped, sorted, and ranged.
 */
export interface UseTableRowsOptions {
  anchor: Date;
  dayCount: number;
  events: readonly CalendarEventRecord[];
  facets: readonly EventFacet[];
  fields: readonly EventGroupField[];
  grouping: readonly EventGroupLevel[];
  sort: readonly GroupSort[] | undefined;
  timeZone: string;
}

/**
 * The table's rows and the handlers that page a list and open or close a group.
 */
export interface UseTableRowsResult {
  /**
   * Loads another page of a list, by its group's id and how many of it show.
   */
  more: (listId: string, shown: number) => void;
  rows: TableRowModel[];
  /**
   * Opens a closed group and closes an open one, by its id.
   */
  toggle: (id: string) => void;
}
