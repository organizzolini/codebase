import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    catalog: FIXTURE_CHARACTERISTICS,
    columns: 2,
    item: {
      count: 1234,
      depth: 1,
      key: "k",
      kind: "header",
      label: "Lattice: 0",
    },
    onRetry: vi.fn<GroupedItemProperties["onRetry"]>(),
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
          item: { count: 1, depth: 9, key: "k", kind: "header", label: "x" },
        })}
      />,
    );

    expect(screen.getByRole("heading", { level: 6 })).toBeDefined();
  });

  it("shows a row of cards, a stand-in, and a failure to retry", () => {
    const onRetry = vi.fn<GroupedItemProperties["onRetry"]>();
    const leaf = { filter: undefined, id: "k" };
    const { rerender } = render(
      <GroupedItem
        {...properties({
          item: { key: "k", kind: "cards", meanders: [fixtureMeander(0)] },
          onRetry,
        })}
      />,
    );

    expect(screen.getAllByTestId("meander-card")).toHaveLength(1);

    rerender(
      <GroupedItem
        {...properties({ item: { key: "k", kind: "pending", leaf }, onRetry })}
      />,
    );

    expect(screen.getByText("Loading…")).toBeDefined();

    rerender(
      <GroupedItem
        {...properties({
          item: { error: new Error("down"), key: "k", kind: "error", leaf },
          onRetry,
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledWith(leaf);
  });
});
