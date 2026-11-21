import { useCallback, useEffect, useState } from "react";

import { Button } from "@codebase/presentation";

import { getLibraryChildren } from "./library-text-tree.constants";
import { mergeRows } from "./library-text-tree.utilities";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryTextChildren component.
 */
export interface LibraryTextChildrenProperties {
  /** How many children the API counted, so the tree can say what it has loaded. */
  childCount: number;
  className?: string;
  parentTextId: string;
  /** Draws the loaded children, so this file never imports the tree that renders it. */
  renderLevel: (rows: readonly LibraryTextRow[]) => ReactNode;
  search: string;
}

// 🧩 Component

/**
 * The children of one Text, fetched a page at a time as the Text opens, with
 * a button for the next page when it holds more than one page.
 */
export function LibraryTextChildren(
  properties: Readonly<LibraryTextChildrenProperties>,
): ReactNode {
  const { childCount, className, parentTextId, renderLevel, search } =
    properties;

  // 🪝 Hooks
  const [rows, setRows] = useState<LibraryTextRow[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  // 🏗 Setup
  const hasMore = rows.length < childCount && page > 0;

  // 💪 Handlers
  const handleLoad = useCallback(
    async (nextPage: number): Promise<void> => {
      setIsLoading(true);
      setHasFailed(false);

      try {
        const loaded = await getLibraryChildren({
          data: { page: nextPage, parentTextId, search },
        });
        setRows((current) => mergeRows(current, loaded.texts));
        setPage(nextPage);
      } catch {
        setHasFailed(true);
      } finally {
        setIsLoading(false);
      }
    },
    [parentTextId, search],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    void handleLoad(1);
  }, [handleLoad]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-text-children"
    >
      {renderLevel(rows)}
      {isLoading ? (
        <p
          className="text-muted-foreground"
          role="status"
        >
          Loading
        </p>
      ) : null}
      {hasFailed ? <p role="alert">Could not load. Try again.</p> : null}
      {hasMore && !isLoading ? (
        <Button
          onClick={() => {
            void handleLoad(page + 1);
          }}
          size="sm"
          variant="outline"
        >
          Load more
        </Button>
      ) : null}
      {hasFailed && !isLoading ? (
        <Button
          onClick={() => {
            void handleLoad(page + 1);
          }}
          size="sm"
          variant="outline"
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}
