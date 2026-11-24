import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../testing/calendar-api";
import {
  createBusyEvents,
  FIXTURE_EVENTS,
} from "../../../../testing/calendar-fixture";
import {
  findToolbar,
  pickCalendarView,
  pickTimelineScale,
  readCalendarView,
} from "../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";

/**
 * The timeline's tree of rows, as each row's title reads, in order.
 */
async function findTimelineRows(): Promise<string[]> {
  const timeline = await screen.findByTestId("calendar-timeline");

  return [
    ...timeline.querySelectorAll(
      '[data-slot="gantt-tree-pane"] [data-slot="gantt-row-group"]',
    ),
  ].map((row) => row.textContent);
}

// Aspect's children, then the bodies, as a link holds them.
const NESTED_GROUPING = encodeURIComponent(
  JSON.stringify([{ field: "tag:tag-aspect" }, { field: "tag:tag-body" }]),
);

// Grouped by body alone, as the rows these tests count are.
const BODY_GROUPING = encodeURIComponent(
  JSON.stringify([{ field: "tag:tag-body" }]),
);

/**
 * The fixture's events with a run of busy ones from an instant.
 */
function withBusyEvents(
  start: string,
  count: number,
): { events: typeof FIXTURE_EVENTS } {
  return { events: [...FIXTURE_EVENTS, ...createBusyEvents(start, count)] };
}

// Tested through the `/` route, as the page uses it; each test needs up to 30 seconds on a loaded CI runner.
vi.setConfig({ testTimeout: 30_000 });

describe("calendar timeline", () => {
  it("switches to the timeline from the toolbar", async () => {
    await renderCalendarRoute("/?date=2026-03-04");

    await pickCalendarView("Timeline");

    await expect(
      screen.findByTestId("calendar-timeline"),
    ).resolves.toBeDefined();
    await expect(readCalendarView()).resolves.toBe("Timeline");
    expect(
      within(await findToolbar()).getByRole("heading", { name: "March 2026" }),
    ).toBeDefined();
  });

  // Each leaf group holds its events in a row of its own with no title, so it can collapse.
  it("draws a row per body, counting their events", async () => {
    await renderCalendarRoute(
      `/?view=timeline&date=2026-03-04&group=${BODY_GROUPING}`,
    );

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Mars1",
      "",
      "Mercury1",
      "",
      "Sun1",
      "",
      "Venus2",
      "",
    ]);
  });

  it("nests a row per body under each aspect, counting their events", async () => {
    await renderCalendarRoute(
      `/?view=timeline&date=2026-03-04&group=${NESTED_GROUPING}`,
    );

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Simple1",
      "Mars1",
      "",
      "Venus1",
      "",
      "No Aspect3",
      "Mercury1",
      "",
      "Sun1",
      "",
      "Venus1",
      "",
    ]);
  });

  it("collapses and expands a group", async () => {
    await renderCalendarRoute(
      `/?view=timeline&date=2026-03-04&group=${NESTED_GROUPING}`,
    );

    const simple = await screen.findByRole("button", { name: "Simple" });

    fireEvent.click(simple);

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Simple1",
      "No Aspect3",
      "Mercury1",
      "",
      "Sun1",
      "",
      "Venus1",
      "",
    ]);
    expect(simple.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(simple);

    await expect(findTimelineRows()).resolves.toContain("Mars1");
  });

  it.each([
    { end: "2026-03-06", scale: "day", start: "2026-03-03" },
    { end: "2026-03-09", scale: "week", start: "2026-02-28" },
    { end: "2026-04-02", scale: "month", start: "2026-02-28" },
    { end: "2026-04-06", scale: "quarter", start: "2025-12-27" },
    { end: "2027-01-02", scale: "year", start: "2025-12-31" },
  ])("reads only the days the $scale scale shows", async (expected) => {
    await renderCalendarRoute(
      `/?view=timeline&scale=${expected.scale}&date=2026-03-04`,
    );
    const api = readServedApi();

    expect(api.requests.events.map(({ period }) => period)).toStrictEqual([
      {
        end: `${expected.end}T00:00:00.000Z`,
        start: `${expected.start}T00:00:00.000Z`,
      },
    ]);
  });

  it.each([
    { scale: "Week", title: "March 1 - 7, 2026" },
    { scale: "Month", title: "March 2026" },
    { scale: "Quarter", title: "Q1 2026" },
    { scale: "Year", title: "2026" },
  ])("zooms out from a day to the $scale", async ({ scale, title }) => {
    await renderCalendarRoute("/?view=timeline&scale=day&date=2026-03-04");

    await pickTimelineScale(scale);

    // The toolbar is drawn again for the new scale, so the page is searched.
    await expect(
      screen.findByRole("heading", { name: title }),
    ).resolves.toBeDefined();
  });

  it("rolls a whole year's events into its rows", async () => {
    await renderCalendarRoute(
      `/?view=timeline&scale=year&date=2026-03-04&group=${BODY_GROUPING}`,
    );

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Mars2",
      "",
      "Mercury1",
      "",
      "Saturn1",
      "",
      "Sun2",
      "",
      "Venus2",
      "",
    ]);
  });

  it("draws an instant as a circle and a span as a bar", async () => {
    await renderCalendarRoute("/?view=timeline&date=2026-03-04");

    // Under Mars and under Venus.
    const instants = await screen.findAllByRole("button", {
      name: /^Mars Conjunct Venus/u,
    });
    const span = screen.getByRole("button", { name: /^Mercury Retrograde/u });

    expect(instants).toHaveLength(2);
    expect(
      instants[0]?.querySelector('[data-slot="timeline-instant"]'),
    ).not.toBeNull();
    expect(span.querySelector('[data-slot="timeline-instant"]')).toBeNull();
    expect(span.textContent).toBe("Mercury Retrograde");
  });

  it("clusters crowded markers into a count", async () => {
    await renderCalendarRoute(
      `/?view=timeline&date=2026-03-10&group=${BODY_GROUPING}`,
      {
        api: withBusyEvents("2026-03-10T14:00:00.000Z", 500),
      },
    );

    const timeline = await screen.findByTestId("calendar-timeline");

    await waitFor(() => {
      expect(
        timeline.querySelector('[data-slot="timeline-cluster"]')?.textContent,
      ).toBe("500");
    });

    expect(
      timeline.querySelectorAll('[data-slot="gantt-bar"]').length,
    ).toBeLessThan(10);
  });

  it("lists the events behind a count when it is clicked", async () => {
    await renderCalendarRoute(
      `/?view=timeline&date=2026-03-10&group=${BODY_GROUPING}`,
      {
        api: withBusyEvents("2026-03-10T14:00:00.000Z", 500),
      },
    );

    const timeline = await screen.findByTestId("calendar-timeline");

    await waitFor(() => {
      expect(
        timeline.querySelector('[data-slot="timeline-cluster"]'),
      ).not.toBeNull();
    });
    fireEvent.click(
      timeline.querySelector('[data-slot="timeline-cluster"]') ?? timeline,
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("500 events")).toBeDefined();

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("opens one event by its name when its marker is clicked", async () => {
    await renderCalendarRoute("/?view=timeline&date=2026-03-04");

    fireEvent.click(
      await screen.findByRole("button", { name: /^Mercury Retrograde/u }),
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getAllByText(/Mercury Retrograde/u)).toHaveLength(2);
  });

  it("draws every event in one row when not grouped", async () => {
    await renderCalendarRoute("/?view=timeline&date=2026-03-04&group=%5B%5D");

    // The events that overlap in time are drawn in a second lane beneath,
    // a row with no title.
    await expect(findTimelineRows()).resolves.toStrictEqual([
      "All events4",
      "",
    ]);
  });

  it("nests a tag grouped below its root's children under each tag between", async () => {
    const grouping = encodeURIComponent(
      JSON.stringify([
        { field: "tag:tag-aspect" },
        { field: "tag:tag-aspect", parent: "tag-simple" },
        { field: "tag:tag-aspect", parent: "tag-major" },
      ]),
    );

    await renderCalendarRoute(
      `/?view=timeline&scale=year&date=2026-03-04&group=${grouping}`,
    );

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Simple2",
      "Major2",
      "Conjunct1",
      "",
      "Square1",
      "",
      "No Aspect4",
      "",
      "",
    ]);
  });
});
