import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeCard } from "./lexeme-card";

import type { LexemeResult } from "./lexeme-card";

const result: LexemeResult = {
  id: "1",
  lemma: "amo",
  partOfSpeech: "verb",
  principalParts: ["amō", "amāre"],
  translations: ["to love", "to like"],
};

describe(LexemeCard, () => {
  it("applies its class name", () => {
    render(
      <LexemeCard
        className="lexeme-card"
        result={result}
      />,
    );

    expect(screen.getByTestId("lexeme-card").className).toBe("lexeme-card");
  });

  it("folds long translation lists away until asked", () => {
    const senses = ["one", "two", "three", "four", "five"];
    render(<LexemeCard result={{ ...result, translations: senses }} />);

    expect(screen.queryByText("four")).toBeNull();

    fireEvent.click(screen.getByText("Show 2 more"));

    expect(screen.getByText("five")).toBeDefined();
    expect(screen.getByText("Show fewer")).toBeDefined();
  });

  it("writes a camel-case part of speech as words", () => {
    render(<LexemeCard result={{ ...result, partOfSpeech: "properNoun" }} />);

    expect(screen.getByText("proper noun")).toBeDefined();
  });

  it("shows the lemma, principal parts, and translations", () => {
    render(<LexemeCard result={result} />);

    expect(screen.getByText("amo")).toBeDefined();
    expect(screen.getByText("verb")).toBeDefined();
    expect(screen.getByText("amō, amāre")).toBeDefined();
    expect(screen.getByText("to love")).toBeDefined();
  });
});
