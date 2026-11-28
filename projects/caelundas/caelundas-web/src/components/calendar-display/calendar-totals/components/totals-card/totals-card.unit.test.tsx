import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getMetric } from "../../../../../../testing/metrics/metric-catalog";

import { TotalsCard } from "./totals-card";

import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";
import type { TotalsCardProperties } from "./totals-card";

function createGroups(count: number): MetricGroup[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `/0:group-${String(index)}`,
    key: `group-${String(index)}`,
    label: `Group ${String(index)}`,
    level: 0,
    path: null,
    rank: null,
    values: [{ metric: "events", previous: null, value: index + 1 }],
  }));
}

function createProperties(
  overrides: Partial<TotalsCardProperties> = {},
): TotalsCardProperties {
  return {
    compare: false,
    expanded: new Set<string>(),
    groups: createGroups(2),
    metric: getMetric("events"),
    onToggle: vi.fn<(id: string) => void>(),
    total: { metric: "events", previous: null, value: 10 },
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
          total: { metric: "events", previous: 8, value: 10 },
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
          metric: getMetric("covered-percent"),
          timeZone: "UTC",
          total: { metric: "covered-percent", previous: null, value: 42.5 },
        })}
      />,
    );

    expect(
      screen.getByTestId("totals-meter").getAttribute("aria-valuenow"),
    ).toBe("42.5");
    expect(screen.queryByTestId("totals-group-list")).toBeNull();
  });

  it("nests a card for every group, however many", () => {
    render(<TotalsCard {...createProperties({ groups: createGroups(7) })} />);

    expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(7);
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
