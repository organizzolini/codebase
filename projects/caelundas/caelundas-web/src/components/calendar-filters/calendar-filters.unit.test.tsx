import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarFilters } from "./calendar-filters";

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

  it("joins Filter and Clear in one button group, square where they meet", () => {
    render(
      <CalendarFilters
        fields={[]}
        filter={undefined}
        onFilterChange={vi.fn<(filter: unknown) => void>()}
      />,
    );

    const group = screen.getByRole("group", { name: "Filter" });
    const filter = screen.getByRole("button", { name: "Filter" });
    const clear = screen.getByRole("button", { name: "Clear" });

    expect(group.dataset["slot"]).toBe("button-group");
    expect(group.contains(filter) && group.contains(clear)).toBe(true);
    expect(filter.className).toContain(
      "in-data-[slot=button-group]:rounded-r-none",
    );
    expect(group.lastElementChild).toBe(clear);
  });

  describe("collections", () => {
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

    it("offers the collections at the top of the filter panel", async () => {
      render(
        <CalendarFilters
          collections={[COLLECTION]}
          fields={[]}
          filter={COLLECTION.filter}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));

      const picker = await screen.findByRole("combobox", {
        name: "Collection",
      });

      expect(picker.textContent).toContain("Planet-sign events");
    });

    it("applies a collection picked in the filter panel", async () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          collections={[COLLECTION]}
          fields={[]}
          filter={{ ...COLLECTION.filter, rules: [] }}
          onFilterChange={onFilterChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));
      fireEvent.click(
        await screen.findByRole("combobox", { name: "Collection" }),
      );
      fireEvent.keyDown(
        await screen.findByRole("option", { name: "Planet-sign events" }),
        {
          key: "Enter",
        },
      );

      expect(onFilterChange).toHaveBeenCalledWith(COLLECTION.filter);
    });

    it("clears every filter with the Clear button", () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          collections={[COLLECTION]}
          fields={[]}
          filter={COLLECTION.filter}
          onFilterChange={onFilterChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Clear" }));

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ rules: [] }),
      );
    });

    it("leaves Clear off while nothing is filtered", () => {
      render(
        <CalendarFilters
          collections={[COLLECTION]}
          fields={[]}
          filter={{ ...COLLECTION.filter, rules: [] }}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
        />,
      );

      expect(screen.getByRole("button", { name: "Clear" })).toHaveProperty(
        "disabled",
        true,
      );
    });

    it("goes back to the default collection when the link's filter is dropped", () => {
      const properties = {
        collections: [COLLECTION],
        fields: [],
        onFilterChange: vi.fn<(filter: unknown) => void>(),
      };
      const { rerender } = render(
        <CalendarFilters
          {...properties}
          filter={COLLECTION.filter}
        />,
      );

      rerender(
        <CalendarFilters
          {...properties}
          filter={undefined}
        />,
      );

      // The collection offered is not the default one, so nothing is left
      // filtered.
      expect(screen.getByRole("button", { name: "Clear" })).toHaveProperty(
        "disabled",
        true,
      );
    });
  });
});
