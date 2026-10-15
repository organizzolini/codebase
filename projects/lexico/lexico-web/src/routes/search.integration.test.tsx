import { screen } from "@testing-library/react";
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
            lexeme: {
              id,
              lemma: id,
              partOfSpeech: "noun",
              principalParts: [],
              translations: [{ data: `${id} means` }],
            },
            score,
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
});
