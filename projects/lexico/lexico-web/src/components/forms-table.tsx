import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@codebase/components-web";

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
 * down the side and its numbers across the top.
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="capitalize"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableHead
                className="text-xs font-normal text-muted-foreground capitalize"
                scope="row"
              >
                {row.label}
              </TableHead>
              {columns.map((column) => {
                const words = lookup(row.key, column.key);

                return (
                  <TableCell key={column.key}>
                    {words.length === 0 ? "–" : words.join(", ")}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
