import { useBreakpoint } from "@codebase/components-web";

import { LexemeCard } from "./lexeme-card";

import type { LexemeResult } from "./lexeme-card";
import type { LoadLexemeForms } from "./lexeme-forms";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties SearchResults accepts.
 */
export interface SearchResultsProperties {
  className?: string;
  /** Loads the forms of a lexeme when its table is first opened. */
  loadForms: LoadLexemeForms;
  query: string;
  results: LexemeResult[];
}

// 🧩 Component

/**
 * The lexemes a query matched, in a masonry of cards. The best matches are
 * dealt round-robin across the columns, so the top results sit side by side
 * along the first row rather than stacked down the first column.
 */
export function SearchResults(
  properties: Readonly<SearchResultsProperties>,
): ReactNode {
  const { className, loadForms, query, results } = properties;

  // 🪝 Hooks
  const { isLg, isMd, isXl } = useBreakpoint();

  // 🏗 Setup
  // One column on a phone, then a column more at each of the md, lg, and xl
  // breakpoints.
  const columnCount = [true, isMd, isLg, isXl].filter(Boolean).length;
  const columns = Array.from({ length: columnCount }, (_, column) =>
    results.filter((_result, index) => index % columnCount === column),
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (results.length === 0) {
    return (
      <div
        className={className}
        data-testid="search-results"
      >
        <p className="text-center text-muted-foreground">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="search-results"
    >
      <div className="flex items-start gap-4">
        {columns.map((column) => (
          <div
            key={column.map((result) => result.id).join(",")}
            className="flex min-w-0 flex-1 flex-col gap-4"
          >
            {column.map((result) => (
              <LexemeCard
                key={result.id}
                loadForms={loadForms}
                result={result}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
