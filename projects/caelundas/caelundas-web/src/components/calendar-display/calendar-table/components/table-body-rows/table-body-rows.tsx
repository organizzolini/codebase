import { TableBody } from "@codebase/presentation";

import {
  MemoEventRow,
  MemoGroupRow,
  MemoMoreRow,
} from "../../table-rows.constants";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The rows, their columns, zone, and handlers. */
export interface TableBodyRowsProperties {
  className?: string;
  columns: readonly TableColumn[];
  levelIcons?: readonly (string | undefined)[] | undefined;
  more?: ((listId: string, shown: number) => void) | undefined;
  nodeColors?: ReadonlyMap<string, string> | undefined;
  onToggle?: ((id: string) => void) | undefined;
  rows: readonly TableRowModel[];
  timeZone: string;
}

// 🧩 Component

/**
 * Renders each row as a group, a button that loads more, or an event.
 */
export function TableBodyRows(
  properties: Readonly<TableBodyRowsProperties>,
): ReactNode {
  const {
    className,
    columns,
    levelIcons,
    more,
    nodeColors,
    onToggle,
    rows,
    timeZone,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableBody className={className}>
      {rows.map((row) => {
        if (row.kind === "group") {
          return (
            <MemoGroupRow
              key={row.id}
              columns={columns}
              levelIcons={levelIcons}
              nodeColors={nodeColors}
              onToggle={onToggle}
              row={row}
              timeZone={timeZone}
            />
          );
        }

        if (row.kind === "more") {
          return (
            <MemoMoreRow
              key={row.id}
              columnCount={columns.length}
              onMore={more}
              row={row}
            />
          );
        }

        return (
          <MemoEventRow
            key={row.id}
            columns={columns}
            row={row}
            timeZone={timeZone}
          />
        );
      })}
    </TableBody>
  );
}
