import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../event-glyphs/calendar-symbols.constants";

import { TagPillLabel } from "./tag-pill-label";
import { TagIconsContext } from "./tag-pill-label.constants";

describe(TagPillLabel, () => {
  it("applies its class name", () => {
    render(
      <TagPillLabel
        className="tag-pill-label"
        id="a"
        label="Aspect"
      />,
    );

    expect(screen.getByTestId("tag-pill-label").className).toBe(
      "tag-pill-label",
    );
  });

  it("leads a tag with no icon and no known symbol with the generic tag icon", () => {
    render(
      <TagPillLabel
        id="a"
        label="Retrograde Period"
      />,
    );

    const label = screen.getByTestId("tag-pill-label");

    expect(label.textContent).toBe("Retrograde Period");
    expect(label.querySelector("[data-testid='tag-icon']")).not.toBeNull();
    expect(label.querySelector("[data-testid='event-glyphs']")).toBeNull();
  });

  it("leads a tag whose icon lucide does not have like one with no icon", () => {
    render(
      <TagIconsContext value={new Map([["a", "not-an-icon"]])}>
        <TagPillLabel
          id="a"
          label="Retrograde Period"
        />
      </TagIconsContext>,
    );

    expect(
      screen
        .getByTestId("tag-pill-label")
        .querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();
  });

  it("leads a moon phase with its emoji when the setting is emojis", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TagPillLabel
          id="a"
          label="Waxing Gibbous"
        />
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("tag-pill-label").textContent).toBe(
      "🌔Waxing Gibbous",
    );
  });

  it("draws the tag's icon beside its name when the facets gave one", () => {
    render(
      <TagIconsContext value={new Map([["r", "orbit"]])}>
        <TagPillLabel
          id="r"
          label="Retrograde Period"
        />
      </TagIconsContext>,
    );

    const label = screen.getByTestId("tag-pill-label");

    expect(label.querySelector("[data-testid='tag-icon']")).not.toBeNull();
    expect(label.textContent).toBe("Retrograde Period");
  });

  it("falls back to the symbol of the name, as an icon when the setting is glyphs", () => {
    render(
      <CalendarSymbolsContext value="glyphs">
        <TagPillLabel
          id="venus"
          label="Venus"
        />
      </CalendarSymbolsContext>,
    );

    expect(
      screen
        .getByTestId("tag-pill-label")
        .querySelector("[data-testid='event-glyphs']"),
    ).not.toBeNull();
  });

  it("falls back to the symbol as text when the setting is emojis", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TagPillLabel
          id="venus"
          label="Venus"
        />
      </CalendarSymbolsContext>,
    );

    expect(screen.queryByTestId("event-glyphs")).toBeNull();
    expect(screen.getByTestId("tag-pill-label").textContent).toBe("♀Venus");
  });

  it("prefers the symbol to the icon", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TagIconsContext value={new Map([["venus", "heart"]])}>
          <TagPillLabel
            id="venus"
            label="Venus"
          />
        </TagIconsContext>
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("tag-pill-label").textContent).toBe("♀Venus");
  });
});
