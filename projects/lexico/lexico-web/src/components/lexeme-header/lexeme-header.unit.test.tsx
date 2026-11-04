/* cspell:words orior */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeHeader } from "./lexeme-header";

import type { LexemeHeaderProperties } from "./lexeme-header";

const noun: LexemeHeaderProperties = {
  inflection: { declension: "first", gender: "feminine" },
  lemma: "rosa",
  partOfSpeech: "noun",
  principalParts: ["rosa", "rosae"],
};

describe(LexemeHeader, () => {
  it("applies its class name", () => {
    render(
      <LexemeHeader
        className="lexeme-header"
        {...noun}
      />,
    );

    expect(screen.getByTestId("lexeme-header").className).toBe("lexeme-header");
  });

  it("shows the principal parts over the part of speech and inflection", () => {
    render(<LexemeHeader {...noun} />);

    expect(screen.getByText("rosa, rosae")).toBeDefined();
    expect(screen.getByText("noun, first declension, feminine")).toBeDefined();
  });

  it("falls back to the lemma when no principal part text was ingested", () => {
    render(
      <LexemeHeader
        {...noun}
        principalParts={[]}
      />,
    );

    expect(screen.getByText("rosa")).toBeDefined();
  });

  it("writes a camel-case part of speech as words", () => {
    render(
      <LexemeHeader
        inflection={null}
        lemma="roma"
        partOfSpeech="properNoun"
        principalParts={[]}
      />,
    );

    expect(screen.getByText("proper noun")).toBeDefined();
  });

  it("adds a verb's notes after its conjugation", () => {
    render(
      <LexemeHeader
        inflection={{ conjugation: "fourth", other: "fourth, deponent" }}
        lemma="orior"
        partOfSpeech="verb"
        principalParts={[]}
      />,
    );

    expect(
      screen.getByText("verb, fourth conjugation, deponent"),
    ).toBeDefined();
  });

  it("names what an adjective, adverb, and preposition inflect by", () => {
    const { rerender } = render(
      <LexemeHeader
        inflection={{ declension: "first/second", degree: "positive" }}
        lemma="bonus"
        partOfSpeech="adjective"
        principalParts={[]}
      />,
    );

    expect(
      screen.getByText("adjective, first/second declension, positive"),
    ).toBeDefined();

    rerender(
      <LexemeHeader
        inflection={{ adverbType: "conjunctional", degree: "positive" }}
        lemma="ut"
        partOfSpeech="adverb"
        principalParts={[]}
      />,
    );

    expect(screen.getByText("adverb, conjunctional, positive")).toBeDefined();

    rerender(
      <LexemeHeader
        inflection={{ case: "accusative" }}
        lemma="ad"
        partOfSpeech="preposition"
        principalParts={[]}
      />,
    );

    expect(screen.getByText("preposition, with accusative")).toBeDefined();
  });
});
