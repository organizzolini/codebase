import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { TableCell, TableRow } from "@codebase/presentation";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";
import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { getGroupCounts } from "../../table-groups.utilities";

import {
  getGroupHeight,
  getGroupIndent,
  getGroupTint,
  getGroupTop,
} from "./table-group-row.utilities";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A group row's data, columns, zone, and open-close handler. */
export interface TableGroupRowProperties {
  className?: string;
  columns: readonly TableColumn[];
  levelIcons?: readonly (string | undefined)[] | undefined;
  /**
   * Colors by group id; absent when colors are off.
   */
  nodeColors?: ReadonlyMap<string, string> | undefined;
  onToggle?: ((id: string) => void) | undefined;
  row: Extract<TableRowModel, { kind: "group" }>;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders a group as a row with a cell per column: the group column holds its pill, the rest count distinct values.
 */
export function TableGroupRow(
  properties: Readonly<TableGroupRowProperties>,
): ReactNode {
  const {
    className,
    columns,
    levelIcons = [],
    nodeColors,
    onToggle,
    row,
    timeZone,
  } = properties;

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
      data-depth={row.depth}
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
              style={{
                ...getGroupTint(nodeColors, row.node),
                marginLeft: getGroupIndent(row.depth),
              }}
              type="button"
            >
              <Chevron aria-hidden="true" />
              <TagLead
                icon={levelIcons[row.node.level]}
                id={row.node.key ?? undefined}
                label={row.node.label}
              />
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
