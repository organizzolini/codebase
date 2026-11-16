/* cspell:words rosae rosarum */

import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import {
  mockSearchEnglishQuery,
  mockSearchLatinQuery,
  mockTextReaderQuery,
  SearchMatchSource,
} from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./search";

import type { SearchLatinQuery } from "../graphql/generated/mocks";

/**
 * Answers one search query with the shape the GraphQL API returns.
 */
function answer(
  found: [string, number][],
): NonNullable<SearchLatinQuery["searchLatin"]> {
  return {
    edges: found.map(([id, score]) => ({
      node: {
        distance: null,
        enclitic: null,
        identifiers: [],
        lexeme: {
          etymology: `${id} comes from somewhere`,
          id,
          inflection: {
            __typename: "NounInflection",
            declension: "first",
            gender: "feminine",
          },
          lemma: id,
          partOfSpeech: "noun",
          principalParts: { edges: [{ node: { text: [id] } }] },
          pronunciations: {
            edges: [{ node: { phonetic: `[${id}]`, variant: "classical" } }],
          },
          translations: { edges: [{ node: { data: `${id} means` } }] },
          wordForms: {
            edges: [
              {
                node: {
                  form: {
                    __typename: "NominalForm",
                    case: "genitive",
                    number: "plural",
                  },
                  id: `${id}-form`,
                  word: `${id}rum`,
                },
              },
            ],
          },
        },
        score,
        source: SearchMatchSource.LemmaExact,
      },
    })),
  };
}

/**
 * Stubs search results with typed GraphQL handlers.
 */
function stubSearch(
  latin: [string, number][],
  english: [string, number][],
): void {
  graphqlMockServer.use(
    mockSearchLatinQuery(() =>
      HttpResponse.json({ data: { searchLatin: answer(latin) } }),
    ),
    mockSearchEnglishQuery(() =>
      HttpResponse.json({ data: { searchEnglish: answer(english) } }),
    ),
  );
}

describe("search", () => {
  it("renders its page", async () => {
    await renderRoute(getRouter(), "/search");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/search");
    expect(screen.getByTestId("search-landing")).toBeDefined();
  });

  it("says search is unavailable when the API cannot answer", async () => {
    graphqlMockServer.use(
      mockSearchLatinQuery(() => HttpResponse.error()),
      mockSearchEnglishQuery(() => HttpResponse.error()),
    );

    await renderRoute(getRouter(), "/search?query=amo");

    await expect(
      screen.findByText("Search is unavailable right now."),
    ).resolves.toBeDefined();
  });

  it("shows Latin and English matches together, best first", async () => {
    stubSearch(
      [
        ["amo", 2],
        ["amor", 1],
      ],
      [
        ["love", 3],
        ["amo", 5],
      ],
    );

    await renderRoute(getRouter(), "/search?query=amo");

    const cards = await screen.findAllByTestId("lexeme-card");

    expect(cards.map((card) => card.textContent)).toStrictEqual([
      expect.stringContaining("amo"),
      expect.stringContaining("love"),
      expect.stringContaining("amor"),
    ]);
  });

  it("shows what a card knows of its lexeme", async () => {
    stubSearch([["rosa", 2]], []);

    await renderRoute(getRouter(), "/search?query=rosa");

    await expect(
      screen.findByText("noun, first declension, feminine"),
    ).resolves.toBeDefined();

    fireEvent.click(screen.getByText("Pronunciation"));

    expect(screen.getByText("[rosa]")).toBeDefined();
    expect(screen.getByText("rosa means")).toBeDefined();
    expect(screen.getByText("Etymology")).toBeDefined();
  });

  it("opens a card's forms without making another API request", async () => {
    stubSearch([["rosa", 2]], []);

    await renderRoute(getRouter(), "/search?query=rosa");
    const declension = await screen.findByText("declension");

    fireEvent.click(declension);

    await expect(screen.findByText("rosarum")).resolves.toBeDefined();
  });

  describe("history", () => {
    const HISTORY_KEY = "lexico-lookup-history";
    const LOOKUP = {
      definition: "arms",
      form: "nominative plural",
      kind: "lookup",
      line: 2,
      recordedAt: 3,
      slug: "vergil-aeneid-1",
      title: "Aeneid, Book 1",
      token: 0,
      word: "Arma",
    };
    const SEARCH = { kind: "search", query: "amo", recordedAt: 2 };

    /** The searches the browser has stored, in order. */
    function storedQueries(): unknown[] {
      const stored = JSON.parse(
        globalThis.localStorage.getItem(HISTORY_KEY) ?? "[]",
      ) as { kind: string; query?: string }[];

      return stored
        .filter((item) => item.kind === "search")
        .map((item) => item.query);
    }

    beforeEach(() => {
      globalThis.localStorage.clear();
      stubSearch([["amo", 2]], []);
    });

    it("records a search and moves a repeat to the top without duplicating it", async () => {
      const router = getRouter();
      await renderRoute(router, "/search?query=amo");
      await screen.findAllByText("amo");

      await act(async () => {
        await router.navigate({ search: { query: "amor" }, to: "/search" });
      });
      await act(async () => {
        await router.navigate({ search: { query: "AMO" }, to: "/search" });
      });

      await waitFor(() => {
        expect(storedQueries()).toStrictEqual(["AMO", "amor"]);
      });
    });

    it("shows what was recently looked up and searched on the search page", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([LOOKUP, SEARCH]),
      );

      await renderRoute(getRouter(), "/search");

      const recent = await screen.findByTestId("recent-history");

      expect(
        within(recent).getByRole("heading", { name: "Recent" }),
      ).toBeDefined();
      expect(within(recent).getByText("Arma")).toBeDefined();
      expect(within(recent).getByText("Aeneid, Book 1")).toBeDefined();
      expect(within(recent).getByText("amo")).toBeDefined();
    });

    it("shows no Recent section while there is no history", async () => {
      await renderRoute(getRouter(), "/search");

      await screen.findByTestId("search-landing");

      expect(screen.queryByTestId("recent-history")).toBeNull();
    });

    it("reruns a recent search when it is clicked", async () => {
      globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([SEARCH]));
      const router = getRouter();
      await renderRoute(router, "/search");

      fireEvent.click(await screen.findByRole("button", { name: /^amo/u }));

      await waitFor(() => {
        expect(router.state.location.search).toMatchObject({ query: "amo" });
      });
    });

    it("opens a recent lookup at its line in its text", async () => {
      graphqlMockServer.use(
        mockTextReaderQuery(() => HttpResponse.json({ data: { text: null } })),
      );
      globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([LOOKUP]));
      const router = getRouter();
      await renderRoute(router, "/search");

      fireEvent.click(await screen.findByRole("button", { name: /^Arma/u }));

      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/texts/vergil-aeneid-1");
      });

      expect(router.state.location.search).toMatchObject({ line: 2 });
    });

    it("clears the history", async () => {
      globalThis.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([LOOKUP, SEARCH]),
      );
      await renderRoute(getRouter(), "/search");

      fireEvent.click(
        await screen.findByRole("button", { name: "Clear history" }),
      );

      await waitFor(() => {
        expect(screen.queryByTestId("recent-history")).toBeNull();
      });

      expect(globalThis.localStorage.getItem(HISTORY_KEY)).toBe("[]");
    });
  });
});
