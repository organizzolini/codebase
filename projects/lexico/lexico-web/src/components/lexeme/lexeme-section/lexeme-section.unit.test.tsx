import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LexemeSection } from "./lexeme-section";

describe(LexemeSection, () => {
  it("applies its class name", () => {
    render(
      <LexemeSection
        className="lexeme-section"
        label="Etymology"
        onToggle={vi.fn<() => void>()}
        state="closed"
      />,
    );

    expect(screen.getByTestId("lexeme-section").className).toBe(
      "lexeme-section",
    );
  });

  it("hides its content and reports itself collapsed when closed", () => {
    render(
      <LexemeSection
        label="Etymology"
        onToggle={vi.fn<() => void>()}
        state="closed"
      >
        body
      </LexemeSection>,
    );

    expect(screen.queryByText("body")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Etymology" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("shows its content and reports itself expanded when half open or open", () => {
    const { rerender } = render(
      <LexemeSection
        hint="+2 more"
        label="Translations"
        onToggle={vi.fn<() => void>()}
        state="half"
      >
        body
      </LexemeSection>,
    );

    expect(screen.getByText("body")).toBeDefined();
    expect(screen.getByText("+2 more")).toBeDefined();
    expect(
      screen
        .getByRole("button", { name: /Translations/u })
        .getAttribute("aria-expanded"),
    ).toBe("true");

    rerender(
      <LexemeSection
        label="Translations"
        onToggle={vi.fn<() => void>()}
        state="open"
      >
        body
      </LexemeSection>,
    );

    expect(screen.getByText("body")).toBeDefined();
  });

  it("asks to toggle when its divider is clicked", () => {
    const onToggle = vi.fn<() => void>();

    render(
      <LexemeSection
        label="Etymology"
        onToggle={onToggle}
        state="closed"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Etymology" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
