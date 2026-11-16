import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { GalleryFilters } from "./gallery-filters";

import type { GalleryFiltersProperties } from "./gallery-filters";

const FILTER = {
  combinator: "and" as const,
  rules: [{ field: "isChain", operator: "is" as const, value: true }],
};

/** The properties the filters need, over the fixture catalog. */
function properties(
  overrides: Partial<GalleryFiltersProperties> = {},
): GalleryFiltersProperties {
  return {
    fields: createFilterFields(FIXTURE_CHARACTERISTICS),
    filter: undefined,
    onClear: vi.fn<GalleryFiltersProperties["onClear"]>(),
    onFilterChange: vi.fn<GalleryFiltersProperties["onFilterChange"]>(),
    onRowsChange: vi.fn<GalleryFiltersProperties["onRowsChange"]>(),
    rows: DEFAULT_ROWS_FILTER,
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

  it("opens a popup to add a filter, which adds a rule to the tree and closes", () => {
    const filter = properties();

    render(<GalleryFilters {...filter} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(screen.getByRole("option", { name: /Chain/u }));
    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));

    expect(filter.onFilterChange).toHaveBeenCalledWith({
      combinator: "and",
      rules: [{ field: "isChain", operator: "is", value: true }],
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the rows pill and a pill for each rule, and badges the button with the tree's rules", () => {
    render(<GalleryFilters {...properties({ filter: FILTER })} />);

    expect(screen.getByLabelText("Rows Value")).toBeDefined();
    expect(screen.getByLabelText("Chain Value")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Filter, 1 active" }),
    ).toBeDefined();
  });

  it("removes a pill's rule, handing none on when it was the last", () => {
    const filter = properties({ filter: FILTER });

    render(<GalleryFilters {...filter} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Chain filter" }),
    );

    expect(vi.mocked(filter.onFilterChange).mock.lastCall).toStrictEqual([
      undefined,
    ]);
  });

  it("offers Match all or any once the tree holds two rules, and applies it", () => {
    const one = properties({ filter: FILTER });
    const { rerender } = render(<GalleryFilters {...one} />);

    expect(screen.queryByLabelText("Match")).toBeNull();

    const two = properties({
      filter: {
        combinator: "and",
        rules: [...FILTER.rules, { field: "rows", operator: "eq", value: 2 }],
      },
    });

    rerender(<GalleryFilters {...two} />);
    fireEvent.change(screen.getByLabelText("Match"), {
      target: { value: "or" },
    });

    expect(two.onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ combinator: "or" }),
    );
  });

  it("clears through its handler, which is disabled while the tree is empty and rows is its default", () => {
    const unchanged = properties();
    const { rerender } = render(<GalleryFilters {...unchanged} />);

    expect(
      screen.getByRole("button", { name: "Clear" }).hasAttribute("disabled"),
    ).toBe(true);

    const changed = properties({ rows: { operator: "gt", value: 2 } });

    rerender(<GalleryFilters {...changed} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(changed.onClear).toHaveBeenCalledTimes(1);
  });

  it("stops offering to add once the filter holds as many rules as the API takes", () => {
    render(
      <GalleryFilters
        {...properties({
          filter: {
            combinator: "and",
            rules: Array.from({ length: 126 }, () => ({
              field: "rows",
              operator: "eq" as const,
              value: 1,
            })),
          },
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter, 126 active" }));
    fireEvent.click(screen.getByRole("option", { name: /Chain/u }));

    expect(
      screen
        .getByRole("button", { name: "Add filter" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
