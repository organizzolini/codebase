import { Button, ButtonGroup, Checkbox } from "@codebase/presentation";

import { PAGE_LIMITS } from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import {
  getPageRange,
  toLoadedPages,
} from "../../calendar-page-strip.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/** The page size, pages loaded, page count, longest list, and handlers. */
export interface PageMenuProperties {
  className?: string;
  count: number;
  limit: number;
  longest: number;
  onLimitChange: (limit: number) => void;
  onPagesChange: (pages: number) => void;
  pages: number;
}

// 🧩 Component

/**
 * Renders what the Page button opens: the page sizes, then a checkbox per page with the events it covers.
 */
export function PageMenu(properties: Readonly<PageMenuProperties>): ReactNode {
  const {
    className,
    count,
    limit,
    longest,
    onLimitChange,
    onPagesChange,
    pages,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="page-menu"
    >
      <ButtonGroup aria-label="Per page">
        {PAGE_LIMITS.map((option) => (
          <Button
            key={option}
            aria-pressed={option === limit}
            onClick={() => {
              onLimitChange(option);
            }}
            size="sm"
            variant={option === limit ? "default" : "outline"}
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
      <ul
        aria-label="Pages"
        className="mt-3 flex max-h-64 flex-col gap-1 overflow-auto"
      >
        {Array.from({ length: count }, (_value, index) => index + 1).map(
          (page) => (
            <li key={page}>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  aria-label={`Page ${String(page)}`}
                  checked={page <= pages}
                  disabled={page === 1}
                  onCheckedChange={(checked) => {
                    onPagesChange(toLoadedPages(page, checked));
                  }}
                />
                <span>Page {page}</span>
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {getPageRange(page, limit, longest)}
                </span>
              </label>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
