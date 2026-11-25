import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TotalsGroupList } from "./totals-group-list";

import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";
import type { TotalsGroupListProperties } from "./totals-group-list";

function createGroup(
  id: string,
  value: number,
  children?: readonly MetricGroup[],
): MetricGroup {
  return {
    ...(children === undefined ? {} : { children }),
    id,
    key: id,
    label: id.toUpperCase(),
    level: 0,
    orderKey: id,
    path: null,
    values: [
      { metric: "EVENTS", previous: value - 1, value },
      { metric: "UNIQUE_NAMES", previous: null, value },
    ],
  };
}

function createProperties(
  overrides: Partial<TotalsGroupListProperties> = {},
): TotalsGroupListProperties {
  return {
    ancestors: [],
    compare: false,
    expanded: new Set<string>(),
    groupLimit: 5,
    groups: [createGroup("a", 6), createGroup("b", 4)],
    metric: "EVENTS",
    onToggle: vi.fn<(id: string) => void>(),
    whole: 10,
    ...overrides,
  };
}

describe(TotalsGroupList, () => {
  it("lists a card for each group", () => {
    render(<TotalsGroupList {...createProperties()} />);

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(2);
    expect(screen.queryByTestId("totals-more")).toBeNull();
  });

  it("is nothing for no groups", () => {
    render(<TotalsGroupList {...createProperties({ groups: [] })} />);

    expect(screen.queryByTestId("totals-group-list")).toBeNull();
  });

  it("says what the cards sum to for a metric that adds up", () => {
    render(<TotalsGroupList {...createProperties()} />);

    expect(screen.getByTestId("totals-sums-to").textContent).toContain(
      "sums to 10",
    );
  });

  it("says nothing of a sum for a metric that does not add up, or without a whole", () => {
    const { rerender } = render(
      <TotalsGroupList {...createProperties({ metric: "UNIQUE_NAMES" })} />,
    );

    expect(screen.queryByTestId("totals-sums-to")).toBeNull();

    rerender(<TotalsGroupList {...createProperties({ whole: null })} />);

    expect(screen.queryByTestId("totals-sums-to")).toBeNull();
  });

  it("nests an open group's subgroups in its card, under what they sum to", () => {
    const parent = createGroup("a", 6, [createGroup("a1", 4)]);

    render(
      <TotalsGroupList
        {...createProperties({
          expanded: new Set(["a"]),
          groups: [parent],
          whole: 6,
        })}
      />,
    );

    expect(screen.getAllByTestId("totals-group-list")).toHaveLength(2);
    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(2);
    expect(screen.getAllByTestId("totals-sums-to")).toHaveLength(2);
    expect(screen.getByText("A1")).toBeDefined();
  });

  it("opens deeper than one level", () => {
    const deep = createGroup("a", 6, [
      createGroup("a1", 4, [createGroup("a1x", 2)]),
    ]);

    render(
      <TotalsGroupList
        {...createProperties({
          expanded: new Set(["a", "a1"]),
          groups: [deep],
        })}
      />,
    );

    expect(screen.getByText("A1X")).toBeDefined();
    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(3);
  });

  it("keeps a group closed that is not open, and one with no subgroups", () => {
    render(
      <TotalsGroupList
        {...createProperties({
          expanded: new Set(["b"]),
          groups: [
            createGroup("a", 6, [createGroup("a1", 4)]),
            createGroup("b", 4),
          ],
        })}
      />,
    );

    expect(screen.queryByText("A1")).toBeNull();
    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(2);
  });

  it("reports a click on a group that has subgroups", () => {
    const onToggle = vi.fn<(id: string) => void>();

    render(
      <TotalsGroupList
        {...createProperties({
          groups: [createGroup("a", 6, [createGroup("a1", 4)])],
          onToggle,
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /A/ }));

    expect(onToggle).toHaveBeenCalledWith("a");
  });

  it("colors a group by its key", () => {
    render(
      <TotalsGroupList
        {...createProperties({
          groupColors: new Map([["a", "rgb(0, 128, 0)"]]),
        })}
      />,
    );

    expect(screen.getAllByTestId("totals-swatch")[0]?.style.background).toBe(
      "rgb(0, 128, 0)",
    );
  });

  it("lists the groups up to the limit and a more card for the rest, which shows them all", () => {
    render(
      <TotalsGroupList
        {...createProperties({
          groupLimit: 1,
          groups: [
            createGroup("a", 6),
            createGroup("b", 4),
            createGroup("c", 1),
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(1);

    const more = screen.getByRole("button", { name: "+2 more" });

    expect(more.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(more);

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(1);
  });

  it("lays the cards in one column until their list is wide", () => {
    render(<TotalsGroupList {...createProperties()} />);

    expect(screen.getByRole("list").className).toContain("grid-cols-1");
    expect(screen.getByTestId("totals-group-list").className).toContain(
      "@container",
    );
  });
});
