import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { GallerySort } from "./gallery-sort";

import type { GallerySortProperties } from "./gallery-sort";

const CATALOG = FIXTURE_CHARACTERISTICS;

/** The properties a control needs, over a two-row catalog. */
function properties(
  overrides: Partial<GallerySortProperties> = {},
): GallerySortProperties {
  return {
    characteristics: CATALOG,
    direction: "asc",
    field: undefined,
    onSortChange: vi.fn<GallerySortProperties["onSortChange"]>(),
    ...overrides,
  };
}

describe(GallerySort, () => {
  it("applies its class name", () => {
    render(
      <GallerySort
        {...properties()}
        className="gallery-sort"
      />,
    );

    expect(screen.getByTestId("gallery-sort").className).toBe("gallery-sort");
  });

  it("shows the field sorted by with an arrow, or the default order", () => {
    const { rerender } = render(<GallerySort {...properties()} />);

    expect(screen.getByRole("group", { name: "Sort" }).textContent).toBe(
      "SortDefault order",
    );

    rerender(<GallerySort {...properties({ field: "junctionCount" })} />);

    expect(screen.getByRole("group", { name: "Sort" }).textContent).toBe(
      "SortJunction count",
    );
  });

  it("opens a cascader of the shape fields and the catalog by category, behind a Sort by search, with their descriptions", async () => {
    render(<GallerySort {...properties({ field: "rows" })} />);
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    await expect(
      screen.findByPlaceholderText("Sort by"),
    ).resolves.toBeDefined();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      expect.stringContaining("Shape"),
      expect.stringContaining("Path"),
      expect.stringContaining("Submatrix"),
    ]);

    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));

    expect(
      screen.getByText("Whether the meander comes from the historical corpus"),
    ).toBeDefined();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      expect.stringContaining("Rows"),
      expect.stringContaining("Columns"),
      expect.stringContaining("Lattice"),
      expect.stringContaining("Repeats"),
      expect.stringContaining("Hardcoded"),
      expect.stringContaining("Code"),
    ]);
  });

  it("sorts by the field pressed, keeping the direction", async () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();

    render(
      <GallerySort {...properties({ direction: "desc", onSortChange })} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: /Shape/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Rows/u }));

    expect(onSortChange).toHaveBeenCalledExactlyOnceWith("rows", "desc");
  });

  it("goes back to the default order when the field sorted by is pressed again", async () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();

    render(<GallerySort {...properties({ field: "rows", onSortChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: /Shape/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Rows/u }));

    expect(onSortChange).toHaveBeenCalledExactlyOnceWith(undefined, "asc");
  });

  it("flips the direction with its arrow, which is disabled without a sort", () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();
    const { rerender } = render(
      <GallerySort {...properties({ field: "rows", onSortChange })} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort descending" }));

    expect(onSortChange).toHaveBeenLastCalledWith("rows", "desc");

    rerender(
      <GallerySort
        {...properties({ direction: "desc", field: "rows", onSortChange })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sort ascending" }));

    expect(onSortChange).toHaveBeenLastCalledWith("rows", "asc");

    rerender(<GallerySort {...properties({ onSortChange })} />);

    expect(
      screen
        .getByRole("button", { name: "Sort descending" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
