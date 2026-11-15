import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { FontSizeControl } from "../components/font-size-control/font-size-control";
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE_CLASSES,
} from "../components/font-size-control/font-size-control.constants";
import {
  readFontSize,
  writeFontSize,
} from "../components/font-size-control/font-size-control.utilities";
import { ReaderHeader } from "../components/reader-header/reader-header";
import { ReaderHint } from "../components/reader-hint/reader-hint";
import { ReaderHistory } from "../components/reader-history/reader-history";
import { ReaderLines } from "../components/reader-lines/reader-lines";
import { readerSearchSchema } from "../components/reader-lines/reader-lines-api.constants";
import { getText } from "../components/reader-lines/reader-lines.constants";
import { failNotFound } from "../components/reader-lines/reader-lines.utilities";
import { ReaderNavigation } from "../components/reader-navigation/reader-navigation";
import { useLookupHistory } from "../hooks/use-lookup-history/use-lookup-history";
import { isLookupEntry } from "../hooks/use-lookup-history/use-lookup-history.utilities";

import type { FontSize } from "../components/font-size-control/font-size-control.types";
import type {
  ReaderFocus,
  ReaderSearch,
  ReaderText,
} from "../components/reader-lines/reader-lines.types";
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
  const { clear, entries, record } = useLookupHistory();
  const navigate = useNavigate();

  // 🏗 Setup

  // 💪 Handlers
  const handleFontSize = useCallback((size: FontSize): void => {
    setFontSize(size);
    writeFontSize(size);
  }, []);

  const handleLookup = useCallback(
    (lookup: WordLookup): void => {
      record({ ...lookup, slug: text.slug, title: text.title });
    },
    [record, text.slug, text.title],
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
    <div className="space-y-4">
      <ReaderHeader
        author={text.author.name}
        parent={text.parentText}
      />
      <div className="flex items-center justify-between gap-2">
        <FontSizeControl
          className="flex gap-2"
          onChange={handleFontSize}
          size={fontSize}
        />
        <ReaderHistory
          currentSlug={text.slug}
          entries={entries}
          onClear={clear}
          onFocusEntry={handleFocusEntry}
          onOpenEntry={handleOpenEntry}
        />
      </div>
      <ReaderHint className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm" />
      <ReaderLines
        anchor={line}
        className={`space-y-2 font-serif ${FONT_SIZE_CLASSES[fontSize]}`}
        focus={focus}
        initial={text.lines}
        onLookup={handleLookup}
        slug={text.slug}
      />
      <ReaderNavigation
        className="flex justify-between gap-4"
        next={text.nextText}
        previous={text.previousText}
      />
    </div>
  );
}

/**
 * The reader page, which starts over whenever the route opens another text.
 */
function TextsSlugPage(): ReactNode {
  const text = Route.useLoaderData();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">
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
