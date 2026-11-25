import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../testing/calendar-api";
import {
  BUILDER_TEST,
  BUILDER_WAIT,
  findToolbar,
  pickCalendarView,
} from "../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { TableGroupsProvider } from "../calendar-table/components/table-groups-provider/table-groups-provider";

import { CalendarCharts } from "./calendar-charts";

import type { MetricLayoutProperties } from "../calendar-metrics/calendar-metrics-layout.types";

// Each test renders the whole route or a shared provider, which a loaded
// continuous integration runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

function createProperties(): MetricLayoutProperties {
  return {
    anchor: new Date("2026-03-01T12:00:00.000Z"),
    compare: false,
    filter: undefined,
    grouping: [{ field: "tag:body" }, { field: "tag:body" }],
    metrics: ["EVENTS"],
    onDateChange: vi.fn<(date: Date) => void>(),
    onNavigationChange: vi.fn<() => void>(),
    sort: undefined,
    timeZone: "America/New_York",
  };
}

/**
 * The first of the chart's bars as buttons that has the name, once it is drawn.
 */
async function findBar(name: string): Promise<HTMLElement> {
  const [bar] = await screen.findAllByRole("button", { name }, BUILDER_WAIT);

  if (bar === undefined) {
    throw new Error(`No bar named ${name}`);
  }

  return bar;
}

/**
 * A chip's ellipsis button on the toolbar's strips, by its name.
 */
async function findChipMenu(name: string): Promise<HTMLElement> {
  const strip = await within(await findToolbar()).findByRole(
    "group",
    { name: "Group" },
    BUILDER_WAIT,
  );

  return within(strip).findByRole("button", { name }, BUILDER_WAIT);
}

describe("charts layout", () => {
  it(
    "draws a chart of the default metrics on the route",
    async () => {
      await renderCalendarRoute("/?view=charts&date=2026-03-04");

      await expect(
        screen.findAllByTestId("metric-chart", {}, BUILDER_WAIT),
      ).resolves.toHaveLength(3);
      await expect(
        screen.findByRole("heading", { name: "Total duration" }),
      ).resolves.toBeDefined();
    },
    BUILDER_TEST.timeout,
  );

  it(
    "cycles a chart's sort button through the Sort strip: ascending, descending, then removed",
    async () => {
      await renderCalendarRoute("/?view=charts&date=2026-03-04");

      const toolbar = await findToolbar();
      const button = await screen.findByRole(
        "button",
        { name: "Sort by Events: not sorted" },
        BUILDER_WAIT,
      );

      fireEvent.click(button);

      await expect(
        screen.findByRole("button", { name: "Sort by Events: ascending" }),
      ).resolves.toBeDefined();
      expect(within(toolbar).getAllByText("Events").length).toBeGreaterThan(0);

      fireEvent.click(
        screen.getByRole("button", { name: "Sort by Events: ascending" }),
      );

      await expect(
        screen.findByRole("button", { name: "Sort by Events: descending" }),
      ).resolves.toBeDefined();

      fireEvent.click(
        screen.getByRole("button", { name: "Sort by Events: descending" }),
      );

      await expect(
        screen.findByRole("button", { name: "Sort by Events: not sorted" }),
      ).resolves.toBeDefined();
    },
    BUILDER_TEST.timeout,
  );

  it(
    "draws only the top-level groups until one opens, then keeps that across layouts",
    async () => {
      await renderCalendarRoute("/?view=charts&date=2026-03-04");

      await screen.findAllByRole("button", { name: "Alpha: 6" }, BUILDER_WAIT);

      expect(screen.getAllByRole("button", { name: "Beta: 4" })).toHaveLength(
        1,
      );
      expect(screen.queryAllByRole("button", { name: "One: 4" })).toHaveLength(
        0,
      );

      for (const alpha of screen
        .getAllByRole("button", { name: "Alpha: 6" })
        .slice(0, 1)) {
        fireEvent.click(alpha);
      }

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: "One: 4" }).length,
        ).toBeGreaterThan(0);
      }, BUILDER_WAIT);

      expect(
        screen.queryAllByRole("button", { name: "Alpha: 6" }),
      ).toHaveLength(0);
      expect(screen.getAllByRole("button", { name: "Beta: 4" })).toHaveLength(
        1,
      );

      await pickCalendarView("Table");
      await pickCalendarView("Charts");

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: "One: 4" }).length,
        ).toBeGreaterThan(0);
      }, BUILDER_WAIT);
    },
    BUILDER_TEST.timeout,
  );

  it(
    "draws the bars and stacks the Group strip's levels give, and redraws them when a level is removed",
    async () => {
      await renderCalendarRoute(
        `/?view=charts&date=2026-03-04&group=${encodeURIComponent(JSON.stringify([{ field: "year" }, { field: "month" }]))}`,
      );

      const [bar] = await screen.findAllByRole(
        "button",
        { name: "Alpha: 6" },
        BUILDER_WAIT,
      );

      // The first level is the bars, and the second splits each into stacked pieces it opens into.
      expect(bar?.getAttribute("aria-expanded")).toBe("false");
      expect(readServedApi().requests.metrics.at(-1)?.grouping).toHaveLength(2);

      fireEvent.click(await findChipMenu("Month options"));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

      await waitFor(() => {
        expect(readServedApi().requests.metrics.at(-1)?.grouping).toHaveLength(
          1,
        );
      }, BUILDER_WAIT);
      await waitFor(() => {
        expect(
          screen
            .getAllByRole("button", { name: "Alpha: 6" })[0]
            ?.getAttribute("aria-expanded"),
        ).toBeNull();
      }, BUILDER_WAIT);
    },
    BUILDER_TEST.timeout,
  );

  it(
    "reads the chips' Collapse all and Expand all from the bars shown: none open until one is",
    async () => {
      await renderCalendarRoute("/?view=charts&date=2026-03-04");
      await screen.findAllByRole("button", { name: "Alpha: 6" }, BUILDER_WAIT);

      fireEvent.click(await findChipMenu("Tags options"));
      await screen.findByRole("menuitem", { name: "Expand all" });

      expect(
        screen.queryByRole("menuitem", { name: "Collapse all" }),
      ).toBeNull();

      fireEvent.keyDown(document.body, { key: "Escape" });
      fireEvent.click(await findBar("Alpha: 6"));

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: "One: 4" }).length,
        ).toBeGreaterThan(0);
      }, BUILDER_WAIT);

      fireEvent.click(await findChipMenu("Tags options"));

      await expect(
        screen.findByRole("menuitem", { name: "Collapse all" }),
      ).resolves.toBeDefined();
    },
    BUILDER_TEST.timeout,
  );

  it(
    "adds a group opened in the chart to the Group strip, keeps it in the table, and closes it when removed",
    async () => {
      await renderCalendarRoute("/?view=charts&date=2026-03-04");

      fireEvent.click(await findBar("Alpha: 6"));

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: "One: 4" }).length,
        ).toBeGreaterThan(0);
      }, BUILDER_WAIT);

      // The strip lists the opened group beside the Tags chip.
      await expect(findChipMenu("Alpha options")).resolves.toBeDefined();

      await pickCalendarView("Table");
      await screen.findByTestId("calendar-table");

      // The mocked events' groups have other ids than the mocked metrics', so the table lists no chip of its own here; the chart's come back with it.
      await pickCalendarView("Charts");
      await screen.findAllByRole("button", { name: "One: 4" }, BUILDER_WAIT);

      fireEvent.click(await findChipMenu("Alpha options"));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: "Alpha: 6" }).length,
        ).toBeGreaterThan(0);
      }, BUILDER_WAIT);

      expect(screen.queryAllByRole("button", { name: "One: 4" })).toHaveLength(
        0,
      );
      expect(
        screen.queryByRole("button", { name: "Alpha options" }),
      ).toBeNull();
    },
    BUILDER_TEST.timeout,
  );

  it(
    "shares which groups are open with every layout under one provider",
    async () => {
      serveCalendarApi();
      render(
        <TableGroupsProvider>
          <CalendarCharts {...createProperties()} />
          <CalendarCharts {...createProperties()} />
        </TableGroupsProvider>,
      );

      await screen.findAllByRole("button", { name: "Alpha: 6" });

      for (const beta of screen
        .getAllByRole("button", { name: "Beta: 4" })
        .slice(0, 1)) {
        fireEvent.click(beta);
      }

      await waitFor(() => {
        expect(
          screen.queryAllByRole("button", { name: "Beta: 4" }),
        ).toHaveLength(0);
      }, BUILDER_WAIT);

      expect(screen.getAllByRole("button", { name: "One: 3" })).toHaveLength(2);
    },
    BUILDER_TEST.timeout,
  );
});
