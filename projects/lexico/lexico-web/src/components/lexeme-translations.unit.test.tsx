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

  it("shows two translations under a heading, with nothing to open when there are no more", () => {
    render(<LexemeTranslations translations={["one", "two"]} />);

    expect(screen.getByText("Translations")).toBeDefined();
    expect(screen.getByText("two")).toBeDefined();
    expect(screen.queryByText(/more/u)).toBeNull();
  });

  it("shows two translations while folded and the rest once opened", () => {
    render(
      <LexemeTranslations
        translations={["one", "two", "three", "four", "five"]}
      />,
    );

    expect(screen.getByText("two")).toBeDefined();
    expect(screen.queryByText("three")).toBeNull();
    expect(screen.getByText("+3 more")).toBeDefined();

    fireEvent.click(screen.getByText("Translations"));

    expect(screen.getByText("five")).toBeDefined();
    expect(screen.queryByText("+3 more")).toBeNull();
  });
});
