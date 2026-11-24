import { TableCell, TableRow } from "@codebase/presentation";

import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { getCellText, isPositionColumn } from "../../calendar-table.utilities";
import { TableNameCell } from "../table-name-cell/table-name-cell";
import { TableTagCell } from "../table-tag-cell/table-tag-cell";

import { getEventIndent } from "./table-event-row.utilities";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** An event row's data, columns, and the zone its times are in. */
export interface TableEventRowProperties {
  className?: string;
  columns: readonly TableColumn[];
  row: Extract<TableRowModel, { kind: "event" }>;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders an event as a table row, a cell for each column, the first indented beneath its groups.
 */
export function TableEventRow(
  properties: Readonly<TableEventRowProperties>,
): ReactNode {
  const { className, columns, row, timeZone } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      className={className}
      data-testid="table-event-row"
    >
      {columns.map((column, index) => (
        <TableCell
          key={column.id}
          style={
            index === 0 ? { paddingLeft: getEventIndent(row.depth) } : undefined
          }
        >
          {isPositionColumn(column) ? (
            <span
              className={`${PILL_CLASS_NAME} text-muted-foreground text-xs tabular-nums`}
              data-testid="table-position-pill"
            >
              {row.position}
            </span>
          ) : null}
          {column.kind === "name" ? (
            <TableNameCell record={row.record} />
          ) : null}
          {column.kind === "tag" ? (
            <TableTagCell
              prefix={column.prefix ?? ""}
              record={row.record}
            />
          ) : null}
          {column.kind === "start" || column.kind === "end" ? (
            <span
              className={PILL_CLASS_NAME}
              data-testid="table-time-pill"
            >
              {getCellText(row.record, column, timeZone)}
            </span>
          ) : null}
        </TableCell>
      ))}
    </TableRow>
  );
}
