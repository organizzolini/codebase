import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LexemeCard } from "./lexeme-card";

import type { LexemeResult } from "./lexeme-card";
import type { LoadLexemeForms } from "./lexeme-forms";

const result: LexemeResult = {
  etymology: "From Proto-Italic.",
  id: "1",
  identifiers: ["first person singular present active indicative"],
  inflection: { conjugation: "first" },
  lemma: "amo",
  match: { kind: "exact-headword" },
  partOfSpeech: "verb",
  principalParts: ["amō", "amāre"],
  pronunciations: [{ phonetic: "[ˈa.moː]", variant: "classical" }],
  source: "LEMMA_EXACT",
  translations: ["to love", "to like"],
};

const loadForms = vi.fn<LoadLexemeForms>().mockResolvedValue([]);

describe(LexemeCard, () => {
  it("applies its class name", () => {
    render(
      <LexemeCard
        className="lexeme-card"
        loadForms={loadForms}
        result={result}
      />,
    );

    expect(screen.getByTestId("lexeme-card").className).toBe("lexeme-card");
  });

  it("shows each section the entry has data for", () => {
    render(
      <LexemeCard
        loadForms={loadForms}
        result={result}
      />,
    );

    expect(screen.getByText("amō, amāre")).toBeDefined();
    expect(screen.getByText("to love")).toBeDefined();
    expect(screen.getByText("Translations")).toBeDefined();
    expect(screen.getByText("conjugation")).toBeDefined();
    expect(screen.getByText("Pronunciation")).toBeDefined();
    expect(screen.getByText("Etymology")).toBeDefined();
  });

  it("orders its sections principal parts, translations, forms, pronunciation, etymology", () => {
    render(
      <LexemeCard
        loadForms={loadForms}
        result={result}
      />,
    );

    const sections = [
      "lexeme-header",
      "lexeme-translations",
      "lexeme-forms",
      "lexeme-pronunciations",
      "lexeme-etymology",
    ].map((testId) => screen.getByTestId(testId));

    const followsPrevious = sections
      .slice(1)
      .map((section, index) =>
        Boolean(
          (sections[index]?.compareDocumentPosition(section) ?? 0) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      );

    expect(followsPrevious).toStrictEqual([true, true, true, true]);
  });

  it("says how the search matched the lexeme", () => {
    render(
      <LexemeCard
        loadForms={loadForms}
        result={{
          ...result,
          match: { extraLetters: 2, kind: "contains" },
        }}
      />,
    );

    expect(screen.getByLabelText("Fuzzy match")).toBeDefined();
    expect(screen.getByLabelText("Latin match")).toBeDefined();
  });

  it("says which form matched only when the search matched an inflected form", () => {
    const { rerender } = render(
      <LexemeCard
        loadForms={loadForms}
        result={result}
      />,
    );

    expect(screen.queryByTestId("lexeme-identifiers")).toBeNull();

    rerender(
      <LexemeCard
        loadForms={loadForms}
        result={{ ...result, source: "WORD_EXACT" }}
      />,
    );

    expect(screen.getByText("1ST SG PRES ACT IND")).toBeDefined();
  });

  it("leaves out the sections an entry has no data for", () => {
    render(
      <LexemeCard
        loadForms={loadForms}
        result={{ ...result, etymology: null, pronunciations: [] }}
      />,
    );

    expect(screen.queryByTestId("lexeme-etymology")).toBeNull();
    expect(screen.queryByTestId("lexeme-pronunciations")).toBeNull();
  });
});
