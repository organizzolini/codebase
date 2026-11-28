import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serveCalendarApi } from "../../../../testing/calendar/calendar-api";
import { stubChartSize } from "../../../../testing/chart-size";
import { renderWithCatalog } from "../../../../testing/metrics/metric-catalog";
import { CalendarGroupStrip } from "../../calendar-query/calendar-group-strip/calendar-group-strip";
import { TableGroupsProvider } from "../calendar-table/components/table-groups-provider/table-groups-provider";

import { CalendarCharts } from "./calendar-charts";

import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";

// jsdom lays nothing out, so a chart is given a size to draw its bars at.
vi.mock("@codebase/presentation", async () => {
  const sizing = await import("../../../../testing/chart-size");

  return sizing.mockChartContainer();
});

// Each test renders the strip and the chart under one provider, which a loaded
// continuous integration runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

const GROUPING: EventGroupLevel[] = [
  { field: "year" },
  { field: "month" },
  { field: "day" },
];

/**
 * The chart's drawn pieces, in the order of its series: each stack position across the bars, the first bar's piece then the second's.
 */
function findPieces(): Element[] {
  return [...document.querySelectorAll(".recharts-bar-rectangle")];
}

/**
 * The names of the bars the chart lists for a keyboard, such as `Alpha: 6`.
 */
function readBars(): string[] {
  return within(screen.getByTestId("metric-chart"))
    .getAllByTestId("chart-bar")
    .map((bar) => bar.textContent);
}

function renderChartWithStrip(): void {
  serveCalendarApi();
  renderWithCatalog(
    <TableGroupsProvider>
      <CalendarGroupStrip
        facets={[]}
        grouping={GROUPING}
        onGroupingChange={() => {}}
        view="charts"
      />
      <CalendarCharts
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        compare={false}
        filter={undefined}
        grouping={GROUPING}
        metrics={["events"]}
        onDateChange={vi.fn<(date: Date) => void>()}
        onNavigationChange={vi.fn<() => void>()}
        sort={undefined}
        timeZone="America/New_York"
      />
    </TableGroupsProvider>,
  );
}

describe("charts segments", () => {
  beforeEach(() => {
    stubChartSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the stack of the piece clicked into its own bars and lists that group in the Group strip, and closes it when removed", async () => {
    renderChartWithStrip();

    await waitFor(() => {
      expect(readBars()).toStrictEqual(["Alpha: 6", "Beta: 4"]);
    });
    await waitFor(() => {
      expect(findPieces()).toHaveLength(4);
    });

    // Alpha's bar is stacked by One and Two; One has pieces of its own.
    const [one] = findPieces();

    if (one === undefined) {
      throw new Error("No piece drawn");
    }

    fireEvent.click(one);

    // One is replaced by its own bars, and the rest are its siblings and the other roots, as they were.
    await waitFor(() => {
      expect(readBars()).toStrictEqual([
        "Deep: 3",
        "More: 1",
        "Two: 2",
        "Beta: 4",
      ]);
    });

    await expect(
      screen.findByRole("button", { name: "One options" }),
    ).resolves.toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "One options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(() => {
      expect(readBars()).toStrictEqual(["One: 4", "Two: 2", "Beta: 4"]);
    });

    expect(screen.queryByRole("button", { name: "One options" })).toBeNull();
  });

  it("opens the bar itself when the piece clicked has no subgroups, and lists it in the Group strip", async () => {
    renderChartWithStrip();

    await waitFor(() => {
      expect(findPieces()).toHaveLength(4);
    });

    const two = findPieces()[2];

    if (two === undefined) {
      throw new Error("No piece drawn");
    }

    fireEvent.click(two);

    await waitFor(() => {
      expect(readBars()).toStrictEqual(["One: 4", "Two: 2", "Beta: 4"]);
    });

    await expect(
      screen.findByRole("button", { name: "Alpha options" }),
    ).resolves.toBeDefined();
  });
});
