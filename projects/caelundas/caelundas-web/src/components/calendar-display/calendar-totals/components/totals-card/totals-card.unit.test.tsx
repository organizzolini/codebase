import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TotalsCard } from "./totals-card";

import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";
import type { TotalsCardProperties } from "./totals-card";

function createGroups(count: number): MetricGroup[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `/0:group-${String(index)}`,
    key: `group-${String(index)}`,
    label: `Group ${String(index)}`,
    level: 0,
    orderKey: null,
    path: null,
    values: [{ metric: "EVENTS", previous: null, value: index + 1 }],
  }));
}

function createProperties(
  overrides: Partial<TotalsCardProperties> = {},
): TotalsCardProperties {
  return {
    compare: false,
    expanded: new Set<string>(),
    groupLimit: 5,
    groups: createGroups(2),
    onToggle: vi.fn<(id: string) => void>(),
    total: { metric: "EVENTS", previous: null, value: 10 },
    ...overrides,
  };
}

describe(TotalsCard, () => {
  it("shows the metric's label, note and total", () => {
    render(<TotalsCard {...createProperties()} />);

    expect(screen.getByRole("heading", { name: "Events" })).toBeDefined();
    expect(screen.getByTestId("totals-value").textContent).toBe("10");
    expect(screen.getByText(/How many distinct events/)).toBeDefined();
    expect(screen.queryByTestId("totals-change")).toBeNull();
    expect(screen.queryByTestId("totals-meter")).toBeNull();
  });

  it("shows the change against the previous period when compared", () => {
    render(
      <TotalsCard
        {...createProperties({
          compare: true,
          total: { metric: "EVENTS", previous: 8, value: 10 },
        })}
      />,
    );

    expect(screen.getAllByTestId("totals-change")[0]?.textContent).toContain(
      "vs 8",
    );
  });

  it("draws a meter for a percent metric", () => {
    render(
      <TotalsCard
        {...createProperties({
          groups: [],
          timeZone: "UTC",
          total: { metric: "COVERED_PERCENT", previous: null, value: 42.5 },
        })}
      />,
    );

    expect(
      screen.getByTestId("totals-meter").getAttribute("aria-valuenow"),
    ).toBe("42.5");
    expect(screen.queryByTestId("totals-group-list")).toBeNull();
  });

  it("nests a card for each of the top five groups and offers the rest in a more card", () => {
    render(<TotalsCard {...createProperties({ groups: createGroups(7) })} />);

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "+2 more" }));

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(7);
  });

  it("offers no more card for five groups or fewer", () => {
    render(<TotalsCard {...createProperties({ groups: createGroups(5) })} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("colors a group by its key", () => {
    render(
      <TotalsCard
        {...createProperties({
          groupColors: new Map([["group-0", "rgb(0, 128, 0)"]]),
        })}
      />,
    );

    expect(screen.getAllByTestId("totals-swatch")[0]?.style.background).toBe(
      "rgb(0, 128, 0)",
    );
  });
});
