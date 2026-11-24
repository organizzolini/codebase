import { TableHead, TableRow } from "@codebase/presentation";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";

import type { TableColumn } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The columns whose names head the table. */
export interface TableColumnHeadsProperties {
  className?: string;
  columns: readonly TableColumn[];
}

// 🧩 Component

/**
 * Renders the header row: each column's name, led by its symbol, icon, or the generic tag icon.
 */
export function TableColumnHeads(
  properties: Readonly<TableColumnHeadsProperties>,
): ReactNode {
  const { className, columns } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      className={`h-10 ${className ?? ""}`}
      data-testid="table-column-heads"
    >
      {columns.map((column) => (
        <TableHead
          key={column.id}
          className={column.kind === "number" ? "w-12" : undefined}
        >
          <span className="inline-flex items-center gap-1">
            <TagLead
              icon={column.icon}
              id={column.id}
              label={column.label}
            />
            {column.label}
          </span>
        </TableHead>
      ))}
    </TableRow>
  );
}
