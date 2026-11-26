import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { serveCalendarApi } from "../../../../testing/calendar-api";
import { renderWithCatalog } from "../../../../testing/metrics/metric-catalog";

import { CalendarCharts } from "./calendar-charts";

import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { MetricLayoutProperties } from "../calendar-metrics/calendar-metrics-layout.types";

function createProperties(
  overrides: Partial<MetricLayoutProperties> = {},
): MetricLayoutProperties {
  return {
    anchor: new Date("2026-03-01T12:00:00.000Z"),
    className: "calendar-charts",
    compare: false,
    filter: undefined,
    grouping: [{ field: "tag:body" }, { field: "tag:body" }],
    metrics: ["events", "unique-names"],
    onDateChange: vi.fn<(date: Date) => void>(),
    onNavigationChange: vi.fn<() => void>(),
    sort: undefined,
    timeZone: "America/New_York",
    ...overrides,
  };
}

// Until a group opens or closes, only the top-level groups show: Alpha and Beta.
describe(CalendarCharts, () => {
  it("draws a chart for each metric with a bar for each group shown", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await screen.findByRole("button", { name: "Alpha: 6" });

    expect(screen.getAllByTestId("metric-chart")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Events" })).toBeDefined();
    expect(screen.queryByText(/Total/)).toBeNull();
    expect(screen.getAllByRole("button", { name: "Alpha: 6" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "One: 4" })).toBeNull();
    expect(screen.getByTestId("calendar-charts").className).toContain(
      "calendar-charts",
    );
  });

  it("draws a column chart for each metric", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await screen.findByRole("button", { name: "Beta: 4" });

    expect(document.querySelectorAll("[data-slot='chart']")).toHaveLength(2);
  });

  it("replaces a bar with its subgroups when opened, and back when one is closed", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await screen.findByRole("button", { name: "Beta: 4" });
    fireEvent.click(screen.getByRole("button", { name: "Beta: 4" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Beta: 4" })).toBeNull();
    });

    expect(screen.getAllByRole("button", { name: "One: 3" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Alpha: 6" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "One: 3" }));

    await screen.findByRole("button", { name: "Beta: 4" });
  });

  it("shows each metric's icon beside its name", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await screen.findByRole("button", { name: "Beta: 4" });

    for (const heading of screen.getAllByRole("heading", { level: 3 })) {
      expect(within(heading).getByTestId("tag-icon")).toBeDefined();
    }
  });

  it("draws only the metrics that are not dates, and the defaults when only dates are named", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { rerender } = renderWithCatalog(
      <CalendarCharts
        {...createProperties({ metrics: ["first-start", "events"] })}
      />,
    );

    await screen.findByRole("button", { name: "Beta: 4" });

    expect(screen.getAllByTestId("metric-chart")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "First start" })).toBeNull();

    rerender(
      <CalendarCharts {...createProperties({ metrics: ["last-start"] })} />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("metric-chart")).toHaveLength(3);
    });
  });

  it("has no sort buttons without a way to change the sorts", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await screen.findByRole("button", { name: "Beta: 4" });

    expect(screen.queryAllByTestId("chart-sort-button")).toHaveLength(0);
  });

  it("appends a sort by a metric, turns it descending, then removes it", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const onSortChange = vi.fn<(sort: GroupSort[] | undefined) => void>();
    const ascending: GroupSort = {
      direction: "asc",
      key: "metric",
      metric: "events",
    };
    const name: GroupSort = { direction: "desc", key: "name" };
    const { rerender } = renderWithCatalog(
      <CalendarCharts {...createProperties({ onSortChange, sort: [name] })} />,
    );

    await screen.findByRole("button", { name: "Beta: 4" });
    fireEvent.click(
      screen.getByRole("button", { name: "Sort by Events: not sorted" }),
    );

    expect(onSortChange).toHaveBeenLastCalledWith([name, ascending]);

    rerender(
      <CalendarCharts
        {...createProperties({ onSortChange, sort: [name, ascending] })}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Sort by Events: ascending" }),
    );

    expect(onSortChange).toHaveBeenLastCalledWith([
      name,
      { ...ascending, direction: "desc" },
    ]);

    rerender(
      <CalendarCharts
        {...createProperties({
          onSortChange,
          sort: [name, { ...ascending, direction: "desc" }],
        })}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Sort by Events: descending" }),
    );

    expect(onSortChange).toHaveBeenLastCalledWith([name]);
  });

  it("colors the groups it is given colors for", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(
      <CalendarCharts
        {...createProperties({
          groupColors: new Map([["alpha", "rgb(255, 0, 0)"]]),
        })}
      />,
    );

    await expect(
      screen.findByRole("button", { name: "Beta: 4" }),
    ).resolves.toBeDefined();
  });

  it("writes a dash for a metric the last answer lacks, without a class name", async () => {
    expect.hasAssertions();

    serveCalendarApi();

    const { className: _className, ...properties } = createProperties();
    const { rerender } = renderWithCatalog(<CalendarCharts {...properties} />);

    await screen.findByRole("button", { name: "Beta: 4" });

    rerender(
      <CalendarCharts
        {...properties}
        metrics={["progressive-events"]}
      />,
    );

    expect(screen.getByRole("button", { name: "Beta: –" })).toBeDefined();
  });

  it("applies its class name", () => {
    serveCalendarApi();
    render(
      <CalendarCharts
        {...createProperties()}
        className="calendar-charts"
      />,
    );

    expect(screen.getByTestId("calendar-charts").className).toBe(
      "calendar-charts",
    );
  });

  it("shows the bars while it loads", () => {
    serveCalendarApi();
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    expect(screen.getByTestId("skeleton-bars")).toBeDefined();
  });

  it("says why it could not read the metrics, and tries again", async () => {
    const api = serveCalendarApi();

    api.fail("The metrics are down");
    renderWithCatalog(<CalendarCharts {...createProperties()} />);

    await expect(
      screen.findByText("The metrics are down"),
    ).resolves.toBeDefined();

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await expect(
      screen.findByRole("button", { name: "Beta: 4" }),
    ).resolves.toBeDefined();
  });

  it("says there is nothing to chart without a group", async () => {
    serveCalendarApi();
    renderWithCatalog(
      <CalendarCharts {...createProperties({ grouping: [] })} />,
    );

    await expect(screen.findByText("Nothing to chart")).resolves.toBeDefined();
  });
});
