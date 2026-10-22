import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";
import { EMPTY_EVENT_FILTER } from "../lib/event-filters/event-filter-tree";

import { CalendarViewMenu } from "./calendar-view-menu";

const COLLECTION = {
  description: "Every ingress.",
  filter: {
    combinator: "and" as const,
    id: "planet-sign-events-0",
    rules: [
      {
        id: "planet-sign-events-0-0",
        operator: "is_any_of",
        path: ["tag:tag-type"],
        type: "rule" as const,
        value: ["tag-ingress"],
      },
    ],
    type: "group" as const,
  },
  id: "planet-sign-events",
  name: "Planet-sign events",
};

function renderMenu(
  overrides: Partial<Parameters<typeof CalendarViewMenu>[0]> = {},
): {
  onColorsChange: ReturnType<typeof vi.fn<(enabled: boolean) => void>>;
  onSelect: ReturnType<typeof vi.fn<(filter: unknown) => void>>;
} {
  const onColorsChange = vi.fn<(enabled: boolean) => void>();
  const onSelect = vi.fn<(filter: unknown) => void>();

  render(
    <CalendarViewMenu
      collections={[COLLECTION]}
      onColorsChange={onColorsChange}
      onSelect={onSelect}
      query={EMPTY_EVENT_FILTER}
      colors
      {...overrides}
    />,
  );

  return { onColorsChange, onSelect };
}

describe(CalendarViewMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewMenu
        className="calendar-view-menu"
        collections={[COLLECTION]}
        onColorsChange={vi.fn<(enabled: boolean) => void>()}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={EMPTY_EVENT_FILTER}
        colors
      />,
    );

    expect(screen.getByTestId("calendar-view-menu").className).toBe(
      "calendar-view-menu",
    );
  });

  it("reads View, and names what the tree holds", () => {
    renderMenu({ query: COLLECTION.filter });

    expect(
      screen.getByRole("button", { name: "View options, Planet-sign events" }),
    ).toBeDefined();
    expect(screen.getByText("View")).toBeDefined();
  });

  it("reads as custom for a tree no collection holds", () => {
    renderMenu({
      query: {
        ...COLLECTION.filter,
        rules: COLLECTION.filter.rules.map((rule) => ({
          ...rule,
          value: ["tag-other"],
        })),
      },
    });

    expect(
      screen.getByRole("button", { name: "View options, Custom" }),
    ).toBeDefined();
  });

  it("applies a collection picked from the menu", async () => {
    const { onSelect } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: /View options/u }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: /Planet-sign events/u }),
    );

    expect(onSelect).toHaveBeenCalledWith(COLLECTION.filter);
  });

  it("turns colors off from the menu", async () => {
    const { onColorsChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: /View options/u }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", {
        name: "Color events by type",
      }),
    );

    expect(onColorsChange).toHaveBeenCalledWith(false);
  });

  it("shows the colors' state in the checkbox", async () => {
    renderMenu({ colors: false });
    fireEvent.click(screen.getByRole("button", { name: /View options/u }));

    const checkbox = await screen.findByRole("menuitemcheckbox", {
      name: "Color events by type",
    });

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("names the color of every kind of event in the legend", async () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /View options/u }));
    fireEvent.click(await screen.findByText("Color legend"));

    for (const rule of EVENT_COLOR_RULES) {
      await expect(screen.findByText(rule.label)).resolves.toBeDefined();
    }
  });
});
