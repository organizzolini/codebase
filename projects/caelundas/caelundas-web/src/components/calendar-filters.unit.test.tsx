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

  describe("collections", () => {
    // The seed-like facets the collection is resolved from: one ingress tag.
    const FACETS = [
      {
        id: "tag-type",
        name: "Type",
        values: [
          {
            count: 3,
            depth: 1,
            id: "tag-ingress",
            name: "Ingress",
            path: "Ingress",
          },
        ],
      },
    ];
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
          facets={FACETS}
          fields={[]}
          filter={COLLECTION.filter}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));

      const picker = await screen.findByRole<HTMLSelectElement>("combobox", {
        name: "Collection",
      });

      expect(picker.value).toBe("planet-sign-events");
    });

    it("applies a collection picked in the filter panel", async () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          facets={FACETS}
          fields={[]}
          filter={{ ...COLLECTION.filter, rules: [] }}
          onFilterChange={onFilterChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));
      fireEvent.change(
        await screen.findByRole("combobox", { name: "Collection" }),
        { target: { value: "planet-sign-events" } },
      );

      expect(onFilterChange).toHaveBeenCalledWith(COLLECTION.filter);
    });

    it("clears every filter with the Clear button", () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          facets={FACETS}
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
          facets={FACETS}
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
  });
});
