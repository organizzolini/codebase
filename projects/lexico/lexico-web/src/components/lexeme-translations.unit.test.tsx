import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeTranslations } from "./lexeme-translations";

describe(LexemeTranslations, () => {
  it("applies its class name", () => {
    render(
      <LexemeTranslations
        className="lexeme-translations"
        translations={["to love"]}
      />,
    );

    expect(screen.getByTestId("lexeme-translations").className).toBe(
      "lexeme-translations",
    );
  });

  it("shows two translations and no toggle when there are no more", () => {
    render(<LexemeTranslations translations={["one", "two"]} />);

    expect(screen.getByText("two")).toBeDefined();
    expect(screen.queryByText(/Show/u)).toBeNull();
  });

  it("folds the rest away until asked", () => {
    render(
      <LexemeTranslations
        translations={["one", "two", "three", "four", "five"]}
      />,
    );

    expect(screen.queryByText("three")).toBeNull();

    fireEvent.click(screen.getByText("Show 3 more"));

    expect(screen.getByText("five")).toBeDefined();
    expect(screen.getByText("Show fewer")).toBeDefined();
  });
});
