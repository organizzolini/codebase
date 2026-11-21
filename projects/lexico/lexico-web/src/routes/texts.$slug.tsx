import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HistoryIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import { Button, useSidebar } from "@codebase/presentation";

import { FontSizeControl } from "../components/reader/font-size-control/font-size-control";
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE_CLASSES,
} from "../components/reader/font-size-control/font-size-control.constants";
import {
  readFontSize,
  writeFontSize,
} from "../components/reader/font-size-control/font-size-control.utilities";
import { ReaderHeader } from "../components/reader/reader-header/reader-header";
import { ReaderHint } from "../components/reader/reader-hint/reader-hint";
import { ReaderHistory } from "../components/reader/reader-history/reader-history";
import { ReaderLines } from "../components/reader/reader-lines/reader-lines";
import { readerSearchSchema } from "../components/reader/reader-lines/reader-lines-api.constants";
import { getText } from "../components/reader/reader-lines/reader-lines.constants";
import {
  describeOrigin,
  failNotFound,
} from "../components/reader/reader-lines/reader-lines.utilities";
import { ReaderNavigation } from "../components/reader/reader-navigation/reader-navigation";
import { useLookupHistory } from "../hooks/use-lookup-history/use-lookup-history";
import { isLookupEntry } from "../hooks/use-lookup-history/use-lookup-history.utilities";

import type { FontSize } from "../components/reader/font-size-control/font-size-control.types";
import type {
  ReaderFocus,
  ReaderSearch,
  ReaderText,
} from "../components/reader/reader-lines/reader-lines.types";
import type {
  HistoryEntry,
  WordLookup,
} from "../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🧭 Route

/** Reads one text line by line, from the line a URL names. */
export const Route = createFileRoute("/texts/$slug")({
  component: TextsSlugPage,
  head: ({ loaderData }) => {
    const work =
      loaderData === undefined
        ? "a Latin text"
        : `${loaderData.title} by ${loaderData.author.name}`;

    return {
      meta: [
        {
          title:
            loaderData === undefined
              ? "Lexico - Reader"
              : `Lexico - ${loaderData.author.name}: ${loaderData.title}`,
        },
        {
          content: `Read ${work} in Latin, line by line, with every word a click away from its dictionary entry`,
          name: "description",
        },
      ],
    };
  },
  loader: async ({
    deps,
    params: parameters,
  }: {
    deps: ReaderSearch;
    params: { slug: string };
  }) =>
    (await getText({ data: { line: deps.line, slug: parameters.slug } })) ??
    failNotFound(),
  loaderDeps: ({ search }: { search: ReaderSearch }) => ({ line: search.line }),
  validateSearch: readerSearchSchema,
});

// 🧩 Component

/**
 * One text laid out for reading: header, controls, lines, and adjacent texts.
 */
function Reader(properties: Readonly<{ text: ReaderText }>): ReactNode {
  const { text } = properties;

  // 🪝 Hooks
  const { line } = Route.useSearch();
  const [fontSize, setFontSize] = useState<FontSize>(DEFAULT_FONT_SIZE);
  const [focus, setFocus] = useState<null | ReaderFocus>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { clear, entries, record } = useLookupHistory();
  const navigate = useNavigate();

  // 🏗 Setup

  // 💪 Handlers
  const handleFontSize = useCallback((size: FontSize): void => {
    setFontSize(size);
    writeFontSize(size);
  }, []);

  const handleCloseHistory = useCallback((): void => {
    setIsHistoryOpen(false);
    setFocus(null);
  }, []);

  const handleToggleHistory = useCallback((): void => {
    setIsHistoryOpen((isOpen) => !isOpen);
    setFocus(null);
  }, []);

  const handleLookup = useCallback(
    (lookup: WordLookup): void => {
      record({ ...lookup, slug: text.slug, title: describeOrigin(text) });
    },
    [record, text],
  );

  const handleFocusEntry = useCallback(
    (entry: HistoryEntry | null): void => {
      setFocus(
        entry !== null && isLookupEntry(entry) && entry.slug === text.slug
          ? { line: entry.line, token: entry.token, word: entry.word }
          : null,
      );
    },
    [text.slug],
  );

  const handleOpenEntry = useCallback(
    (entry: HistoryEntry): void => {
      if (!isLookupEntry(entry)) {
        void navigate({ search: { query: entry.query }, to: "/search" });
      } else if (entry.slug === text.slug) {
        document.querySelector(`#line-${entry.line}`)?.scrollIntoView();
      } else {
        void navigate({
          params: { slug: entry.slug },
          search: { line: entry.line },
          to: "/texts/$slug",
        });
      }
    },
    [navigate, text.slug],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    setFontSize(readFontSize() ?? DEFAULT_FONT_SIZE);
  }, []);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div className="flex items-start">
      <div className="mx-auto min-w-0 max-w-4xl flex-1 space-y-4">
        <ReaderHeader text={text} />
        <div className="flex items-center justify-between gap-2">
          <FontSizeControl
            className="flex gap-2"
            onChange={handleFontSize}
            size={fontSize}
          />
          <Button
            aria-expanded={isHistoryOpen}
            onClick={handleToggleHistory}
            variant="outline"
          >
            <HistoryIcon aria-hidden="true" />
            History
          </Button>
        </div>
        <ReaderHint />
        <ReaderLines
          key={`${text.slug}:${String(line)}`}
          anchor={line}
          className={`font-serif ${FONT_SIZE_CLASSES[fontSize]}`}
          focus={focus}
          initial={text.lines}
          onLookup={handleLookup}
          slug={text.slug}
        />
        <ReaderNavigation
          next={text.nextText}
          previous={text.previousText}
        />
      </div>
      <ReaderHistory
        className="sticky top-4 h-[calc(100svh-2rem)] shrink-0"
        currentSlug={text.slug}
        entries={entries}
        isOpen={isHistoryOpen}
        onClear={clear}
        onClose={handleCloseHistory}
        onFocusEntry={handleFocusEntry}
        onOpenEntry={handleOpenEntry}
      />
    </div>
  );
}

/**
 * The reader page on a neutral surface, which collapses the application
 * sidebar while it is open and starts over whenever the route opens another text.
 */
function TextsSlugPage(): ReactNode {
  const text = Route.useLoaderData();

  // 🪝 Hooks
  const { open, setOpen } = useSidebar();
  const sidebar = useReference({ open, setOpen });

  // ♻️ Lifecycle
  useEffect(() => {
    sidebar.current = { open, setOpen };
  });
  // The page reads best without the navigation beside it, so it folds the
  // sidebar away on arrival and puts it back as the reader leaves.
  useEffect(() => {
    const wasOpen = sidebar.current.open;

    sidebar.current.setOpen(false);

    return (): void => {
      sidebar.current.setOpen(wasOpen);
    };
  }, [sidebar]);

  // 🎨 Markup
  return (
    // The reader page stays on the dark theme's near-black canvas in light
    // mode too, a requested exception for reading, so it re-scopes the theme.
    <section className="dark -m-4 min-h-svh space-y-4 bg-background p-4 text-foreground md:-ml-2 md:pl-2">
      <h1 className="text-center text-3xl font-bold">
        {text.title}
        <span className="sr-only"> by {text.author.name}</span>
      </h1>
      <Reader
        key={text.slug}
        text={text}
      />
    </section>
  );
}
