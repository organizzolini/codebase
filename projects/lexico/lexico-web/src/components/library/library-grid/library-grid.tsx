import { LibraryAuthorCard } from "../library-author-card/library-author-card";

import type { LibraryAuthorRow, LibraryRequest } from "./library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryGrid component.
 */
export interface LibraryGridProperties {
  authors: LibraryAuthorRow[];
  className?: string;
  query: LibraryRequest;
}

// 🧩 Component

/**
 * The library's Author cards in a masonry grid, expanded when a search is on.
 */
export function LibraryGrid(
  properties: Readonly<LibraryGridProperties>,
): ReactNode {
  const { authors, className, query } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-grid"
    >
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {authors.map((row) => (
          <LibraryAuthorCard
            key={`${row.author.id}:${query.search}`}
            className="mb-4 break-inside-avoid"
            query={query}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}
