import { ChevronsDown } from "lucide-react";

import { TableCell, TableRow } from "@codebase/presentation";

import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { getGroupIndent } from "../table-group-row/table-group-row.utilities";

import type { TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A row showing more of a list, and its handler. */
export interface TableMoreRowProperties {
  className?: string;
  columnCount: number;
  onMore?: ((listId: string, shown: number) => void) | undefined;
  row: Extract<TableRowModel, { kind: "more" }>;
}

// 🧩 Component

/**
 * Renders a row, all of it one button, that loads a list's next page when pressed.
 */
export function TableMoreRow(
  properties: Readonly<TableMoreRowProperties>,
): ReactNode {
  const { className, columnCount, onMore, row } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { groupId, next, shown, total } = row;
  const text = `1 to ${String(shown)} of ${String(total)}, load ${String(next)} more`;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      className={`hover:bg-transparent ${className ?? ""}`}
      data-testid="table-more-row"
    >
      <TableCell
        className="p-0"
        colSpan={columnCount}
      >
        <button
          aria-label={text}
          className="flex h-9 w-full cursor-pointer items-center px-2 text-left"
          onClick={() => {
            onMore?.(groupId, shown);
          }}
          type="button"
        >
          <span
            className={`${PILL_CLASS_NAME} text-sm font-medium`}
            style={{ marginLeft: getGroupIndent(row.depth) }}
          >
            <ChevronsDown aria-hidden="true" />
            {text}
          </span>
        </button>
      </TableCell>
    </TableRow>
  );
}
