import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { GalleryGroupBy } from "./gallery-group-by";
import { createGroupFields } from "./gallery-group-by.utilities";

import type { GalleryGroupByProperties } from "./gallery-group-by";

/** Opens the Group surface. */
async function openGroup(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Group" }));
  await screen.findByRole("dialog", { name: "Group" });
}

/** The properties the control needs, over the fixture catalog. */
function properties(
  overrides: Partial<GalleryGroupByProperties> = {},
): GalleryGroupByProperties {
  return {
    fields: createGroupFields(FIXTURE_CHARACTERISTICS),
    grouping: [],
    onGroupingChange: vi.fn<GalleryGroupByProperties["onGroupingChange"]>(),
    ...overrides,
  };
}

describe(GalleryGroupBy, () => {
  it("applies its class name", () => {
    render(
      <GalleryGroupBy
        {...properties()}
        className="gallery-group-by"
      />,
    );

    expect(screen.getByTestId("gallery-group-by").className).toBe(
      "gallery-group-by",
    );
  });

  it("shows a button for each level beside Group, in order, labelled by its field", () => {
    render(
      <GalleryGroupBy {...properties({ grouping: ["rows", "isChain"] })} />,
    );

    expect(
      screen
        .getAllByRole("button")
        .map(
          (button) => button.getAttribute("aria-label") ?? button.textContent,
        ),
    ).toStrictEqual(["Group", "Grouped by Rows", "Grouped by Chain"]);
  });

  it("labels a level by its key when no field is called that", () => {
    render(<GalleryGroupBy {...properties({ grouping: ["mystery"] })} />);

    expect(
      screen.getByRole("button", { name: "Grouped by mystery" }).textContent,
    ).toBe("mystery");
  });

  it("removes a level with its button", () => {
    const onGroupingChange =
      vi.fn<GalleryGroupByProperties["onGroupingChange"]>();

    render(
      <GalleryGroupBy
        {...properties({ grouping: ["rows", "isChain"], onGroupingChange })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Grouped by Rows" }));

    expect(onGroupingChange).toHaveBeenCalledExactlyOnceWith(["isChain"]);
  });

  it("opens a cascader of the fields, categories first with shape leading, behind a Group by search", async () => {
    render(<GalleryGroupBy {...properties()} />);
    await openGroup();

    expect(screen.getByPlaceholderText("Group by")).toBeDefined();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      expect.stringContaining("Shape"),
      expect.stringContaining("Path"),
      expect.stringContaining("Submatrix"),
    ]);
  });

  it("ticks a field into a level at the end, and clears it out", async () => {
    const onGroupingChange =
      vi.fn<GalleryGroupByProperties["onGroupingChange"]>();
    const { rerender } = render(
      <GalleryGroupBy {...properties({ onGroupingChange })} />,
    );

    await openGroup();
    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));
    fireEvent.click(screen.getByRole("option", { name: /Rows/u }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["rows"]);

    rerender(
      <GalleryGroupBy
        {...properties({ grouping: ["rows"], onGroupingChange })}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /Columns/u }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["rows", "columns"]);

    fireEvent.click(screen.getByRole("option", { name: /Rows/u }));

    expect(onGroupingChange).toHaveBeenLastCalledWith([]);
  });
});
