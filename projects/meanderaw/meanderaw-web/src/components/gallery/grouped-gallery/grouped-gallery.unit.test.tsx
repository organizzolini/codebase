import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_CHARACTERISTICS,
  fixtureMeander,
} from "../../../../testing/meanders-api";

import { GroupedGallery } from "./grouped-gallery";

import type { GroupedGalleryProperties } from "./grouped-gallery";

/** The properties a gallery needs, over three meanders of columns 1, 2 and 3. */
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
    grouping: ["columns"],
    groups: [
      { count: 1, field: "columns", groups: [], value: "1" },
      { count: 1, field: "columns", groups: [], value: "2" },
      { count: 1, field: "columns", groups: [], value: "3" },
    ],
    isFiltered: false,
    loadError: undefined,
    meanders: [fixtureMeander(0), fixtureMeander(1), fixtureMeander(2)],
    offset: 0,
    onRetry: vi.fn<() => void>(),
    repeats: 12,
    view: "grid",
    ...overrides,
  };
}

describe(GroupedGallery, () => {
  it("applies its class name", () => {
    render(
      <GroupedGallery
        {...properties()}
        className="grouped-gallery"
      />,
    );

    expect(screen.getByTestId("grouped-gallery").className).toBe(
      "grouped-gallery",
    );
  });

  it("shows a header before the cards of each group, with its count", () => {
    render(<GroupedGallery {...properties()} />);

    expect(
      screen
        .getAllByTestId("group-header")
        .map(({ textContent }) => textContent),
    ).toStrictEqual(["Columns: 11", "Columns: 21", "Columns: 31"]);
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);
  });

  it("marks the group the pages showing continue", () => {
    render(
      <GroupedGallery
        {...properties({
          groups: [{ count: 5, field: "columns", groups: [], value: "1" }],
          meanders: [fixtureMeander(0), fixtureMeander(3)],
          offset: 3,
        })}
      />,
    );

    expect(screen.getByTestId("group-header").textContent).toBe(
      "Columns: 1 (continued)5",
    );
  });

  it("says so when there are no meanders", () => {
    render(<GroupedGallery {...properties({ groups: [], meanders: [] })} />);

    expect(screen.getByTestId("gallery-empty")).toBeDefined();
  });

  it("shows why a page failed, with a way to read it again", () => {
    const onRetry = vi.fn<() => void>();

    render(
      <GroupedGallery
        {...properties({ loadError: new Error("boom"), onRetry })}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/boom/u);

    screen.getByRole("button", { name: "Try again" }).click();

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
