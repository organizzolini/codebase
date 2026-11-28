import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../testing/calendar/calendar-api";
import { BUILDER_WAIT } from "../../../../testing/calendar/calendar-page";
import { getMetric } from "../../../../testing/metrics/metric-catalog";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { hideEmptyMetricGroups } from "../../../hooks/use-metric-layout/use-metric-layout.utilities";
import { buildChartBars } from "../calendar-charts/calendar-charts.utilities";

import { flattenMetricGroups } from "./components/calendar-metrics-tree/calendar-metrics-tree.utilities";

import type { MetricGroup } from "./calendar-metrics.types";

// Each test renders the whole route, which a loaded continuous integration
// runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

const GROUP = encodeURIComponent(JSON.stringify([{ field: "tag:tag-body" }]));

/**
 * What a chart draws for groups: each bar's value, then its segments' names.
 */
function draw(shown: readonly MetricGroup[]): string[] {
  return buildChartBars(
    flattenMetricGroups(shown, new Set()),
    getMetric("events"),
    { colors: undefined, compare: false, format: (_, value) => `${value}` },
  ).flatMap((bar) => [bar.text, ...bar.segments.map((one) => one.label)]);
}

/**
 * A group of events with its subgroups.
 */
function group(
  id: string,
  events: number,
  children?: MetricGroup[],
): MetricGroup {
  return {
    ...(children === undefined ? {} : { children }),
    id,
    key: id,
    label: id,
    level: 0,
    path: null,
    rank: null,
    values: [{ metric: "events", previous: null, value: events }],
  };
}

/**
 * Whether any element of the screen, or of one in it, reads exactly this text.
 */
function hasText(name: string, root: HTMLElement | undefined): boolean {
  return (
    (root === undefined
      ? screen.queryAllByText(name)
      : within(root).queryAllByText(name)
    ).length > 0
  );
}

/**
 * The names of the bars the first chart lists, such as `Alpha: 6`.
 */
function readBars(): string[] {
  return within(screen.getAllByTestId("metric-chart")[0] ?? document.body)
    .queryAllByTestId("chart-bar")
    .map((bar) => bar.textContent);
}

// The mocked API answers a tree with groups that hold no events when asked: Zero, Hollow with two empty subgroups, and Void beneath Alpha.
describe("hiding empty groups", () => {
  afterEach(() => {
    cleanup();
  });

  it("draws a bar for every group, empty ones too, until the link asks", async () => {
    await renderCalendarRoute(
      `/?view=charts&date=2026-03-04&group=${GROUP}&metrics=events`,
      { api: { emptyGroups: true } },
    );

    await waitFor(() => {
      expect(readBars().length).toBeGreaterThan(0);
    }, BUILDER_WAIT);

    expect(readBars()).toStrictEqual([
      "Alpha: 6",
      "Beta: 4",
      "Zero: 0",
      "Hollow: 0",
    ]);
  });

  it("leaves the bars of empty groups out of every chart, keeping the others", async () => {
    await renderCalendarRoute(
      `/?view=charts&date=2026-03-04&group=${GROUP}&metrics=events&metrics=duration&hideEmpty=true`,
      { api: { emptyGroups: true } },
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("metric-chart")).toHaveLength(2);
    }, BUILDER_WAIT);

    for (const chart of screen.getAllByTestId("metric-chart")) {
      const labels = within(chart)
        .getAllByTestId("chart-bar")
        .map((bar) => bar.textContent.split(":")[0]);

      expect(labels).toStrictEqual(["Alpha", "Beta"]);
    }
  });

  it("leaves out the stacked segment of an empty subgroup, the bar's value as it was", () => {
    const groups = [group("Alpha", 6, [group("One", 6), group("Void", 0)])];

    expect(draw(groups)).toStrictEqual(["6", "One", "Void"]);
    expect(draw(hideEmptyMetricGroups(groups))).toStrictEqual(["6", "One"]);
  });

  it("asks the API for the event count to tell, when the events are not charted", async () => {
    await renderCalendarRoute(
      `/?view=charts&date=2026-03-04&group=${GROUP}&metrics=duration&hideEmpty=true`,
      { api: { emptyGroups: true } },
    );

    await waitFor(() => {
      expect(readBars().length).toBeGreaterThan(0);
    }, BUILDER_WAIT);

    expect(readBars().map((bar) => bar.split(":")[0])).toStrictEqual([
      "Alpha",
      "Beta",
    ]);
    expect(readServedApi().requests.metrics.at(-1)?.metrics).toContain(
      "events",
    );
  });

  it("shows every subtotal card, empty ones too, on the totals until the link asks", async () => {
    await renderCalendarRoute(`/?view=totals&date=2026-03-04&group=${GROUP}`, {
      api: { emptyGroups: true },
    });

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(hasText("Zero", events)).toBe(true);
    }, BUILDER_WAIT);

    expect(hasText("Hollow", events)).toBe(true);
  });

  it("leaves the empty subtotals out of the totals, and the parent's value as it was", async () => {
    await renderCalendarRoute(
      `/?view=totals&date=2026-03-04&group=${GROUP}&hideEmpty=true`,
      { api: { emptyGroups: true } },
    );

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(hasText("Alpha", events)).toBe(true);
    }, BUILDER_WAIT);

    expect(hasText("Beta", events)).toBe(true);
    expect(hasText("Zero", events)).toBe(false);
    expect(hasText("Hollow", events)).toBe(false);
    expect(within(events).getByTestId("totals-value").textContent).toBe("10");
  });

  it("lists the same rows in the table, whose groups all hold events", async () => {
    const path = `/?view=table&date=2026-03-04&group=${GROUP}`;

    await renderCalendarRoute(path);

    const body = await screen.findByTestId("calendar-table-body");

    await waitFor(() => {
      expect(body.textContent.length).toBeGreaterThan(0);
    }, BUILDER_WAIT);

    const shown = body.textContent;

    cleanup();
    await renderCalendarRoute(`${path}&hideEmpty=true`);

    const hidden = await screen.findByTestId("calendar-table-body");

    await waitFor(() => {
      expect(hidden.textContent).toBe(shown);
    }, BUILDER_WAIT);
  });
});
