import { INDENT_REM } from "../../calendar-table.constants";

import type { EventRowComparison } from "./table-event-row.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether two renderings of an event row draw the same: rows are rebuilt whenever a group opens, so they are told apart by their event and depth, not by identity.
 */
export function areEventRowsEqual(
  previous: Readonly<EventRowComparison>,
  next: Readonly<EventRowComparison>,
): boolean {
  return (
    previous.columns === next.columns &&
    previous.timeZone === next.timeZone &&
    previous.row.depth === next.row.depth &&
    previous.row.record === next.row.record
  );
}

/**
 * How far in from the left an event's first cell is padded, as a CSS length: its group's indent and a half rem more.
 */
export function getEventIndent(depth: number): string {
  return `${String(depth * INDENT_REM + 0.5)}rem`;
}
