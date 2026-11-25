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
    path: null,
    rank: id,
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
  });

  it("is nothing for no groups", () => {
    render(<TotalsGroupList {...createProperties({ groups: [] })} />);

    expect(screen.queryByTestId("totals-group-list")).toBeNull();
  });

  it("nests an open group's subgroups in its card", () => {
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

  it("lists every group, with no more card, sum or rail beside a nested card", () => {
    const groups = Array.from({ length: 9 }, (_, index) =>
      createGroup(`g${String(index)}`, 1, [
        createGroup(`c${String(index)}`, 1),
      ]),
    );

    const { container } = render(
      <TotalsGroupList
        {...createProperties({ expanded: new Set(["g0"]), groups })}
      />,
    );

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(10);
    expect(screen.queryByTestId("totals-more")).toBeNull();
    expect(screen.queryByTestId("totals-sums-to")).toBeNull();
    expect(container.innerHTML).not.toContain("border-l");
  });

  it("lays the cards in one column until their list is wide", () => {
    render(<TotalsGroupList {...createProperties()} />);

    expect(screen.getByRole("list").className).toContain("grid-cols-1");
    expect(screen.getByTestId("totals-group-list").className).toContain(
      "@container",
    );
  });
});
