import { useEffect, useRef as useReference } from "react";

import { Button, TableCell, TableRow } from "@codebase/presentation";

import { getGroupIndent } from "../table-group-row/table-group-row.utilities";

import { LOAD_MARGIN } from "./table-more-row.constants";

import type { TableRowModel } from "../../calendar-table.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A row that shows more of a list, how many columns it spans, and its handler. */
export interface TableMoreRowProperties {
  className?: string;
  columnCount: number;
  onMore?: ((listId: string, shown: number) => void) | undefined;
  row: Extract<TableRowModel, { kind: "more" }>;
}

// 🧩 Component

/**
 * Renders a row with a button to show the next page of a list, which is also pressed for the reader when the row scrolls into view.
 */
export function TableMoreRow(
  properties: Readonly<TableMoreRowProperties>,
): ReactNode {
  const { className, columnCount, onMore, row } = properties;

  // 🪝 Hooks
  const element = useReference<HTMLTableRowElement>(null);

  // 🏗 Setup
  const { groupId, next, remaining, shown, total } = row;

  // 💪 Handlers

  // ♻️ Lifecycle
  // Watching again after each page, as a row still in view fires no more.
  useEffect(() => {
    const target = element.current;

    let observer: IntersectionObserver | undefined;

    if (
      target !== null &&
      onMore !== undefined &&
      typeof IntersectionObserver !== "undefined"
    ) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            onMore(groupId, shown);
          }
        },
        {
          root: target.closest("[data-table-scroll]"),
          rootMargin: LOAD_MARGIN,
        },
      );
      observer.observe(target);
    }

    return () => {
      observer?.disconnect();
    };
  }, [element, groupId, onMore, remaining, shown]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableRow
      ref={element}
      className={className}
      data-testid="table-more-row"
    >
      <TableCell colSpan={columnCount}>
        <Button
          className="h-7 px-1"
          onClick={() => {
            onMore?.(groupId, shown);
          }}
          style={{ marginLeft: getGroupIndent(row.depth) }}
          variant="ghost"
        >
          1 to {shown} of {total}, load {next} more
        </Button>
      </TableCell>
    </TableRow>
  );
}
