// 🏷️ Types

import type { TableColumn, TableRowModel } from "../../calendar-table.types";

/**
 * What decides whether an event row draws again.
 */
export interface EventRowComparison {
  columns: readonly TableColumn[];
  row: Extract<TableRowModel, { kind: "event" }>;
  timeZone: string;
}
