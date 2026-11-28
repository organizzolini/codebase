import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { fieldRule, filterGroup } from "../../../../testing/event-filters";
import { CalendarNavigationSlot } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-slot.constants";

import { CalendarFilters } from "./calendar-filters";
import { STRIP_CLASS_NAME } from "./calendar-filters.constants";
import { createEventFilterFields } from "./components/event-filter-model/event-filter-fields.utilities";

import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";

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

  describe("folding", () => {
    const FIELDS = createEventFilterFields([
      {
        id: "tag-aspect",
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
    ]);
    const QUERY = filterGroup(
      "and",
      fieldRule("tag:tag-aspect", "is_any_of", ["tag-ingress"]),
      fieldRule("weekday", "is_any_of", [1]),
      fieldRule("date", "between", ["2026-03-01", "2026-03-31"]),
    );

    function renderFolded(isFolded: boolean, hasNavigation = false): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      render(
        <CalendarNavigationSlot
          value={hasNavigation ? <div aria-label="Navigate" /> : null}
        >
          <CalendarFilters
            fields={FIELDS}
            filter={QUERY}
            fold={fold}
            onFilterChange={vi.fn<(filter: unknown) => void>()}
          />
        </CalendarNavigationSlot>,
      );

      return fold;
    }

    it("puts the required date range before the count, with no menu of its own", () => {
      renderFolded(true, true);

      const order = [
        ...document.querySelectorAll<HTMLElement>(
          "[aria-label=Navigate], [data-testid=strip-fold-button]",
        ),
      ].map((element) => element.dataset["testid"] ?? "navigate");

      expect(order).toStrictEqual(["navigate", "strip-fold-button"]);
      expect(screen.queryByTestId("date-facet-menu")).toBeNull();
    });

    it("offers neither Fold nor Remove on a date rule's chip", async () => {
      renderFolded(true);

      fireEvent.click(
        await screen.findByRole("button", { name: /^Date filter options/u }),
      );
      await screen.findByRole("menuitem", { name: "Only" });

      expect(screen.queryByRole("menuitem", { name: "Fold" })).toBeNull();
      expect(screen.queryByRole("menuitem", { name: "Remove" })).toBeNull();
    });

    it("shows the Filter button, a count of the chips it hides, and the date range that stays", () => {
      const fold = renderFolded(true);
      const group = screen.getByRole("group", { name: "Filter" });

      expect(group.querySelectorAll("button")).toHaveLength(1);

      const count = screen.getByRole("button", { name: /2 Facets/u });

      expect(count.title).toBe("Type, Weekday");
      expect(document.querySelectorAll("[data-slot=filter-chip]")).toHaveLength(
        1,
      );

      fireEvent.click(count);

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("draws every chip and no count while unfolded, and folds from a chip's menu", async () => {
      const fold = renderFolded(false);

      expect(screen.queryByTestId("strip-fold-button")).toBeNull();
      expect(document.querySelectorAll("[data-slot=filter-chip]")).toHaveLength(
        3,
      );

      const [chip] = await screen.findAllByRole("button", {
        name: /filter options/u,
      });

      fireEvent.click(chip ?? document.body);
      fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

      expect(fold.onFold).toHaveBeenCalledTimes(1);
    });

    it("offers no Fold without a fold", async () => {
      render(
        <CalendarFilters
          fields={FIELDS}
          filter={QUERY}
          onFilterChange={vi.fn<(filter: unknown) => void>()}
        />,
      );
      const [chip] = await screen.findAllByRole("button", {
        name: /filter options/u,
      });

      fireEvent.click(chip ?? document.body);

      await screen.findByRole("menuitem", { name: "Remove" });

      expect(screen.queryByRole("menuitem", { name: "Fold" })).toBeNull();
    });
  });
});
