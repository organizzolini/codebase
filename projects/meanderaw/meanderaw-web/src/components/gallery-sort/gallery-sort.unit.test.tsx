import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GallerySort } from "./gallery-sort";

import type { GallerySortProperties } from "./gallery-sort";

const CATALOG = [
  { isPattern: true, key: "isChain", name: "Chain", valueType: "boolean" },
  {
    isPattern: false,
    key: "junctionCount",
    name: "Junction count",
    valueType: "number",
  },
];

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

  it("offers the default order, the shape fields and the catalog", () => {
    render(<GallerySort {...properties()} />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      "Default order",
      "Rows",
      "Columns",
      "Lattice",
      "Repeats",
      "Hardcoded",
      "Code",
      "Chain",
      "Junction count",
    ]);
  });

  it("changes the field, keeping the direction", () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();
    render(
      <GallerySort {...properties({ direction: "desc", onSortChange })} />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "rows" },
    });

    expect(onSortChange).toHaveBeenCalledWith("rows", "desc");
  });

  it("goes back to the default order when that is picked", () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();
    render(<GallerySort {...properties({ field: "rows", onSortChange })} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });

    expect(onSortChange).toHaveBeenCalledWith(undefined, "asc");
  });

  it("flips the direction of a sort, and has none to flip without one", () => {
    const onSortChange = vi.fn<GallerySortProperties["onSortChange"]>();
    const { rerender } = render(
      <GallerySort {...properties({ field: "rows", onSortChange })} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ascending" }));

    expect(onSortChange).toHaveBeenCalledWith("rows", "desc");

    rerender(
      <GallerySort
        {...properties({ direction: "desc", field: "rows", onSortChange })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Descending" }));

    expect(onSortChange).toHaveBeenLastCalledWith("rows", "asc");

    rerender(<GallerySort {...properties({ onSortChange })} />);

    expect(
      screen
        .getByRole("button", { name: "Ascending" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
