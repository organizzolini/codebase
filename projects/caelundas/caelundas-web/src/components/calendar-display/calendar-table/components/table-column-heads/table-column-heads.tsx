import { TableRow } from "@codebase/presentation";

import { isPositionColumn } from "../../calendar-table.utilities";
import { TableHeaderCell } from "../table-header-cell/table-header-cell";

import {
  createHeaderActions,
  getSortDirection,
} from "./table-column-heads.utilities";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { TableColumn } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The table's column heads, their sorts, and handlers. */
export interface TableColumnHeadsProperties {
  className?: string;
  columns: readonly TableColumn[];
  onColumnsChange?:
    | ((columns: readonly string[] | undefined) => void)
    | undefined;
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
  sort?: readonly GroupSort[] | undefined;
}

// 🧩 Component

/**
 * Renders the header row: each column's name as a pill with a menu to sort, move, or deselect it.
 */
export function TableColumnHeads(
  properties: Readonly<TableColumnHeadsProperties>,
): ReactNode {
  const {
    className,
    columns,
    onColumnsChange,
    onSortChange,
    sort = [],
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const ids = columns
    .filter((column) => !isPositionColumn(column))
    .map((column) => column.id);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      className={`h-10 border-b-0 hover:bg-transparent ${className ?? ""}`}
      data-testid="table-column-heads"
    >
      {columns.map((column) => (
        <TableHeaderCell
          key={column.id}
          column={column}
          sortDirection={getSortDirection(sort, column)}
          {...createHeaderActions(column, {
            ids,
            onColumnsChange,
            onSortChange,
            sort,
          })}
        />
      ))}
    </TableRow>
  );
}
