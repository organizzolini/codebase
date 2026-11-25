import { ChevronDown, ChevronRight } from "lucide-react";
import { createElement } from "react";

import { GROUP_TINT_PERCENT } from "../../../calendar-table/calendar-table.constants";
import { getNameTint } from "../../../calendar-table/components/table-name-cell/table-name-cell.utilities";

import type { CSSProperties, ReactNode } from "react";

// 🌎 Public Functions

/**
 * The caret a group row leads with: right when closed, down when open.
 */
export function createRowCaret(collapsed: boolean): ReactNode {
  return createElement(collapsed ? ChevronRight : ChevronDown, {
    "aria-hidden": true,
    className: "mr-1 inline size-3.5 shrink-0 align-middle",
  });
}

/**
 * The class and tint of a row's name pill; muted for the events with no value.
 */
export function getRowPill(
  fallback: boolean,
  color?: string,
): { className: string; style: CSSProperties | undefined } {
  return {
    className: fallback ? "text-muted-foreground truncate" : "truncate",
    style: getNameTint(color ?? null, GROUP_TINT_PERCENT),
  };
}
