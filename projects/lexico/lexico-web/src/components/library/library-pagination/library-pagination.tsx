import { Button } from "@codebase/presentation";

import { pageNumbers } from "./library-pagination.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryPagination component.
 */
export interface LibraryPaginationProperties {
  className?: string;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
}

// 🧩 Component

/**
 * Numbered pages of the library, with previous and next.
 */
export function LibraryPagination(
  properties: Readonly<LibraryPaginationProperties>,
): ReactNode {
  const { className, onPageChange, page, pageCount } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const numbers = pageNumbers(page, pageCount);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (pageCount <= 1) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-pagination"
    >
      <div
        aria-label="Library pages"
        className="flex flex-wrap items-center justify-center gap-2"
        role="navigation"
      >
        <Button
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        {numbers.map((entry, index) =>
          entry === "gap" ? (
            <span
              key={`gap-${String(index)}`}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              aria-current={entry === page ? "page" : undefined}
              aria-label={`Page ${String(entry)}`}
              onClick={() => {
                onPageChange(entry);
              }}
              size="sm"
              variant={entry === page ? "default" : "outline"}
            >
              {String(entry)}
            </Button>
          ),
        )}
        <Button
          disabled={page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
          }}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
