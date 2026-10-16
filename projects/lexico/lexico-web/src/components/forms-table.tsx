import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@codebase/components";

import { ABBREVIATIONS } from "./lexeme-identifiers";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * One row or column of a forms table: the key its words are looked up by and
 * the label it shows.
 */
export interface FormsTableAxis {
  key: string;
  label: string;
}

/**
 * The properties FormsTable accepts.
 */
export interface FormsTableProperties {
  className?: string;
  columns: FormsTableAxis[];
  /** Finds the words written for the form at a row and a column. */
  lookup: (row: string, column: string) => string[];
  rows: FormsTableAxis[];
}

// 🧩 Component

/**
 * A grid of the words a lexeme's forms are written as, such as a noun's cases
 * down the side and its numbers across the top. It runs the full width of the
 * card it sits in, out through the card's padding. Every cell is the same size and
 * holds its word, and the grid is named in small captions in the cells' corners:
 * each row's first cell carries the row, such as NOM or 1ST, and the first
 * row's cells carry the columns, such as SG and PL. Every cell also carries its
 * full row and column names, hidden, for screen readers.
 */
export function FormsTable(
  properties: Readonly<FormsTableProperties>,
): ReactNode {
  const { className, columns, lookup, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="forms-table"
    >
      <div className="-mx-4 overflow-hidden border-y">
        <Table className="table-fixed">
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row.key}
                className="border-b-0 hover:bg-transparent"
              >
                {columns.map((column, columnIndex) => {
                  const words = lookup(row.key, column.key);

                  return (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "relative h-14 px-2 py-2 text-center whitespace-normal",
                        rowIndex > 0 && "border-t",
                        columnIndex > 0 && "border-l",
                      )}
                    >
                      {columnIndex === 0 && (
                        <span
                          className="pointer-events-none absolute top-1 left-1.5 text-[10px] leading-none text-muted-foreground"
                          aria-hidden
                        >
                          {ABBREVIATIONS[row.key] ?? row.label}
                        </span>
                      )}
                      {rowIndex === 0 && (
                        <span
                          className="pointer-events-none absolute top-1 right-1.5 text-[10px] leading-none text-muted-foreground"
                          aria-hidden
                        >
                          {ABBREVIATIONS[column.key] ?? column.label}
                        </span>
                      )}
                      <span className="sr-only">
                        {row.label} {column.label}:{" "}
                      </span>
                      {words.length === 0 ? (
                        <span className="text-muted-foreground">–</span>
                      ) : (
                        words.map((word) => (
                          <div
                            key={word}
                            className="break-words"
                          >
                            {word}
                          </div>
                        ))
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
