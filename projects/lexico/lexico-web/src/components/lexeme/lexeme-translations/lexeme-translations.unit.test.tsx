import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LexemeTranslations } from "./lexeme-translations";

/**
 * Gives every element a layout, since the test DOM has none: the list is two
 * lines tall and each item one line, stacked.
 */
function stubLayout(): void {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(40);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(20);
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
    function offsetTop(this: HTMLElement) {
      return [...(this.parentElement?.children ?? [])].indexOf(this) * 20;
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

  it("starts half open: clipped to two lines, with the divider's label", () => {
    render(<LexemeTranslations translations={["one", "two"]} />);

    expect(screen.getByText("Translations")).toBeDefined();
    expect(screen.getByRole("list").className).toContain("max-h-10");
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
