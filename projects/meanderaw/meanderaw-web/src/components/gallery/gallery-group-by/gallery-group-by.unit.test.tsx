import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { GalleryGroupBy } from "./gallery-group-by";
import { createGroupFields } from "./gallery-group-by.utilities";

import type { GalleryGroupByProperties } from "./gallery-group-by";

/** The properties a builder needs, over the fixture catalog. */
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

  it("says it is not grouped, and adds the first unused field", () => {
    const onGroupingChange =
      vi.fn<GalleryGroupByProperties["onGroupingChange"]>();
    render(<GalleryGroupBy {...properties({ onGroupingChange })} />);

    expect(screen.getByText("Not grouped")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Group cards" }));

    expect(onGroupingChange).toHaveBeenCalledWith(["rowsColumns"]);
  });

  it("changes and removes a level, offering only unused fields", () => {
    const onGroupingChange =
      vi.fn<GalleryGroupByProperties["onGroupingChange"]>();
    render(
      <GalleryGroupBy
        {...properties({
          grouping: ["rowsColumns", "isChain"],
          onGroupingChange,
        })}
      />,
    );

    expect(
      within(screen.getByLabelText("Group 1 by"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toStrictEqual([
      "Rows × columns",
      "Lattice",
      "Hardcoded",
      "Junction count",
    ]);

    fireEvent.change(screen.getByLabelText("Group 1 by"), {
      target: { value: "lattice" },
    });

    expect(onGroupingChange).toHaveBeenLastCalledWith(["lattice", "isChain"]);

    fireEvent.click(screen.getByRole("button", { name: "Remove group 2" }));

    expect(onGroupingChange).toHaveBeenLastCalledWith(["rowsColumns"]);
  });

  it("offers no more levels at the most", () => {
    render(
      <GalleryGroupBy
        {...properties({
          grouping: ["rowsColumns", "lattice", "isHardcoded", "isChain"],
        })}
      />,
    );

    expect(screen.queryByRole("button", { name: /Add/u })).toBeNull();
  });
});
