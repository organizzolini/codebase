import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../testing/calendar-api";
import {
  BUILDER_TEST,
  BUILDER_WAIT,
  findDisplayRow,
  findLayoutOption,
  pickCalendarView,
  readCalendarView,
} from "../../../../testing/calendar-page";
import { filterGroup, tagRule } from "../../../../testing/event-filters";
import { CATALOG } from "../../../../testing/metrics/metric-catalog";
import { renderCalendarRoute } from "../../../../testing/render-route";

// Each test renders the whole route, which a loaded continuous integration
// runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

// What each layout draws once its metrics have loaded.
const LOADED_TEST_ID = {
  charts: "metric-chart",
  totals: "totals-card",
} as const;

// The metric layouts are tested through the `/` route, the way the page uses
// them, with the mocked API's one small tree of metrics.
describe("metric layouts", () => {
  it.each([
    ["charts", "Charts"],
    ["totals", "Totals"],
  ] as const)(
    "opens the %s layout on the metrics of the table's days",
    async (view, label) => {
      await renderCalendarRoute(`/?view=${view}&date=2026-03-04`);

      await expect(
        screen.findByTestId(`calendar-${view}`),
      ).resolves.toBeDefined();
      await expect(
        screen.findAllByTestId(LOADED_TEST_ID[view]),
      ).resolves.not.toHaveLength(0);
      await expect(readCalendarView()).resolves.toBe(label);

      const [request] = readServedApi().requests.metrics;

      expect(request?.metrics).toStrictEqual([...CATALOG.defaults[view]]);
      expect(request?.period).toStrictEqual({
        end: "2026-04-03T04:00:00.000Z",
        start: "2026-03-04T05:00:00.000Z",
      });
      expect(request?.compareToPrevious).toBe(false);
      expect(request?.grouping?.length).toBeGreaterThan(0);
    },
    BUILDER_TEST.timeout,
  );

  it("lists Charts and Totals among the layouts, and opens them from the menu", async () => {
    await renderCalendarRoute("/?date=2026-03-04");

    await expect(findLayoutOption("Charts")).resolves.toBeDefined();
    await expect(findLayoutOption("Totals")).resolves.toBeDefined();

    await pickCalendarView("Totals");

    await expect(screen.findByTestId("calendar-totals")).resolves.toBeDefined();
    await expect(readCalendarView()).resolves.toBe("Totals");
  });

  it("lists the metrics in the Select strip, with no Page strip", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04");

    await screen.findByTestId("calendar-charts");

    expect(screen.getByRole("button", { name: "Events" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Unique names" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Duration" })).toBeDefined();
    expect(screen.queryByRole("group", { name: "Page" })).toBeNull();
    expect(screen.getByRole("group", { name: "Group" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Sort" })).toBeDefined();
  });

  it("reads the metrics the link names, and drops the names it does not know", async () => {
    const metrics = encodeURIComponent('["SPANS","unknown-slug","events"]');

    await renderCalendarRoute(
      `/?view=totals&date=2026-03-04&metrics=${metrics}`,
    );

    await screen.findByTestId("calendar-totals");

    expect(readServedApi().requests.metrics[0]?.metrics).toStrictEqual([
      "progressive-events",
      "events",
    ]);
  });

  it("still opens a link that names a metric by its old name", async () => {
    await renderCalendarRoute(
      "/?view=totals&date=2026-03-04&metrics=TOTAL_DURATION_MINUTES",
    );

    await screen.findByTestId("calendar-totals");

    expect(readServedApi().requests.metrics[0]?.metrics).toStrictEqual([
      "duration",
    ]);
    expect(screen.getByRole("button", { name: "Duration" })).toBeDefined();
  });

  it("reads the catalog once, and lists every metric with its note", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04");
    await screen.findAllByTestId("metric-chart");

    expect(readServedApi().requests.catalog).toBe(1);
    expect(
      screen
        .getAllByTestId("metric-chart")
        .map((chart) => chart.getAttribute("aria-label")),
    ).toStrictEqual(["Events", "Unique names", "Duration"]);
  });

  it("says why the catalog could not be read, and reads it again on retry", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04", {
      api: { catalogError: "The catalog is down" },
    });

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toContain("The catalog is down");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(readServedApi().requests.catalog).toBe(2);
    }, BUILDER_WAIT);
  });

  it.each(["charts", "totals"] as const)(
    "asks for the %s metrics under the Filter strip's rules",
    async (view) => {
      const filter = filterGroup("and", tagRule("body", "in", ["mars"]));

      await renderCalendarRoute(
        `/?view=${view}&date=2026-03-04&filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );
      await screen.findByTestId(`calendar-${view}`);

      await waitFor(() => {
        expect(readServedApi().requests.metrics.at(-1)?.filter).toMatchObject({
          rules: expect.any(Array) as unknown[],
        });
      }, BUILDER_WAIT);
    },
    BUILDER_TEST.timeout,
  );

  it("removes a metric from the Select strip, and asks again for the rest", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04");
    await screen.findAllByTestId("metric-chart");

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(() => {
      expect(readServedApi().requests.metrics.at(-1)?.metrics).toStrictEqual([
        "unique-names",
        "duration",
      ]);
    }, BUILDER_WAIT);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Events" })).toBeNull();
    }, BUILDER_WAIT);
  });

  it("compares with the period before when the Display menu says so", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04");
    await screen.findAllByTestId("metric-chart");

    fireEvent.click(await findDisplayRow("Compare to previous period"));

    await waitFor(() => {
      expect(readServedApi().requests.metrics.at(-1)?.compareToPrevious).toBe(
        true,
      );
    }, BUILDER_WAIT);
  });

  it("compares from the start when the link says so", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04&compare=true");
    await screen.findAllByTestId("totals-card");

    expect(readServedApi().requests.metrics[0]?.compareToPrevious).toBe(true);
  });

  it("offers the comparison on the metric layouts only", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-04");

    await findDisplayRow("Colors");

    expect(screen.queryByText("Compare to previous period")).toBeNull();
  });

  it("registers the metrics' groups, so a chip can expand them all, none being open", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04");
    await screen.findAllByTestId("metric-chart");

    const group = await screen.findByRole("group", { name: "Group" });

    fireEvent.click(within(group).getAllByTestId("chip-menu")[0] as Element);

    await expect(
      screen.findByRole("menuitem", { name: "Expand all" }, BUILDER_WAIT),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("menuitem", { name: "Collapse all" })).toBeNull();
  });

  it("says why the metrics could not be read, and reads them again on retry", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04", {
      api: { metricsError: "The metrics are down" },
    });

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toContain("The metrics are down");
    // The calendar around it stays.
    expect(screen.getByTestId("calendar-toolbar")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(readServedApi().requests.metrics).toHaveLength(2);
    }, BUILDER_WAIT);
  });

  it("shows the skeleton of the layout while the first load runs", async () => {
    await renderCalendarRoute("/?view=charts&date=2026-03-04", {
      api: { hang: true },
      waitForLoad: false,
    });

    await expect(screen.findByRole("status")).resolves.toBeDefined();
    expect(screen.getByRole("status").dataset["layout"]).toBe("bars");
  });
});
