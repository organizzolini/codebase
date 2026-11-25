import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarFilters } from "./calendar-filters";
import { STRIP_CLASS_NAME } from "./calendar-filters.constants";

describe(CalendarFilters, () => {
  it("applies its class name", () => {
    render(
      <CalendarFilters
        className="calendar-filters"
        fields={[]}
        filter={undefined}
        onFilterChange={vi.fn<(filter: unknown) => void>()}
      />,
    );

    expect(screen.getByTestId("calendar-filters").className).toBe(
      "calendar-filters",
    );
  });

  it("has no Clear button and shows no count on Filter", () => {
    render(
      <CalendarFilters
        fields={[]}
        filter={undefined}
        onFilterChange={vi.fn<(filter: unknown) => void>()}
      />,
    );

    const group = screen.getByRole("group", { name: "Filter" });
    const filter = screen.getByRole("button", { name: "Filter" });

    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    expect(group.contains(filter)).toBe(true);
    expect(filter.textContent).toBe("Filter");
    expect(filter.className).not.toContain("rounded-r-none");
  });

  it("keeps Filter in a head that closes its own line", () => {
    render(
      <CalendarFilters
        fields={[]}
        filter={undefined}
        onFilterChange={vi.fn<(filter: unknown) => void>()}
      />,
    );

    const head = screen
      .getByRole("group", { name: "Filter" })
      .closest<HTMLElement>("[data-strip-item]");

    expect(head).not.toBeNull();
    expect(head?.dataset["lineEnd"]).toBe("");
  });

  it("squares every joint, so no corner rounds at a line break", () => {
    expect(STRIP_CLASS_NAME).not.toContain("data-line-end");
    expect(STRIP_CLASS_NAME).not.toContain(
      "[data-line-start]>:first-child]:rounded",
    );
    expect(STRIP_CLASS_NAME).toContain(
      "[&_[data-slot=filter-chip][data-line-start]>:first-child]:border-l!",
    );
    expect(STRIP_CLASS_NAME).toContain(
      "[&_[data-slot=filter-chip]:not(:last-child)>[data-slot]:last-child]:rounded-r-none!",
    );
  });

  describe("presets", () => {
    const PRESET = {
      description: "Every ingress.",
      filter: {
        combinator: "and" as const,
        id: "planet-sign-events-0",
        rules: [
          {
            id: "planet-sign-events-0-0",
            operator: "is_any_of",
            path: ["tag:tag-aspect"],
            type: "rule" as const,
            value: ["tag-ingress"],
          },
        ],
        type: "group" as const,
      },
      id: "planet-sign-events",
      name: "Planet-sign events",
    };

    it("goes back to the default preset when the link's filter is dropped", () => {
      const properties = {
        fields: [],
        onFilterChange: vi.fn<(filter: unknown) => void>(),
        presets: [PRESET],
      };
      const { rerender } = render(
        <CalendarFilters
          {...properties}
          filter={PRESET.filter}
        />,
      );

      rerender(
        <CalendarFilters
          {...properties}
          filter={undefined}
        />,
      );

      // The preset offered is not the default one, so nothing is left
      // filtered.
      expect(screen.getByRole("button", { name: "Filter" }).textContent).toBe(
        "Filter",
      );
    });
  });
});
