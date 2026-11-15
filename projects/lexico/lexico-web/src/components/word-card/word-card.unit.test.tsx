import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WordCard } from "./word-card";

import type { WordCardToken } from "./word-card.types";

const TOKEN: WordCardToken = {
  data: "Arma",
  id: "token-0",
  index: 0,
  isPunctuation: false,
};

describe(WordCard, () => {
  it("applies its class name", () => {
    render(
      <WordCard
        className="word-card"
        token={TOKEN}
      />,
    );

    expect(screen.getByTestId("word-card").className).toBe("word-card");
  });

  it("shows the word as its button label", () => {
    render(<WordCard token={TOKEN} />);

    expect(screen.getByRole("button", { name: "Arma" })).toBeDefined();
  });
});
