import { useEffect, useState } from "react";

import { useBreakpoint } from "@codebase/components";

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
  const { is2xl, isLg, isMd } = useBreakpoint();
  const [isMeasured, setIsMeasured] = useState(false);

  // 🏗 Setup
  // One column on a phone, then a column more at the md, lg, and 2xl
  // breakpoints. The fourth waits for 2xl (1536px) so that a 14-inch laptop,
  // which is 1512px wide, gets three columns wide enough for a forms table.
  const columnCount = [true, isMd, isLg, is2xl].filter(Boolean).length;
  const columns = Array.from({ length: columnCount }, (_, column) =>
    results.filter((_result, index) => index % columnCount === column),
  );

  // 💪 Handlers

  // ♻️ Lifecycle
  // The server cannot know the viewport, so it renders a single column and
  // the breakpoints only settle once the page hydrates. Keeping the cards
  // invisible until then stops that stacked layout from flashing on screen.
  // The breakpoint hooks above set their state in earlier effects, so it is
  // already current when this flips.
  useEffect(() => {
    setIsMeasured(true);
  }, []);

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
      <div
        className={`flex items-start gap-4 ${isMeasured ? "" : "invisible"}`}
      >
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
