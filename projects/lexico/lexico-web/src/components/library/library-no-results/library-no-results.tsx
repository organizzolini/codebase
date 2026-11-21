import { Button } from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryNoResults component.
 */
export interface LibraryNoResultsProperties {
  className?: string;
  hasFilters: boolean;
  onClearSearch: () => void;
  onResetFilters: () => void;
  search: string;
}

// 🧩 Component

/**
 * What the library shows when nothing matches: what was asked for, and a
 * one-click way to undo the filters or the search.
 */
export function LibraryNoResults(
  properties: Readonly<LibraryNoResultsProperties>,
): ReactNode {
  const { className, hasFilters, onClearSearch, onResetFilters, search } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const isEmpty = search === "" && !hasFilters;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-no-results"
    >
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          {isEmpty
            ? "The library is empty."
            : `No authors match ${search === "" ? "these filters" : search}`}
        </p>
        <div className="flex justify-center gap-2">
          {hasFilters ? (
            <Button
              onClick={onResetFilters}
              variant="outline"
            >
              Reset all filters
            </Button>
          ) : null}
          {search === "" ? null : (
            <Button
              onClick={onClearSearch}
              variant="outline"
            >
              Clear search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
