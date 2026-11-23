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
    onSortsChange: vi.fn<GallerySortProperties["onSortsChange"]>(),
    sorts: [{ direction: "asc", field: "rows" }],
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

  it("shows each field sorted by as a segment with a menu, in order", () => {
    render(
      <GallerySort
        {...properties({
          sorts: [
            { direction: "asc", field: "rows" },
            { direction: "desc", field: "junctionCount" },
          ],
        })}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Sorted by Rows, ascending" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: "Sorted by Junction count, descending",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Rows sorting options" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Junction count sorting options" }),
    ).toBeDefined();
  });

  it("opens a cascader of the shape fields and the catalog by category, behind a Sort by search, with their descriptions", async () => {
    render(<GallerySort {...properties()} />);
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

  it("adds a field ascending after the ones sorted by when it is ticked", async () => {
    const onSortsChange = vi.fn<GallerySortProperties["onSortsChange"]>();

    render(<GallerySort {...properties({ onSortsChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: /Shape/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Columns/u }));

    expect(onSortsChange).toHaveBeenCalledExactlyOnceWith([
      { direction: "asc", field: "rows" },
      { direction: "asc", field: "columns" },
    ]);
  });

  it("drops a field when it is ticked again", async () => {
    const onSortsChange = vi.fn<GallerySortProperties["onSortsChange"]>();

    render(<GallerySort {...properties({ onSortsChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: /Shape/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Rows/u }));

    expect(onSortsChange).toHaveBeenCalledExactlyOnceWith([]);
  });

  it("never reverses a field when its segment is pressed", () => {
    const onSortsChange = vi.fn<GallerySortProperties["onSortsChange"]>();

    render(<GallerySort {...properties({ onSortsChange })} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Sorted by Rows, ascending" }),
    );

    expect(onSortsChange).not.toHaveBeenCalled();
  });

  it("moves, reverses and removes a field from its menu, refusing a move past an end", async () => {
    const onSortsChange = vi.fn<GallerySortProperties["onSortsChange"]>();
    const sorts = [
      { direction: "asc", field: "rows" },
      { direction: "desc", field: "columns" },
    ] as const;

    render(<GallerySort {...properties({ onSortsChange, sorts })} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Columns sorting options" }),
    );

    const item = await screen.findByRole("menuitem", { name: "Move right" });

    expect(item.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(screen.getByRole("menuitem", { name: "Move left" }));

    expect(onSortsChange).toHaveBeenLastCalledWith([
      { direction: "desc", field: "columns" },
      { direction: "asc", field: "rows" },
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: "Columns sorting options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Reverse" }));

    expect(onSortsChange).toHaveBeenLastCalledWith([
      { direction: "asc", field: "rows" },
      { direction: "asc", field: "columns" },
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: "Columns sorting options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onSortsChange).toHaveBeenLastCalledWith([
      { direction: "asc", field: "rows" },
    ]);
  });
});
