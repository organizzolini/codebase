import { Table, TableHeader } from "@codebase/presentation";

import { getTableWidth } from "../../calendar-table.utilities";
import { TableColumnHeads } from "../table-column-heads/table-column-heads";
import { TableSizer } from "../table-sizer/table-sizer";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { TableColumn } from "../../calendar-table.types";
import type { ReactNode, Ref as Reference } from "react";

// 🔖 Type

/** The columns, sorts, handlers, and the strip's scroller ref. */
export interface TableHeadStripProperties {
  className?: string;
  columns: readonly TableColumn[];
  onColumnsChange?:
    | ((columns: readonly string[] | undefined) => void)
    | undefined;
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
  scrollReference?: Reference<HTMLDivElement>;
  sort?: readonly GroupSort[] | undefined;
}

// 🧩 Component

/**
 * Renders the column heads above the scroller, so rows never pass behind them; the body's scroll moves it sideways.
 */
export function TableHeadStrip(
  properties: Readonly<TableHeadStripProperties>,
): ReactNode {
  const {
    className,
    columns,
    onColumnsChange,
    onSortChange,
    scrollReference,
    sort,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      ref={scrollReference}
      className={`shrink-0 overflow-hidden [scrollbar-gutter:stable] [&>div]:overflow-visible ${className ?? ""}`}
      data-testid="table-head-strip"
    >
      <Table
        className="table-fixed [&_th]:overflow-hidden"
        style={{ width: getTableWidth(columns) }}
      >
        <TableSizer columns={columns} />
        <TableHeader>
          <TableColumnHeads
            columns={columns}
            onColumnsChange={onColumnsChange}
            onSortChange={onSortChange}
            sort={sort}
          />
        </TableHeader>
      </Table>
    </div>
  );
}
