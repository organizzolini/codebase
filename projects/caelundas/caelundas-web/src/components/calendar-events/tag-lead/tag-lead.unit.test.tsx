import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../event-glyphs/calendar-symbols.constants";
import { TagIconsContext } from "../tag-pill-label/tag-pill-label.constants";

import { TagLead } from "./tag-lead";

describe(TagLead, () => {
  it("applies its class name", () => {
    render(
      <TagLead
        className="tag-lead"
        label="Aspect"
      />,
    );

    expect(screen.getByTestId("tag-lead").className).toBe("tag-lead");
  });

  it("leads a name that has a symbol with it, as an icon under the glyphs setting", () => {
    render(
      <CalendarSymbolsContext value="glyphs">
        <TagLead label="Venus" />
      </CalendarSymbolsContext>,
    );

    const lead = screen.getByTestId("tag-lead");

    expect(lead.querySelector("[data-testid='event-glyphs']")).not.toBeNull();
    expect(lead.querySelector("[data-testid='tag-icon']")).toBeNull();
  });

  it("leads a name that has a symbol with it, as text under the emojis setting", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TagLead label="Venus" />
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("tag-lead").textContent).toBe("♀");
  });

  it("prefers the symbol to the icon the facets or the caller give", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TagIconsContext value={new Map([["venus", "heart"]])}>
          <TagLead
            icon="star"
            id="venus"
            label="Venus"
          />
        </TagIconsContext>
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("tag-lead").textContent).toBe("♀");
  });

  it("falls back to the icon from the facets, then the caller's, then the generic tag icon", () => {
    const { rerender } = render(
      <TagIconsContext value={new Map([["a", "orbit"]])}>
        <TagLead
          icon="star"
          id="a"
          label="Retrograde Period"
        />
      </TagIconsContext>,
    );

    expect(
      screen.getByTestId("tag-lead").querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();

    rerender(
      <TagLead
        icon="star"
        label="Retrograde Period"
      />,
    );

    expect(
      screen.getByTestId("tag-lead").querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();

    rerender(<TagLead label="Retrograde Period" />);

    expect(
      screen.getByTestId("tag-lead").querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();
  });
});
