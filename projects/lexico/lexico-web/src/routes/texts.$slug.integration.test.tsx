// cspell:ignore Troiae Italiam fato profugus Laviniaque venit
import { fireEvent, screen } from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import { mockTextReaderQuery } from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./texts.$slug";

import type { TextReaderQuery } from "../graphql/generated/mocks";

type ReaderLine = ReaderText["lines"]["edges"][number]["node"];
type ReaderPage = ReaderText["lines"];
type ReaderText = NonNullable<TextReaderQuery["text"]>;
type TextLink = null | { slug: string; title: string };

const FONT_SIZE_KEY = "lexico-reader-font-size";
const HINT_KEY = "lexico-reader-hint-seen";

/** One line whose tokens are the given words; single marks are punctuation. */
function line(index: number, label: string, words: string[]): ReaderLine {
  return {
    id: `line-${index}`,
    index,
    label,
    tokens: {
      edges: words.map((data, tokenIndex) => ({
        node: {
          data,
          id: `${index}-${tokenIndex}`,
          index: tokenIndex,
          isPunctuation: /^[.,;:!?]$/u.test(data),
        },
      })),
    },
  };
}

/** A page of lines with the cursor and flag the API answers with. */
function page(
  lines: ReaderLine[],
  hasNextPage: boolean,
  endCursor: null | string,
): ReaderPage {
  return {
    edges: lines.map((node) => ({ node })),
    pageInfo: { endCursor, hasNextPage },
  };
}

/** Book 1 of the Aeneid, holding the given lines and adjacent links. */
function text(
  lines: ReaderPage,
  links: { next?: TextLink; parent?: TextLink; previous?: TextLink } = {},
): ReaderText {
  const parent = links.parent ?? null;

  return {
    ancestors:
      parent === null ? [] : [{ slug: parent.slug, title: parent.title }],
    author: { name: "Vergil", slug: "vergil" },
    id: "text-1",
    lines,
    nextText: links.next ?? null,
    parentText: parent,
    previousText: links.previous ?? null,
    slug: "vergil-aeneid-1",
    title: "Book 1",
    type: "text",
  };
}

const FIRST_PAGE = page(
  [
    line(0, "1.1", ["Arma", "virumque", "cano", ","]),
    line(1, "1.2", ["Troiae", "qui", "primus", "ab", "oris"]),
  ],
  true,
  "cursor-1",
);
const SECOND_PAGE = page(
  [
    line(2, "1.3", ["Italiam", "fato", "profugus"]),
    line(3, "1.4", ["Laviniaque", "venit"]),
  ],
  false,
  "cursor-2",
);

/**
 * Answers the reader query with the page its cursor selects, or with no text
 * when no page matches.
 */
function stubReader(
  pages: { after: null | string; page: ReaderPage }[],
  links: Parameters<typeof text>[1] = {},
): void {
  graphqlMockServer.use(
    mockTextReaderQuery(({ variables }) => {
      const found = pages.find(
        (candidate) => candidate.after === (variables.after ?? null),
      );
      return HttpResponse.json({
        data: { text: found === undefined ? null : text(found.page, links) },
      });
    }),
  );
}

describe("texts.$slug", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn<() => void>();
    stubReader([{ after: null, page: FIRST_PAGE }]);
  });

  it("renders its page", async () => {
    await renderRoute(getRouter(), "/texts/$slug");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/texts/$slug");
  });

  it("shows the author, parent book, and title of the text", async () => {
    stubReader([{ after: null, page: FIRST_PAGE }], {
      parent: { slug: "vergil-aeneid", title: "Aeneid" },
    });

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await expect(
      screen.findByRole("heading", { level: 1, name: /^Book 1/u }),
    ).resolves.toBeDefined();
    expect(screen.getByText("Vergil")).toBeDefined();
    expect(screen.getByRole("link", { name: "Aeneid" })).toBeDefined();
  });

  it("labels each line and renders its words and punctuation", async () => {
    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await expect(screen.findByText("1.1")).resolves.toBeDefined();
    expect(screen.getByText("1.2")).toBeDefined();
    expect(screen.getAllByTestId("reader-token")).toHaveLength(8);
    expect(screen.getByText(",")).toBeDefined();
  });

  it("loads the next page of lines on request", async () => {
    stubReader([
      { after: null, page: FIRST_PAGE },
      { after: "cursor-1", page: SECOND_PAGE },
    ]);

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    fireEvent.click(
      await screen.findByRole("button", { name: "Load more lines" }),
    );

    await expect(screen.findByText("1.3")).resolves.toBeDefined();
    expect(screen.getByText("1.4")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "Load more lines" }),
    ).toBeNull();
  });

  it("opens the text at a line anchor, loading pages until it is in view", async () => {
    stubReader([
      { after: null, page: FIRST_PAGE },
      { after: "cursor-1", page: SECOND_PAGE },
    ]);

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1?line=3");

    await expect(screen.findByText("1.4")).resolves.toBeDefined();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith();
  });

  it("links to the previous and next texts only where they exist", async () => {
    stubReader([{ after: null, page: FIRST_PAGE }], {
      next: { slug: "vergil-aeneid-2", title: "Book 2" },
    });

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await expect(
      screen.findByRole("link", { name: /Next/u }),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("link", { name: /Previous/u })).toBeNull();
  });

  it("remembers the font size chosen in this browser", async () => {
    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    fireEvent.click(await screen.findByRole("button", { name: "Larger text" }));

    expect(globalThis.localStorage.getItem(FONT_SIZE_KEY)).toBe("large");
  });

  it("shows the word hint once per browser", async () => {
    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    fireEvent.click(await screen.findByRole("button", { name: "Got it" }));

    expect(screen.queryByText(/words are clickable/u)).toBeNull();
    expect(globalThis.localStorage.getItem(HINT_KEY)).toBe("true");
  });

  it("answers not found for a text the API does not have", async () => {
    stubReader([]);

    await renderRoute(getRouter(), "/texts/no-such-text");

    await expect(screen.findByText("404")).resolves.toBeDefined();
  });
});
