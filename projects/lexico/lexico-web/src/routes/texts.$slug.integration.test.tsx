// cspell:ignore Troiae Italiam fato profugus Laviniaque venit
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import {
  mockTextReaderQuery,
  mockWordCandidatesQuery,
} from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./texts.$slug";

import type {
  TextReaderQuery,
  WordCandidatesQuery,
} from "../graphql/generated/mocks";

type ReaderLine = ReaderText["lines"]["edges"][number]["node"];
type ReaderPage = ReaderText["lines"];
type ReaderText = NonNullable<TextReaderQuery["text"]>;
type TextLink = null | { slug: string; title: string };

const FONT_SIZE_KEY = "lexico-reader-font-size";
const HINT_KEY = "lexico-reader-hint-seen";

/** An observer the test drives by hand, in place of the browser's. */
class FakeIntersectionObserver {
  public constructor(
    callback: (entries: { isIntersecting: boolean }[]) => void,
  ) {
    FakeIntersectionObserver.notify = callback;
  }

  public static notify: (entries: { isIntersecting: boolean }[]) => void =
    () => {};

  public disconnect(): void {
    // Nothing to release.
  }

  public observe(): void {
    // Entries are sent by the test.
  }
}

const scrollIntoView = vi.fn<(this: Element) => void>();

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

type WordCandidate = WordCandidatesQuery["wordCandidates"][number];

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

const ARMA: WordCandidate = {
  definition: "arms",
  description: "nominative plural",
  lemma: "arma",
  lexemeId: "lexeme-arma",
  partOfSpeech: "noun",
};
const EST_SUM: WordCandidate = {
  definition: "to be",
  description: "third person singular present",
  lemma: "sum",
  lexemeId: "lexeme-sum",
  partOfSpeech: "verb",
};
const EST_EDO: WordCandidate = {
  definition: "to eat",
  description: "third person singular present",
  lemma: "edo",
  lexemeId: "lexeme-edo",
  partOfSpeech: "verb",
};

/** A stored lookup of one word at one token of one line. */
function entry(
  slug: string,
  word: string,
  line: number,
  token: number,
  form = "nominative plural",
): Record<string, unknown> {
  return {
    definition: "arms",
    form,
    line,
    recordedAt: 1,
    slug,
    token,
    word,
  };
}

/** Opens the History panel and returns it. */
async function openHistory(): Promise<HTMLElement> {
  fireEvent.click(screen.getByRole("button", { name: "History" }));

  return screen.findByRole("dialog");
}

/** Answers word-card lookups with the given candidates. */
function stubWordCandidates(candidates: WordCandidate[]): void {
  graphqlMockServer.use(
    mockWordCandidatesQuery(() =>
      HttpResponse.json({ data: { wordCandidates: candidates } }),
    ),
  );
}

describe("texts.$slug", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    Element.prototype.scrollIntoView = scrollIntoView;
    scrollIntoView.mockClear();
    stubReader([{ after: null, page: FIRST_PAGE }]);
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "IntersectionObserver");
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
    expect(scrollIntoView).toHaveBeenCalledWith();
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

  it("replaces the lines when the line anchor changes on the same text", async () => {
    stubReader([
      { after: null, page: FIRST_PAGE },
      { after: "cursor-1", page: SECOND_PAGE },
    ]);
    const router = getRouter();

    await renderRoute(router, "/texts/vergil-aeneid-1");
    await screen.findByText("1.1");

    expect(screen.queryByText("1.4")).toBeNull();

    await act(async () => {
      await router.navigate({
        params: { slug: "vergil-aeneid-1" },
        search: { line: 3 },
        to: "/texts/$slug",
      });
    });

    await expect(screen.findByText("1.4")).resolves.toBeDefined();
  });

  it("loads the next page when the load-more button scrolls into view", async () => {
    globalThis.IntersectionObserver = FakeIntersectionObserver as never;
    stubReader([
      { after: null, page: FIRST_PAGE },
      { after: "cursor-1", page: SECOND_PAGE },
    ]);

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");
    await screen.findByRole("button", { name: "Load more lines" });
    act(() => {
      FakeIntersectionObserver.notify([{ isIntersecting: true }]);
    });

    await expect(screen.findByText("1.3")).resolves.toBeDefined();
  });

  it("scrolls the anchored line itself into view", async () => {
    stubReader([
      { after: null, page: FIRST_PAGE },
      { after: "cursor-1", page: SECOND_PAGE },
    ]);

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1?line=3");
    await screen.findByText("1.4");

    const scrolled = scrollIntoView.mock.contexts[0] as HTMLElement;

    expect(scrolled.id).toBe("line-3");
  });

  it("restores the font size chosen earlier on reload", async () => {
    globalThis.localStorage.setItem(FONT_SIZE_KEY, "large");

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await waitFor(() => {
      expect(screen.getByTestId("reader-lines").className).toContain(
        "text-2xl",
      );
    });
  });

  it("falls back to the default font size when storage is unavailable", async () => {
    const unavailable = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage unavailable");
      });

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await screen.findByText("1.1");

    expect(screen.getByTestId("reader-lines").className).toContain("text-lg");

    unavailable.mockRestore();
  });

  it("does not show the hint to a browser that has seen it", async () => {
    globalThis.localStorage.setItem(HINT_KEY, "true");

    await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

    await screen.findByText("1.1");

    expect(screen.queryByTestId("reader-hint")).toBeNull();
  });

  it("titles the page and describes it with the author and work", async () => {
    const head = await Route.options.head?.({
      loaderData: text(FIRST_PAGE),
    } as never);

    expect(head?.meta).toStrictEqual([
      { title: "Lexico - Vergil: Book 1" },
      {
        content: expect.stringContaining("Book 1 by Vergil") as string,
        name: "description",
      },
    ]);
  });

  it("answers not found for a text the API does not have", async () => {
    stubReader([]);

    await renderRoute(getRouter(), "/texts/no-such-text");

    await expect(screen.findByText("404")).resolves.toBeDefined();
  });

  describe("word card", () => {
    it("opens a card beside a clicked word with its form, definition, and entry link", async () => {
      stubWordCandidates([ARMA]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));

      const card = await screen.findByRole("dialog");

      expect(within(card).getByText("nominative plural")).toBeDefined();
      expect(within(card).getByText("arms")).toBeDefined();
      expect(
        within(card)
          .getByRole("link", { name: "Full entry" })
          .getAttribute("href"),
      ).toBe("/search?query=arma");
    });

    it("lists every candidate for an ambiguous spelling and expands the one chosen", async () => {
      stubReader([
        { after: null, page: page([line(0, "1.1", ["est"])], false, null) },
      ]);
      stubWordCandidates([EST_SUM, EST_EDO]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "est" }));

      const card = await screen.findByRole("dialog");

      expect(within(card).getByRole("button", { name: /^sum/u })).toBeDefined();
      expect(within(card).getByRole("button", { name: /^edo/u })).toBeDefined();
      expect(screen.queryByText("to be")).toBeNull();

      fireEvent.click(within(card).getByRole("button", { name: /^sum/u }));

      await expect(screen.findByText("to be")).resolves.toBeDefined();
    });

    it("says a word is not in the dictionary when it has no candidates", async () => {
      stubWordCandidates([]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));

      await expect(
        screen.findByText(/not in the dictionary/u),
      ).resolves.toBeDefined();
    });

    it("does not make punctuation clickable", async () => {
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      await screen.findByText("1.1");

      expect(screen.queryByRole("button", { name: "," })).toBeNull();
    });

    it("closes on Escape and returns focus to the word", async () => {
      stubWordCandidates([ARMA]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      const word = await screen.findByRole("button", { name: "Arma" });
      fireEvent.click(word);
      await screen.findByRole("dialog");

      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
      });

      expect(document.activeElement).toBe(word);
    });

    it("closes when the reader clicks elsewhere", async () => {
      stubWordCandidates([ARMA]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      await screen.findByRole("dialog");

      fireEvent.pointerDown(document.body, { button: 0, pointerType: "mouse" });
      fireEvent.mouseDown(document.body, { button: 0 });
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
      });
    });
  });

  describe("lookup history", () => {
    const HISTORY_KEY = "lexico-lookup-history";

    beforeEach(() => {
      stubWordCandidates([ARMA]);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("records a looked-up word and lists it newest first, without duplicates", async () => {
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "virumque" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      fireEvent.click(await screen.findByRole("button", { name: "virumque" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();
      const words = within(panel)
        .getAllByRole("listitem")
        .map((item) => item.textContent);

      expect(words[0]?.startsWith("virumque")).toBe(true);
      expect(words[1]?.startsWith("Arma")).toBe(true);
      expect(words).toHaveLength(2);
    });

    it("lists only the words looked up in this text", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([entry("vergil-aeneid-2", "Troiae", 1, 0)]),
      );

      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      const panel = await openHistory();

      expect(within(panel).queryByText("Troiae")).toBeNull();
      expect(within(panel).getByText(/No words looked up/u)).toBeDefined();
    });

    it("keeps the cap, dropping the oldest entry when a new word is looked up", async () => {
      const full = Array.from({ length: 200 }, (_, index) =>
        entry("vergil-aeneid-1", `word${index}`, 0, index),
      );
      globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify(full));

      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();
      const items = within(panel).getAllByRole("listitem");

      expect(items).toHaveLength(200);
      expect(items[0]?.textContent.startsWith("Arma")).toBe(true);
      expect(within(panel).queryByText("word199")).toBeNull();
      expect(within(panel).getByText("word198")).toBeDefined();
    });

    it("keeps history across reloads", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([entry("vergil-aeneid-1", "Arma", 0, 0)]),
      );

      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      const panel = await openHistory();

      expect(within(panel).getByText("nominative plural")).toBeDefined();
    });

    it("records lookups in memory when browser storage is unavailable", async () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota exceeded");
      });
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("storage blocked");
      });
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();

      expect(within(panel).getByText("Arma")).toBeDefined();
    });

    it("records a word the dictionary does not have", async () => {
      stubWordCandidates([]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      await screen.findByText(/not in the dictionary/u);
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();

      expect(within(panel).getByText("Arma")).toBeDefined();
      expect(within(panel).getByText("Not in the dictionary")).toBeDefined();
    });

    it("records a lookup that failed", async () => {
      graphqlMockServer.use(
        mockWordCandidatesQuery(() => HttpResponse.error()),
      );
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "Arma" }));
      await screen.findByText(/Could not look up this word/u);
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();

      expect(within(panel).getByText("Lookup failed")).toBeDefined();
    });

    it("records an ambiguous word as soon as it is looked up, then updates it with the reading chosen", async () => {
      stubReader([
        { after: null, page: page([line(0, "1.1", ["est"])], false, null) },
      ]);
      stubWordCandidates([EST_SUM, EST_EDO]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      fireEvent.click(await screen.findByRole("button", { name: "est" }));
      const card = await screen.findByRole("dialog");
      await within(card).findByRole("button", { name: /^sum/u });

      fireEvent.click(within(card).getByRole("button", { name: /^sum/u }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      const panel = await openHistory();

      expect(within(panel).getAllByRole("listitem")).toHaveLength(1);
      expect(
        within(panel).getByText("third person singular present"),
      ).toBeDefined();
      expect(within(panel).getByText("to be")).toBeDefined();
    });

    it("stops highlighting a hovered entry when the panel closes", async () => {
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");
      fireEvent.click(await screen.findByRole("button", { name: "virumque" }));
      await screen.findByText("arms");
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      const panel = await openHistory();

      fireEvent.mouseEnter(
        within(panel).getByRole("button", { name: /^virumque/u }),
      );
      fireEvent.click(within(panel).getByRole("button", { name: "Close" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
      });

      expect(
        screen.getByRole("button", { name: "virumque" }).dataset["highlighted"],
      ).toBeUndefined();
    });

    it("opens and closes the panel", async () => {
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      const panel = await openHistory();

      expect(
        within(panel).getByRole("heading", { name: "History" }),
      ).toBeDefined();

      fireEvent.click(within(panel).getByRole("button", { name: "Close" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
      });
    });

    it("clears the history", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([entry("vergil-aeneid-1", "Arma", 0, 0)]),
      );
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");

      const panel = await openHistory();
      fireEvent.click(
        within(panel).getByRole("button", { name: "Clear history" }),
      );

      expect(within(panel).getByText(/No words looked up/u)).toBeDefined();
    });

    it("highlights every occurrence of a hovered word and requests a scroll to the clicked one", async () => {
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");
      fireEvent.click(await screen.findByRole("button", { name: "virumque" }));
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      const panel = await openHistory();

      fireEvent.mouseEnter(
        within(panel).getByRole("button", { name: /^virumque/u }),
      );

      const word = screen.getByRole("button", {
        hidden: true,
        name: "virumque",
      });

      expect(word.dataset["highlighted"]).toBe("true");
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      const scrolled = scrollIntoView.mock.contexts[0];

      expect(scrolled?.textContent).toBe("virumque");

      fireEvent.mouseLeave(
        within(panel).getByRole("button", { name: /^virumque/u }),
      );

      expect(word.dataset["highlighted"]).toBeUndefined();
    });

    it("requests no scroll when the clicked occurrence is not loaded yet", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([entry("vergil-aeneid-1", "Italiam", 2, 0)]),
      );
      stubReader([
        { after: null, page: FIRST_PAGE },
        { after: "cursor-1", page: SECOND_PAGE },
      ]);
      await renderRoute(getRouter(), "/texts/vergil-aeneid-1");
      const panel = await openHistory();

      fireEvent.mouseEnter(
        within(panel).getByRole("button", { name: /^Italiam/u }),
      );

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
