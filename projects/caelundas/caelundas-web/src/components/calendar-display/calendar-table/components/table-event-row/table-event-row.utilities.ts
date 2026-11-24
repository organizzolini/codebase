import { INDENT_REM } from "../../calendar-table.constants";

import type { EventRowComparison } from "./table-event-row.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether two renderings of an event row draw the same, by event and depth, not identity.
 */
export function areEventRowsEqual(
  previous: Readonly<EventRowComparison>,
  next: Readonly<EventRowComparison>,
): boolean {
  return (
    previous.columns === next.columns &&
    previous.timeZone === next.timeZone &&
    previous.row.depth === next.row.depth &&
    previous.row.position === next.row.position &&
    previous.row.record === next.row.record
  );
}

/**
 * How far in from the left an event's first cell is padded, as a CSS length: its group's indent and a half rem more.
 */
export function getEventIndent(depth: number): string {
  return `${String(depth * INDENT_REM + 0.5)}rem`;
}
