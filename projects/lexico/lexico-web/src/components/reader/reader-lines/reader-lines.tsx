import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import { Button } from "@codebase/presentation";

import { ReaderLine } from "../reader-line/reader-line";

import { getText } from "./reader-lines.constants";
import { mergeLines } from "./reader-lines.utilities";

import type { WordLookup } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { LineConnection, ReaderFocus } from "./reader-lines.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderLines accepts.
 */
export interface ReaderLinesProperties {
  anchor?: number | undefined;
  className?: string;
  focus?: null | ReaderFocus | undefined;
  initial: LineConnection;
  isHistoryOpen?: boolean | undefined;
  onLookup?: ((lookup: WordLookup) => void) | undefined;
  slug: string;
}

// 🧩 Component

/**
 * The lines of one text, loading the next page when the reader reaches the
 * end of those shown, and scrolling to the anchored line when there is one.
 */
export function ReaderLines(
  properties: Readonly<ReaderLinesProperties>,
): ReactNode {
  const {
    anchor,
    className,
    focus = null,
    initial,
    isHistoryOpen = false,
    onLookup,
    slug,
  } = properties;

  // 🪝 Hooks
  const [lines, setLines] = useState<LineConnection>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const more = useReference<HTMLButtonElement>(null);

  // 🏗 Setup
  const { endCursor, hasNextPage } = lines.pageInfo;

  // 💪 Handlers
  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (isLoading || !hasNextPage) {
      return;
    }

    setIsLoading(true);
    setHasFailed(false);

    try {
      const next = await getText({
        data: { after: endCursor ?? undefined, slug },
      });

      if (next !== null) {
        setLines((loaded) => mergeLines(loaded, next.lines));
      }
    } catch {
      setHasFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [endCursor, hasNextPage, isLoading, slug]);

  // ♻️ Lifecycle
  useEffect(() => {
    if (anchor !== undefined) {
      document.querySelector(`#line-${anchor}`)?.scrollIntoView();
    }
  }, [anchor]);
  useEffect(() => {
    const target = more.current;
    const observer =
      "IntersectionObserver" in globalThis
        ? new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting === true) {
              void handleLoadMore();
            }
          })
        : undefined;

    if (target !== null) {
      observer?.observe(target);
    }

    return (): void => {
      observer?.disconnect();
    };
  }, [handleLoadMore, hasNextPage, more]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-lines"
    >
      {lines.edges.map((edge) => (
        <ReaderLine
          key={edge.node.id}
          focus={focus}
          isHistoryOpen={isHistoryOpen}
          line={edge.node}
          onLookup={onLookup}
        />
      ))}
      {hasNextPage ? (
        <Button
          ref={more}
          disabled={isLoading}
          onClick={() => {
            void handleLoadMore();
          }}
          variant="outline"
        >
          Load more lines
        </Button>
      ) : null}
      {hasFailed ? (
        <p role="alert">Could not load more lines. Try again.</p>
      ) : null}
    </div>
  );
}
