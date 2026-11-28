import { act, fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../../../testing/calendar/calendar-api";
import {
  createBusyEvents,
  FIXTURE_EVENTS,
} from "../../../../../../testing/calendar/calendar-fixture";
import {
  findDayCell,
  findToolbar,
  pickCalendarView,
  readCalendarView,
} from "../../../../../../testing/calendar/calendar-page";
import { renderCalendarRoute } from "../../../../../../testing/render-route";
import { setViewportWidth } from "../../../../../../testing/viewport";

/**
 * The fixture's events with a run of busy ones from an instant.
 */
function withBusyEvents(
  start: string,
  count: number,
): { events: typeof FIXTURE_EVENTS } {
  return { events: [...FIXTURE_EVENTS, ...createBusyEvents(start, count)] };
}

// Each test renders the whole route; a loaded continuous integration runner
// took 5 to 7 seconds for the slowest of them, past the default 5, so the limit
// follows the other integration suites'.
vi.setConfig({ testTimeout: 30_000 });

// The views are tested through the `/` route, the way the page uses them;
// they live apart from the route's own tests only to keep each file short.
describe("calendar views", () => {
  it("switches to the week view from the toolbar", async () => {
    await renderCalendarRoute("/?date=2026-03-04");

    await pickCalendarView("Week");

    await expect(
      screen.findByRole("button", { name: /^Mars Conjunct Venus, 10:20\sAM/u }),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("grid", { name: "March 2026" })).toBeNull();
    await expect(readCalendarView()).resolves.toBe("Week");
  });

  it.each([
    { hidden: "Venus", link: "/?view=day&date=2026-03-20", shown: "Sun" },
  ])("shows only the days $link names", async ({ hidden, link, shown }) => {
    await renderCalendarRoute(link);

    await expect(
      screen.findByRole("button", {
        name: new RegExp(`^${shown} Ingress`, "u"),
      }),
    ).resolves.toBeDefined();
    expect(
      screen.queryByRole("button", {
        name: new RegExp(`^${hidden} Ingress`, "u"),
      }),
    ).toBeNull();
  });

  it("opens a busy day's overflow as a windowed list", async () => {
    await renderCalendarRoute("/?date=2026-03-01", {
      api: withBusyEvents("2026-03-12T14:00:00.000Z", 400),
    });

    // Each group of the day opens in place; the busy one's rows end in "+N more".
    const cell = await findDayCell("2026-03-12");

    for (const chip of within(cell).getAllByTestId("calendar-group-chip")) {
      fireEvent.click(chip);
    }

    fireEvent.click(
      await within(cell).findByRole("button", { name: /more$/u }),
    );

    const list = await screen.findByRole("region", {
      name: "Events on Thursday, March 12, 2026",
    });
    const shown = within(list).getAllByRole("article");

    expect(shown[0]?.getAttribute("aria-label")).toMatch(/^Busy Event/u);
    expect(shown.length).toBeLessThan(50);
  });

  it("opens on the table on a phone and on the month wider", async () => {
    setViewportWidth(375);
    await renderCalendarRoute("/?date=2026-03-04");

    await expect(screen.findByTestId("calendar-table")).resolves.toBeDefined();

    act(() => {
      setViewportWidth(1280);
    });

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
    expect(screen.queryByTestId("calendar-table")).toBeNull();
  });

  it("keeps the view the link names whatever the width", async () => {
    setViewportWidth(375);
    await renderCalendarRoute("/?view=week&date=2026-03-04");

    await screen.findByRole("button", { name: /^Mars Conjunct Venus/u });
    act(() => {
      setViewportWidth(1280);
    });

    expect(screen.queryByTestId("calendar-table")).toBeNull();
    expect(screen.queryByRole("grid", { name: "March 2026" })).toBeNull();
  });

  it("opens a link to the retired agenda view as the table", async () => {
    await renderCalendarRoute("/?view=agenda&date=2026-03-04");

    await expect(screen.findByTestId("calendar-table")).resolves.toBeDefined();
    await expect(readCalendarView()).resolves.toBe("Table");
  });

  it("opens a link to the retired three-day view as the week", async () => {
    await renderCalendarRoute("/?view=three-day&date=2026-03-04");

    await expect(
      screen.findByRole("button", { name: /^Mars Conjunct Venus, 10:20\sAM/u }),
    ).resolves.toBeDefined();
    await expect(readCalendarView()).resolves.toBe("Week");
  });

  it("picks a view from the toolbar's menu on a phone", async () => {
    setViewportWidth(375);
    await renderCalendarRoute("/?date=2026-03-04");

    await pickCalendarView("Month");

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it.each([
    { end: "2026-04-16", link: "month&date=2026-03-04", start: "2026-02-21" },
    { end: "2026-03-09", link: "week&date=2026-03-04", start: "2026-02-28" },
    { end: "2026-03-06", link: "day&date=2026-03-04", start: "2026-03-03" },
    { end: "2026-04-04", link: "table&date=2026-03-04", start: "2026-03-03" },
    {
      end: "2026-06-03",
      link: "table&date=2026-03-04&days=90",
      start: "2026-03-03",
    },
  ])("reads only the days the $link view shows", async (expected) => {
    await renderCalendarRoute(`/?view=${expected.link}`);
    const api = readServedApi();

    expect(api.requests.events.map(({ period }) => period)).toStrictEqual([
      {
        end: `${expected.end}T00:00:00.000Z`,
        start: `${expected.start}T00:00:00.000Z`,
      },
    ]);
  });

  it("never reads more than a year of the table at once", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-04&days=2557");
    const api = readServedApi();

    expect(api.requests.events[0]?.period.end).toBe("2026-04-04T00:00:00.000Z");
  });

  it("keeps the calendar on screen while a slow move reloads", async () => {
    await renderCalendarRoute("/?date=2026-03-01", { api: { delay: 600 } });
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: /Next/u }),
    );

    // Past the moment a first load would show its skeleton, but before the
    // slow read answers.
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    expect(screen.queryByRole("status", { name: "Loading events" })).toBeNull();
    expect(screen.getByRole("grid", { name: "April 2026" })).toBeDefined();
    await expect(findDayCell("2026-04-10")).resolves.toBeDefined();
  });

  it("falls back to the month for a view it does not know", async () => {
    await renderCalendarRoute("/?view=year&date=2026-03-01");

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("says which days hold no events in the view shown", async () => {
    await renderCalendarRoute("/?view=week&date=2026-05-06");

    await expect(
      screen.findByText("No events this week"),
    ).resolves.toBeDefined();
  });

  it("reads a window already seen only once", async () => {
    await renderCalendarRoute("/?date=2026-03-04");
    const api = readServedApi();

    const toolbar = await findToolbar();

    fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));
    await findDayCell("2026-04-10");
    fireEvent.click(within(toolbar).getByRole("button", { name: /Previous/u }));
    await screen.findByRole("grid", { name: "March 2026" });

    expect(api.requests.events).toHaveLength(2);
  });

  it("scrolls a phone's week sideways under a sticky hour column", async () => {
    setViewportWidth(375);
    await renderCalendarRoute("/?view=week&date=2026-03-04");

    const event = await screen.findByRole("button", {
      name: /^Mars Conjunct Venus/u,
    });
    const grid = event.closest('[data-slot="event-calendar-time-grid"]');

    expect(grid?.className).toContain("min-w-[48rem]");
    expect(
      grid?.querySelector('[data-slot="event-calendar-time-gutter"]')
        ?.className,
    ).toContain("sticky");
  });

  it("hides the last window's empty notice while the next one loads", async () => {
    await renderCalendarRoute("/?date=2026-05-01", { api: { delay: 600 } });
    await screen.findByText("No events this month");
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: /Previous/u }),
    );
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    expect(screen.queryByText("No events this month")).toBeNull();
    await expect(findDayCell("2026-04-10")).resolves.toBeDefined();
  });
});
