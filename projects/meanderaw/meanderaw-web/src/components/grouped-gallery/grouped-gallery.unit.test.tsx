import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { serveMeandersApi } from "../../../testing/meanders-api";

import { GroupedGallery } from "./grouped-gallery";

import type { GroupedGalleryProperties } from "./grouped-gallery";

/** The properties a gallery needs, over one group of one meander. */
function properties(
  overrides: Partial<GroupedGalleryProperties> = {},
): GroupedGalleryProperties {
  return {
    fields: [{ key: "lattice", label: "Lattice", type: "text" }],
    filter: undefined,
    groups: [{ count: 1, field: "lattice", groups: [], value: "0" }],
    sort: undefined,
    view: "grid",
    ...overrides,
  };
}

describe(GroupedGallery, () => {
  it("applies its class name", async () => {
    serveMeandersApi(1);
    render(
      <GroupedGallery
        {...properties()}
        className="grouped-gallery"
      />,
    );

    expect(screen.getByTestId("grouped-gallery").className).toBe(
      "grouped-gallery",
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(1);
    });
  });

  it("says so when there are no groups", () => {
    render(<GroupedGallery {...properties({ groups: [] })} />);

    expect(screen.getByTestId("gallery-empty")).toBeDefined();
  });
});
