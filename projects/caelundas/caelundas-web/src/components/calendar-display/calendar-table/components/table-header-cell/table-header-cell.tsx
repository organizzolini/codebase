import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  EyeOff,
  X,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  TableHead,
} from "@codebase/presentation";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";
import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { isPositionColumn } from "../../calendar-table.utilities";

import { SORT_ITEMS } from "./table-header-cell.constants";

import type { TableColumn } from "../../calendar-table.types";
import type { HeaderActions } from "./table-header-cell.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A column, how it is sorted, and what its menu can do. */
export interface TableHeaderCellProperties extends HeaderActions {
  className?: string;
  column: TableColumn;
  sortDirection?: "asc" | "desc" | undefined;
}

// 🧩 Component

/**
 * Renders a column's name as a pill with its sort arrow and a menu to sort, move, or deselect it.
 */
export function TableHeaderCell(
  properties: Readonly<TableHeaderCellProperties>,
): ReactNode {
  const {
    className,
    column,
    onClearSort,
    onMoveLeft,
    onMoveRight,
    onRemove,
    onSort,
    sortDirection,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const SortIcon = sortDirection === "asc" ? ArrowUp : ArrowDown;
  const sortLabel =
    sortDirection === "asc" ? "Sorted ascending" : "Sorted descending";
  const pill = (
    <span
      className={PILL_CLASS_NAME}
      data-testid="table-header-pill"
    >
      <TagLead
        icon={column.icon}
        id={column.id}
        label={column.label}
      />
      {column.label}
      {sortDirection === undefined ? null : (
        <SortIcon
          aria-label={sortLabel}
          className="size-3"
          data-testid="sort-indicator"
          role="img"
        />
      )}
    </span>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (isPositionColumn(column)) {
    return (
      <TableHead
        className={`${column.kind === "number" ? "w-12" : ""} ${className ?? ""}`}
      >
        {pill}
      </TableHead>
    );
  }

  // 🎨 Markup
  return (
    <TableHead className={className}>
      <ContextMenu>
        <ContextMenuTrigger
          render={<span className="inline-flex" />}
          tabIndex={0}
        >
          {pill}
        </ContextMenuTrigger>
        <ContextMenuContent
          align="start"
          side="bottom"
        >
          {SORT_ITEMS.map(({ direction, Icon, label }) => (
            <ContextMenuItem
              key={direction}
              disabled={onSort === undefined}
              onClick={() => {
                onSort?.(direction);
              }}
            >
              <Icon aria-hidden="true" />
              {label}
            </ContextMenuItem>
          ))}
          {onClearSort === undefined ? null : (
            <ContextMenuItem
              onClick={() => {
                onClearSort();
              }}
            >
              <X aria-hidden="true" />
              Clear sort
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={onMoveLeft === undefined}
            onClick={() => {
              onMoveLeft?.();
            }}
          >
            <ArrowLeft aria-hidden="true" />
            Move left
          </ContextMenuItem>
          <ContextMenuItem
            disabled={onMoveRight === undefined}
            onClick={() => {
              onMoveRight?.();
            }}
          >
            <ArrowRight aria-hidden="true" />
            Move right
          </ContextMenuItem>
          <ContextMenuItem
            disabled={onRemove === undefined}
            onClick={() => {
              onRemove?.();
            }}
          >
            <EyeOff aria-hidden="true" />
            Deselect column
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </TableHead>
  );
}
