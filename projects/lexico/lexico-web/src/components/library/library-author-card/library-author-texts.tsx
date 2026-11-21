import { useState } from "react";

import { Button } from "@codebase/presentation";

import { LibraryTextTree } from "../library-text-tree/library-text-tree";
import { getLibraryWorks } from "../library-text-tree/library-text-tree.constants";

import type {
  LibraryAuthorRow,
  LibraryRequest,
  LibraryTextRow,
} from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryAuthorTexts component.
 */
export interface LibraryAuthorTextsProperties {
  className?: string;
  id: string;
  query: LibraryRequest;
  row: LibraryAuthorRow;
}

// 🧩 Component

/**
 * The works an expanded Author card lists as a hierarchy, with a button that
 * pages in the author's remaining works when the card holds only the first.
 */
export function LibraryAuthorTexts(
  properties: Readonly<LibraryAuthorTextsProperties>,
): ReactNode {
  const { className, id, query, row } = properties;

  // 🪝 Hooks
  const [more, setMore] = useState<LibraryTextRow[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  // 🏗 Setup
  const works = [...row.works, ...more];
  const isMatched = row.matches.length > 0;

  // 💪 Handlers
  const handleMore = async (): Promise<void> => {
    setIsLoading(true);
    setHasFailed(false);

    try {
      const loaded = await getLibraryWorks({
        data: { ...query, authorId: row.author.id, page: page + 1 },
      });
      setMore((current) => [...current, ...loaded.texts]);
      setPage(page + 1);
    } catch {
      setHasFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-author-texts"
      id={id}
    >
      <LibraryTextTree
        className="-mx-4"
        depth={0}
        isAuthorMatched={isMatched}
        rows={works}
        search={query.search}
      />
      {hasFailed ? (
        <p role="alert">Could not load more works. Try again.</p>
      ) : null}
      {row.workCount > works.length ? (
        <Button
          disabled={isLoading}
          onClick={() => {
            void handleMore();
          }}
          size="sm"
          variant="outline"
        >
          {`Load more works (${String(row.workCount - works.length)} left)`}
        </Button>
      ) : null}
    </div>
  );
}
