import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { findToolbar } from "../../../testing/calendar-page";
import {
  createBusyEventsSql,
  createRecordingEventsDatabase,
  createTestEventsDatabase,
} from "../../../testing/events-database";
import { renderRoute } from "../../../testing/render-route";

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

// The timeline is tested through the `/` route, the way the page uses it;
// it lives apart from the route's own tests only to keep each file short.
describe("calendar timeline", () => {
  it("switches to the timeline from the toolbar", async () => {
    await renderRoute("/?date=2026-03-04");

    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Timeline" }),
    );

    await expect(
      screen.findByTestId("calendar-timeline"),
    ).resolves.toBeDefined();
    expect(
      within(await findToolbar()).getByRole("heading", { name: "March 2026" }),
    ).toBeDefined();
  });

  it("nests a row per planet under each type, counting their events", async () => {
    await renderRoute("/?view=timeline&date=2026-03-04");

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Aspect1",
      "Mars1",
      "Venus1",
      "Ingress2",
      "Sun1",
      "Venus1",
      "Retrograde1",
      "Mercury1",
    ]);
  });

  it("collapses and expands a group", async () => {
    await renderRoute("/?view=timeline&date=2026-03-04");

    const aspect = await screen.findByRole("button", { name: "Aspect" });

    fireEvent.click(aspect);

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Aspect1",
      "Ingress2",
      "Sun1",
      "Venus1",
      "Retrograde1",
      "Mercury1",
    ]);
    expect(aspect.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(aspect);

    await expect(findTimelineRows()).resolves.toContain("Mars1");
  });

  it.each([
    { end: "2026-03-06", scale: "day", start: "2026-03-03" },
    { end: "2026-03-09", scale: "week", start: "2026-02-28" },
    { end: "2026-04-02", scale: "month", start: "2026-02-28" },
    { end: "2026-04-06", scale: "quarter", start: "2025-12-27" },
    { end: "2027-01-02", scale: "year", start: "2025-12-31" },
  ])("reads only the days the $scale scale shows", async (expected) => {
    const { database, queries } = createRecordingEventsDatabase();

    await renderRoute(
      `/?view=timeline&scale=${expected.scale}&date=2026-03-04`,
      { eventsDatabase: database },
    );

    expect(queries.map(({ window }) => window)).toStrictEqual([
      {
        end: new Date(`${expected.end}T00:00:00.000Z`),
        start: new Date(`${expected.start}T00:00:00.000Z`),
      },
    ]);
  });

  it.each([
    { scale: "Week", title: "March 1 - 7, 2026" },
    { scale: "Month", title: "March 2026" },
    { scale: "Quarter", title: "Q1 2026" },
    { scale: "Year", title: "2026" },
  ])("zooms out from a day to the $scale", async ({ scale, title }) => {
    await renderRoute("/?view=timeline&scale=day&date=2026-03-04");

    fireEvent.click(
      within(await findToolbar()).getByRole("button", {
        name: /^View options/u,
      }),
    );
    fireEvent.click(await screen.findByText("Scale"));
    fireEvent.click(
      within(await screen.findByRole("group", { name: "Scale" })).getByRole(
        "button",
        { name: scale },
      ),
    );

    // The toolbar is drawn again for the new scale, so the page is searched.
    await expect(
      screen.findByRole("heading", { name: title }),
    ).resolves.toBeDefined();
  });

  it("rolls a whole year's events into its rows", async () => {
    await renderRoute("/?view=timeline&scale=year&date=2026-03-04");

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Aspect2",
      "Mars2",
      "Saturn1",
      "Venus1",
      "Ingress3",
      "Sun2",
      "Venus1",
      "Retrograde1",
      "Mercury1",
    ]);
  });

  it("draws an instant as a diamond and a span as a bar", async () => {
    await renderRoute("/?view=timeline&date=2026-03-04");

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
    await renderRoute("/?view=timeline&date=2026-03-10", {
      eventsDatabase: createTestEventsDatabase({
        extraSql: createBusyEventsSql("2026-03-10T14:00:00.000Z", 500),
      }),
    });

    const timeline = await screen.findByTestId("calendar-timeline");

    await expect(
      within(timeline).findByRole("button", { name: /^500 events/u }),
    ).resolves.toBeDefined();
    expect(
      timeline.querySelectorAll('[data-slot="gantt-bar"]').length,
    ).toBeLessThan(10);
  });

  it("lists the events behind a count when it is clicked", async () => {
    await renderRoute("/?view=timeline&date=2026-03-10", {
      eventsDatabase: createTestEventsDatabase({
        extraSql: createBusyEventsSql("2026-03-10T14:00:00.000Z", 500),
      }),
    });

    const timeline = await screen.findByTestId("calendar-timeline");

    fireEvent.click(
      await within(timeline).findByRole("button", { name: /^500 events/u }),
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("500 events")).toBeDefined();

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("opens one event by its name when its marker is clicked", async () => {
    await renderRoute("/?view=timeline&date=2026-03-04");

    fireEvent.click(
      await screen.findByRole("button", { name: /^Mercury Retrograde/u }),
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getAllByText(/Mercury Retrograde/u)).toHaveLength(2);
  });

  it("draws every event in one row when not grouped", async () => {
    await renderRoute("/?view=timeline&date=2026-03-04&group=%5B%5D");

    // The events that overlap in time are drawn in a second lane beneath,
    // a row with no title.
    await expect(findTimelineRows()).resolves.toStrictEqual([
      "All events4",
      "",
    ]);
  });

  it("nests a tag grouped below its root's children under each tag between", async () => {
    const grouping = encodeURIComponent(
      JSON.stringify([{ depth: 3, field: "tag:tag-type" }]),
    );

    await renderRoute(
      `/?view=timeline&scale=year&date=2026-03-04&group=${grouping}`,
    );

    await expect(findTimelineRows()).resolves.toStrictEqual([
      "Aspect2",
      "Major Aspect2",
      "Conjunct1",
      "Square1",
      "Ingress3",
      "Retrograde1",
    ]);
  });
});
