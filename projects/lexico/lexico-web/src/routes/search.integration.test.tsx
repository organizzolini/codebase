/* cspell:words rosae rosarum */

import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "../../testing/render-route";

import { Route } from "./search";

/**
 * Builds the body the lexico API answers one search query with.
 */
function answer(field: string, found: [string, number][]): Response {
  return Response.json({
    data: {
      [field]: {
        edges: found.map(([id, score]) => ({
          node: {
            enclitic: null,
            identifiers: [],
            lexeme: {
              etymology: `${id} comes from somewhere`,
              id,
              inflection: { declension: "first", gender: "feminine" },
              lemma: id,
              partOfSpeech: "noun",
              principalParts: [{ text: [id] }],
              pronunciations: [{ phonetic: `[${id}]`, variant: "classical" }],
              translations: [{ data: `${id} means` }],
            },
            score,
            source: "LEMMA_EXACT",
          },
        })),
      },
    },
  });
}

/**
 * Stubs `fetch` to answer the Latin search and then the English one, the order
 * the loader asks them in, the way the lexico API does.
 */
function stubApi(latin: [string, number][], english: [string, number][]): void {
  vi.stubGlobal(
    "fetch",
    vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(answer("searchLatin", latin))
      .mockResolvedValueOnce(answer("searchEnglish", english)),
  );
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: vi.fn<() => void>(),
    matches: false,
    removeEventListener: vi.fn<() => void>(),
  }));
}

describe("search", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders its page", async () => {
    await renderRoute("/search");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/search");
    expect(screen.getByTestId("search-landing")).toBeDefined();
  });

  it("says search is unavailable when the API cannot answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("connection refused")),
    );

    await renderRoute("/search?query=amo");

    await expect(
      screen.findByText("Search is unavailable right now."),
    ).resolves.toBeDefined();
  });

  it("shows Latin and English matches together, best first", async () => {
    stubApi(
      [
        ["amo", 2],
        ["amor", 1],
      ],
      [
        ["love", 3],
        ["amo", 5],
      ],
    );

    await renderRoute("/search?query=amo");

    const cards = await screen.findAllByTestId("lexeme-card");

    expect(cards.map((card) => card.textContent)).toStrictEqual([
      expect.stringContaining("amo"),
      expect.stringContaining("love"),
      expect.stringContaining("amor"),
    ]);
  });

  it("shows what a card knows of its lexeme", async () => {
    stubApi([["rosa", 2]], []);

    await renderRoute("/search?query=rosa");

    await expect(
      screen.findByText("noun, first declension, feminine"),
    ).resolves.toBeDefined();

    fireEvent.click(screen.getByText("Pronunciation"));

    expect(screen.getByText("[rosa]")).toBeDefined();
    expect(screen.getByText("rosa means")).toBeDefined();
    expect(screen.getByText("Etymology")).toBeDefined();
  });

  it("loads a card's forms only when its table is opened", async () => {
    stubApi([["rosa", 2]], []);
    const fetchMock = vi.mocked(fetch);

    await renderRoute("/search?query=rosa");
    const declension = await screen.findByText("declension");

    expect(fetchMock).toHaveBeenCalledTimes(2);

    fetchMock.mockResolvedValueOnce(
      Response.json({
        data: {
          lexeme: {
            wordForms: [
              {
                form: {
                  __typename: "NominalForm",
                  case: "genitive",
                  number: "plural",
                },
                id: "1",
                word: "rosarum",
              },
            ],
          },
        },
      }),
    );
    fireEvent.click(declension);

    await expect(screen.findByText("rosarum")).resolves.toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
