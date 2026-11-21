import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FIXTURE_CHARACTERISTICS,
  serveMeandersApi,
} from "../../../../testing/meanders-api";

import { GroupedGallery } from "./grouped-gallery";

import type { GroupedGalleryProperties } from "./grouped-gallery";

/** The properties a gallery needs, over one group of one meander. */
function properties(
  overrides: Partial<GroupedGalleryProperties> = {},
): GroupedGalleryProperties {
  return {
    activeKeys: [],
    catalog: FIXTURE_CHARACTERISTICS,
    fields: [
      {
        category: "shape",
        description: "How many columns the meander has",
        key: "columns",
        label: "Columns",
        type: "number",
      },
    ],
    groups: [{ count: 1, field: "columns", groups: [], value: "1" }],
    query: { filter: undefined, repeats: 12, sort: [] },
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
