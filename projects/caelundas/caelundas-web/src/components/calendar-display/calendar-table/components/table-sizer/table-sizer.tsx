import { TableHead, TableHeader, TableRow } from "@codebase/presentation";

import { getColumnWidth } from "../../calendar-table.utilities";

import type { TableColumn } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The columns whose widths the table is sized by. */
export interface TableSizerProperties {
  className?: string;
  columns: readonly TableColumn[];
}

// 🧩 Component

/**
 * Renders an unseen row that gives a fixed-layout table its column widths, so two tables line up.
 */
export function TableSizer(
  properties: Readonly<TableSizerProperties>,
): ReactNode {
  const { className, columns } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableHeader
      aria-hidden="true"
      className={`invisible ${className ?? ""}`}
      data-testid="table-sizer"
    >
      <TableRow className="h-0 hover:bg-transparent">
        {columns.map((column) => (
          <TableHead
            key={column.id}
            className="h-0 p-0"
            style={{ width: getColumnWidth(column) }}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
}
