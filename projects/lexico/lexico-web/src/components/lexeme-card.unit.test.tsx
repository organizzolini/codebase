import { render, screen } from "@testing-library/react";
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

  it("shows the lemma, principal parts, and translations", () => {
    render(<LexemeCard result={result} />);

    expect(screen.getByText("amo")).toBeDefined();
    expect(screen.getByText("verb")).toBeDefined();
    expect(screen.getByText("amō, amāre")).toBeDefined();
    expect(screen.getByText("to love")).toBeDefined();
  });
});
