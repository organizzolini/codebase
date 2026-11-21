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
    ).toStrictEqual([
      "Group",
      "Grouped by Rows",
      "Rows grouping options",
      "Grouped by Chain",
      "Chain grouping options",
    ]);
  });

  it("labels a level by its key when no field is called that", () => {
    render(<GalleryGroupBy {...properties({ grouping: ["mystery"] })} />);

    expect(
      screen.getByRole("button", { name: "Grouped by mystery" }).textContent,
    ).toBe("mystery");
  });

  it("moves and removes a level from its menu, refusing a move past an end", async () => {
    const onGroupingChange =
      vi.fn<GalleryGroupByProperties["onGroupingChange"]>();

    render(
      <GalleryGroupBy
        {...properties({ grouping: ["rows", "isChain"], onGroupingChange })}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Rows grouping options" }),
    );

    const item = await screen.findByRole("menuitem", { name: "Move left" });

    expect(item.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(screen.getByRole("menuitem", { name: "Move right" }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["isChain", "rows"]);

    fireEvent.click(
      screen.getByRole("button", { name: "Chain grouping options" }),
    );

    const last = await screen.findByRole("menuitem", { name: "Move right" });

    expect(last.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(screen.getByRole("menuitem", { name: "Move left" }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["isChain", "rows"]);

    fireEvent.click(
      screen.getByRole("button", { name: "Rows grouping options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["isChain"]);
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
