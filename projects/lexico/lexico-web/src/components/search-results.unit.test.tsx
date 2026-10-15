import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchResults } from "./search-results";

import type { LexemeResult } from "./lexeme-card";
import type { LoadLexemeForms } from "./lexeme-forms";

/**
 * Builds a result with only the fields the test varies.
 */
function result(id: string): LexemeResult {
  return {
    id,
    identifiers: [],
    lemma: id,
    partOfSpeech: "noun",
    principalParts: [],
    pronunciations: [],
    translations: [],
  };
}

const loadForms = vi.fn<LoadLexemeForms>().mockResolvedValue([]);

/**
 * Stubs a viewport wide enough for four columns.
 */
function stubWideViewport(): void {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: vi.fn<() => void>(),
    matches: true,
    removeEventListener: vi.fn<() => void>(),
  }));
}

describe(SearchResults, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies its class name", () => {
    stubWideViewport();
    render(
      <SearchResults
        className="search-results"
        loadForms={loadForms}
        query="a"
        results={[result("a")]}
      />,
    );

    expect(screen.getByTestId("search-results").className).toBe(
      "search-results",
    );
  });

  it("says so when nothing matched", () => {
    stubWideViewport();
    render(
      <SearchResults
        loadForms={loadForms}
        query="zzz"
        results={[]}
      />,
    );

    expect(screen.getByText(/No results for/u)).toBeDefined();
  });

  it("deals the best results across the columns round-robin", () => {
    stubWideViewport();
    render(
      <SearchResults
        loadForms={loadForms}
        query="a"
        results={["alpha", "beta", "gamma", "delta", "epsilon"].map((id) =>
          result(id),
        )}
      />,
    );

    const grid = screen.getByTestId("search-results");
    const firstRow = [...(grid.firstElementChild?.children ?? [])].map(
      (column) =>
        column.querySelector("[data-testid=lexeme-card]")?.textContent,
    );

    expect(firstRow).toHaveLength(4);

    for (const [index, lemma] of [
      "alpha",
      "beta",
      "gamma",
      "delta",
    ].entries()) {
      expect(firstRow[index]).toContain(lemma);
    }
  });
});
