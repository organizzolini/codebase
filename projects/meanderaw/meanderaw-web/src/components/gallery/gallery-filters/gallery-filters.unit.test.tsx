import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { createFilterFields } from "./components/filter-model/filter-model.utilities";
import { DEFAULT_FILTER_LINK } from "./components/filter-query/filter-query.constants";
import { GalleryFilters } from "./gallery-filters";

import type { GalleryFiltersProperties } from "./gallery-filters";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The properties the filters need, over the fixture catalog and no filter. */
function properties(
  overrides: Partial<GalleryFiltersProperties> = {},
): GalleryFiltersProperties {
  return {
    fields: FIELDS,
    link: DEFAULT_FILTER_LINK,
    onLinkChange: vi.fn<GalleryFiltersProperties["onLinkChange"]>(),
    ...overrides,
  };
}

describe(GalleryFilters, () => {
  it("applies its class name", () => {
    render(
      <GalleryFilters
        {...properties()}
        className="gallery-filters"
      />,
    );

    expect(screen.getByTestId("gallery-filters").className).toBe(
      "gallery-filters",
    );
  });

  it("joins the Filter button and a chip for each rule in one button group, with no Clear", () => {
    render(<GalleryFilters {...properties()} />);

    const group = screen.getByRole("group", { name: "Filter" });
    const filter = screen.getByRole("button", { name: "Filter" });

    expect(group.dataset["slot"]).toBe("button-group");
    expect(group.firstElementChild).toBe(filter);
    expect(filter.className).toContain(
      "in-data-[slot=button-group]:rounded-r-none",
    );
    expect(
      group.querySelectorAll(":scope > [data-slot='filter-chip']"),
    ).toHaveLength(2);
    expect(group.children).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("always shows rows = 4 and repeats = 12 as chips, which have no way to be removed", () => {
    render(<GalleryFilters {...properties()} />);

    const group = screen.getByRole("group", { name: "Filter" });

    for (const text of ["Rows", "equals", "4", "Repeats", "12"]) {
      expect(group.textContent).toContain(text);
    }
  });

  it("badges Filter with the count of rules, not counting rows or repeats", () => {
    render(
      <GalleryFilters
        {...properties({
          link: {
            ...DEFAULT_FILTER_LINK,
            filter: {
              combinator: "and",
              rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
            },
          },
        })}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Filter, 1 active" }),
    ).toBeDefined();
  });

  it("opens a cascader of the attributes from Filter, in a popover and not a panel", async () => {
    render(<GalleryFilters {...properties()} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    await screen.findByRole("combobox");

    expect(screen.queryByRole("button", { name: "Add filter" })).toBeNull();

    const options = await screen.findAllByRole("option");

    expect(options.length).toBeGreaterThan(0);
  });
});
