import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LexemeTranslations } from "./lexeme-translations";

/**
 * Gives every element a layout, since the test DOM has none: each item is one
 * 20px line, stacked.
 */
function stubLayout(): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function rect(this: HTMLElement) {
      const index = [...(this.parentElement?.children ?? [])].indexOf(this);
      const top = this.tagName === "LI" ? index * 20 : 0;
      const height = this.tagName === "LI" ? 20 : 100;

      return { bottom: top + height, top } as DOMRect;
    },
  );
}

describe(LexemeTranslations, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("starts open, with no hint, when the list fits two lines", () => {
    stubLayout();
    render(<LexemeTranslations translations={["one", "two"]} />);

    expect(screen.getByText("Translations")).toBeDefined();
    expect(screen.getByRole("list").className).not.toContain("max-h-10");
    expect(screen.queryByText(/more/u)).toBeNull();
  });

  it("toggles only open and closed when the list fits two lines", () => {
    stubLayout();
    render(<LexemeTranslations translations={["Amoeba"]} />);
    const divider = screen.getByRole("button", { name: /Translations/u });

    fireEvent.click(divider);

    expect(screen.queryByRole("list")).toBeNull();

    fireEvent.click(divider);

    expect(screen.getByRole("list").className).not.toContain("max-h-10");
    expect(screen.queryByText(/more/u)).toBeNull();
  });

  it("hints how many translations the preview hides", () => {
    stubLayout();
    render(
      <LexemeTranslations
        translations={["one", "two", "three", "four", "five"]}
      />,
    );

    expect(screen.getByText("+3 more")).toBeDefined();
  });

  it("cycles half open, open, closed, and back to half open", () => {
    stubLayout();
    render(
      <LexemeTranslations
        translations={["one", "two", "three", "four", "five"]}
      />,
    );
    const divider = screen.getByRole("button", { name: /Translations/u });

    fireEvent.click(divider);

    expect(screen.getByRole("list").className).not.toContain("max-h-10");
    expect(screen.getByText("five")).toBeDefined();
    expect(screen.queryByText(/more/u)).toBeNull();

    fireEvent.click(divider);

    expect(screen.queryByRole("list")).toBeNull();
    expect(divider.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(divider);

    expect(screen.getByRole("list").className).toContain("max-h-10");
    expect(screen.getByText("+3 more")).toBeDefined();
  });
});
