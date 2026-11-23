import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FIXTURE_CHARACTERISTICS,
  fixtureMeander,
} from "../../../../testing/meanders-api";

import { GroupedItem } from "./grouped-item";

import type { GroupedItemProperties } from "./grouped-item";

/** The properties a row needs, over a header. */
function properties(
  overrides: Partial<GroupedItemProperties> = {},
): GroupedItemProperties {
  return {
    activeKeys: [],
    catalog: FIXTURE_CHARACTERISTICS,
    columns: 2,
    item: {
      count: 1234,
      depth: 1,
      isContinued: false,
      key: "k",
      kind: "header",
      label: "Lattice: 0",
    },
    repeats: 12,
    ...overrides,
  };
}

describe(GroupedItem, () => {
  it("applies its class name", () => {
    render(
      <GroupedItem
        {...properties()}
        className="grouped-item"
      />,
    );

    expect(screen.getByTestId("grouped-item").className).toBe("grouped-item");
  });

  it("shows a header with its exact count", () => {
    render(<GroupedItem {...properties()} />);

    expect(screen.getByTestId("group-header").textContent).toBe(
      "Lattice: 01,234",
    );
    expect(screen.getByTestId("group-count").textContent).toBe("1,234");
  });

  it("ranks a header's heading by its depth, below the page's own", () => {
    const { rerender } = render(<GroupedItem {...properties()} />);

    expect(screen.getByRole("heading", { level: 3 })).toBeDefined();

    rerender(
      <GroupedItem
        {...properties({
          item: {
            count: 1,
            depth: 9,
            isContinued: false,
            key: "k",
            kind: "header",
            label: "x",
          },
        })}
      />,
    );

    expect(screen.getByRole("heading", { level: 6 })).toBeDefined();
  });

  it("marks a group that began before the pages showing as continued", () => {
    const { rerender } = render(<GroupedItem {...properties()} />);

    expect(screen.queryByText(/continued/u)).toBeNull();

    rerender(
      <GroupedItem
        {...properties({
          item: {
            count: 1234,
            depth: 1,
            isContinued: true,
            key: "k",
            kind: "header",
            label: "Lattice: 0",
          },
        })}
      />,
    );

    expect(screen.getByTestId("group-header").textContent).toBe(
      "Lattice: 0 (continued)1,234",
    );
  });

  it("shows a row of cards in the columns it is given", () => {
    render(
      <GroupedItem
        {...properties({
          item: { key: "k", kind: "cards", meanders: [fixtureMeander(0)] },
        })}
      />,
    );

    expect(screen.getAllByTestId("meander-card")).toHaveLength(1);
    expect(screen.queryByTestId("group-header")).toBeNull();
  });
});
