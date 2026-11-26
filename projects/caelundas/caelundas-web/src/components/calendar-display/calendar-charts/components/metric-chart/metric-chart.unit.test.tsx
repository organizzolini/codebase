import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createChartBar } from "../../../../../../testing/chart-bars";
import { stubChartSize } from "../../../../../../testing/chart-size";
import { getMetric } from "../../../../../../testing/metrics/metric-catalog";

import { MetricChart } from "./metric-chart";

import type { MetricChartProperties } from "./metric-chart";

vi.mock("@codebase/presentation", async () => {
  const sizing = await import("../../../../../../testing/chart-size");

  return sizing.mockChartContainer();
});

function createProperties(
  overrides: Partial<MetricChartProperties> = {},
): MetricChartProperties {
  return {
    bars: [createChartBar()],
    metric: getMetric("events"),
    onOpen: vi.fn<(parent: string, id: string, color?: string) => void>(),
    onToggle: vi.fn<(id: string, color?: string) => void>(),
    ...overrides,
  };
}

describe(MetricChart, () => {
  beforeEach(() => {
    stubChartSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("names the metric under its icon, with no total", () => {
    render(<MetricChart {...createProperties()} />);

    const heading = screen.getByRole("heading", { name: "Events" });

    expect(within(heading).getByTestId("tag-icon")).toBeDefined();
    expect(screen.queryByText(/Total/)).toBeNull();
  });

  it("describes the metric under its name with the catalog's note", () => {
    render(<MetricChart {...createProperties()} />);

    expect(screen.getByTestId("metric-chart-note").textContent).toBe(
      getMetric("events").note,
    );
  });

  it("has no sort button without a way to sort", () => {
    render(<MetricChart {...createProperties()} />);

    expect(screen.queryByTestId("chart-sort-button")).toBeNull();
  });

  it("sorts from a button at the top right", () => {
    const onSort = vi.fn<() => void>();

    render(
      <MetricChart {...createProperties({ onSort, sortDirection: "asc" })} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Sort by Events: ascending" }),
    );

    expect(onSort).toHaveBeenCalledExactlyOnceWith();
  });
});
