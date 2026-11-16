import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { setViewportWidth } from "../../../testing/viewport";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { GalleryFilters } from "./gallery-filters";

import type { GalleryFiltersProperties } from "./gallery-filters";

const FILTER = {
  combinator: "and" as const,
  rules: [{ field: "rows", operator: "eq" as const, value: 2 }],
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

  it("opens the builder as a popover on a desktop, a drawer on a tablet and a sheet on a phone", () => {
    const opened = (width: number): string => {
      setViewportWidth(width);

      const { unmount } = render(<GalleryFilters {...properties()} />);

      fireEvent.click(screen.getByRole("button", { name: "Filter" }));

      const dialog = screen.getByRole("dialog");
      const kind =
        ["drawer", "popover", "sheet"].find((candidate) =>
          dialog.matches(`[data-surface="${candidate}"]`),
        ) ?? "none";

      unmount();

      return kind;
    };

    expect(opened(1280)).toBe("popover");
    expect(opened(900)).toBe("drawer");
    expect(opened(375)).toBe("sheet");
  });

  it("badges the button with the rules of the tree in force, and clears them", () => {
    const filter = properties({ filter: FILTER });

    render(<GalleryFilters {...filter} />);

    expect(
      screen.getByRole("button", { name: "Filter, 1 active" }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(filter.onClear).toHaveBeenCalledTimes(1);
  });

  it("has nothing to clear while the tree is empty and rows is its default", () => {
    render(<GalleryFilters {...properties()} />);

    expect(
      screen.getByRole("button", { name: "Clear" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("can clear a rows rule that was changed, whatever the tree holds", () => {
    const filter = properties({ rows: { operator: "gt", value: 2 } });

    render(<GalleryFilters {...filter} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(filter.onClear).toHaveBeenCalledTimes(1);
  });
});
