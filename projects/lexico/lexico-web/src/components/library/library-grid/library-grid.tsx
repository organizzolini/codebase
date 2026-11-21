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
 * The library's Author cards in a grid, expanded when a search is on.
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
      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {authors.map((row) => (
          <LibraryAuthorCard
            key={`${row.author.id}:${query.search}`}
            query={query}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}
