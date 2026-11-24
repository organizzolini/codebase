import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { TableCell, TableRow } from "@codebase/presentation";

import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { getGroupCounts } from "../../calendar-table.utilities";

import {
  getGroupHeight,
  getGroupIndent,
  getGroupTop,
} from "./table-group-row.utilities";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A group row to draw, the columns of its cells, the zone its times are in, and its open-close handler. */
export interface TableGroupRowProperties {
  className?: string;
  columns: readonly TableColumn[];
  onToggle?: ((id: string) => void) | undefined;
  row: Extract<TableRowModel, { kind: "group" }>;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders a group of events as a table row with a cell for each column and no background of its own: the group column holds the pill that opens or closes it, indented by its depth, and each other column a pill counting its distinct values among the group's events.
 */
export function TableGroupRow(
  properties: Readonly<TableGroupRowProperties>,
): ReactNode {
  const { className, columns, onToggle, row, timeZone } = properties;

  // 🪝 Hooks
  const counts = useMemo(
    () => getGroupCounts(row.node, columns, timeZone),
    [columns, row.node, timeZone],
  );

  // 🏗 Setup
  const Chevron = row.expanded ? ChevronDown : ChevronRight;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      className={`sticky z-[5] hover:bg-transparent has-aria-expanded:bg-transparent ${className ?? ""}`}
      data-testid="table-group-row"
      style={{ height: getGroupHeight(), top: getGroupTop(row.depth) }}
    >
      {columns.map((column, index) => (
        <TableCell
          key={column.id}
          className="py-0"
        >
          {column.kind === "group" ? (
            <button
              aria-expanded={row.expanded}
              className={`${PILL_CLASS_NAME} cursor-pointer text-sm font-medium`}
              onClick={() => {
                onToggle?.(row.id);
              }}
              style={{ marginLeft: getGroupIndent(row.depth) }}
              type="button"
            >
              <Chevron aria-hidden="true" />
              {row.node.label}
            </button>
          ) : null}
          {column.kind !== "group" && (counts[index] ?? 0) > 0 ? (
            <span
              className={`${PILL_CLASS_NAME} text-xs`}
              data-testid="table-group-count"
            >
              {counts[index]} distinct
            </span>
          ) : null}
        </TableCell>
      ))}
    </TableRow>
  );
}
