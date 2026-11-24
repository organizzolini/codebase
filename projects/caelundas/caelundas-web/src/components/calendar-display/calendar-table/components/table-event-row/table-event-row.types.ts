// 🏷️ Types

import type { TableColumn, TableRowModel } from "../../calendar-table.types";

/**
 * What a row's drawing depends on, which is what decides whether it draws again.
 */
export interface EventRowComparison {
  columns: readonly TableColumn[];
  row: Extract<TableRowModel, { kind: "event" }>;
  timeZone: string;
}
