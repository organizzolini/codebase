/* cspell:words rosae rosarum */

import { fireEvent, screen } from "@testing-library/react";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { graphqlServer } from "../../testing/graphql-server";
import { renderRoute } from "../../testing/render-route";
import {
  mockLexemeFormsQuery,
  mockSearchEnglishQuery,
  mockSearchLatinQuery,
  SearchMatchSource,
} from "../graphql/generated/mocks";

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
          principalParts: [{ text: [id] }],
          pronunciations: [{ phonetic: `[${id}]`, variant: "classical" }],
          translations: [{ data: `${id} means` }],
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
  graphqlServer.use(
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
    await renderRoute("/search");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/search");
    expect(screen.getByTestId("search-landing")).toBeDefined();
  });

  it("says search is unavailable when the API cannot answer", async () => {
    graphqlServer.use(
      mockSearchLatinQuery(() => HttpResponse.error()),
      mockSearchEnglishQuery(() => HttpResponse.error()),
    );

    await renderRoute("/search?query=amo");

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

    await renderRoute("/search?query=amo");

    const cards = await screen.findAllByTestId("lexeme-card");

    expect(cards.map((card) => card.textContent)).toStrictEqual([
      expect.stringContaining("amo"),
      expect.stringContaining("love"),
      expect.stringContaining("amor"),
    ]);
  });

  it("shows what a card knows of its lexeme", async () => {
    stubSearch([["rosa", 2]], []);

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
    stubSearch([["rosa", 2]], []);

    await renderRoute("/search?query=rosa");
    const declension = await screen.findByText("declension");

    graphqlServer.use(
      mockLexemeFormsQuery(() =>
        HttpResponse.json({
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
      ),
    );
    fireEvent.click(declension);

    await expect(screen.findByText("rosarum")).resolves.toBeDefined();
  });
});
