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

    it("offers the presets at the top of the filter panel", async () => {
      render(
        <CalendarFilters
          fields={[]}
          filter={PRESET.filter}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
          presets={[PRESET]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));

      const picker = await screen.findByRole("combobox", {
        name: "Preset",
      });

      expect(picker.textContent).toContain("Planet-sign events");
    });

    it("applies a preset picked in the filter panel", async () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          fields={[]}
          filter={{ ...PRESET.filter, rules: [] }}
          onFilterChange={onFilterChange}
          presets={[PRESET]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^Filter/u }));
      fireEvent.click(await screen.findByRole("combobox", { name: "Preset" }));
      fireEvent.keyDown(
        await screen.findByRole("option", { name: "Planet-sign events" }),
        {
          key: "Enter",
        },
      );

      expect(onFilterChange).toHaveBeenCalledWith(PRESET.filter);
    });

    it("clears every filter with the Clear button", () => {
      const onFilterChange = vi.fn<(filter: unknown) => void>();

      render(
        <CalendarFilters
          fields={[]}
          filter={PRESET.filter}
          onFilterChange={onFilterChange}
          presets={[PRESET]}
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
          fields={[]}
          filter={{ ...PRESET.filter, rules: [] }}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
          presets={[PRESET]}
        />,
      );

      expect(screen.getByRole("button", { name: "Clear" })).toHaveProperty(
        "disabled",
        true,
      );
    });

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
      expect(screen.getByRole("button", { name: "Clear" })).toHaveProperty(
        "disabled",
        true,
      );
    });
  });
});
