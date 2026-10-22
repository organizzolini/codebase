import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { findToolbar } from "../../../testing/calendar-page";
import {
  createBusyEventsSql,
  createRecordingEventsDatabase,
  createTestEventsDatabase,
} from "../../../testing/events-database";
import { renderRoute } from "../../../testing/render-route";
import { setViewportWidth } from "../../../testing/viewport";

// The agenda's own behavior is tested ungrouped; grouping it has its own
// tests.
const UNGROUPED = "&group=%5B%5D";

// The views are tested through the `/` route, the way the page uses them;
// they live apart from the route's own tests only to keep each file short.
describe("calendar views", () => {
  it("switches to the week view from the toolbar", async () => {
    await renderRoute("/?date=2026-03-04");

    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Week" }),
    );

    await expect(
      screen.findByRole("button", { name: /^Mars Conjunct Venus, 10:20\sAM/u }),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("grid", { name: "March 2026" })).toBeNull();
    expect(
      within(await findToolbar()).getByRole("button", {
        name: "Week",
        pressed: true,
      }),
    ).toBeDefined();
  });

  it.each([
    { hidden: "Venus", link: "/?view=day&date=2026-03-20", shown: "Sun" },
    { hidden: "Sun", link: "/?view=three-day&date=2026-03-24", shown: "Venus" },
  ])("shows only the days $link names", async ({ hidden, link, shown }) => {
    await renderRoute(link);

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

  it("lists the next days' events by day in the agenda", async () => {
    await renderRoute(`/?view=agenda&date=2026-03-04${UNGROUPED}`);

    const agenda = await screen.findByRole("region", { name: "Agenda" });
    const days = within(agenda).getAllByRole("heading", { level: 3 });

    expect(days.map((day) => day.textContent)).toStrictEqual([
      "Wednesday, March 4, 2026",
      "Friday, March 20, 2026",
      "Wednesday, March 25, 2026",
    ]);
    expect(
      within(agenda)
        .getAllByRole("article")
        .map((event) => event.getAttribute("aria-label")),
    ).toStrictEqual([
      "Mercury Retrograde, ongoing",
      "Mars Conjunct Venus, 10:20 AM",
      "Sun Ingress Aries, 10:46 AM",
      "Venus Ingress Aries, 11:12 PM",
    ]);
  });

  it("renders only the agenda rows on screen", async () => {
    await renderRoute(`/?view=agenda&date=2026-03-10${UNGROUPED}`, {
      eventsDatabase: createTestEventsDatabase({
        extraSql: createBusyEventsSql("2026-03-10T14:00:00.000Z", 500),
      }),
    });

    const agenda = await screen.findByRole("region", { name: "Agenda" });
    const shown = within(agenda).getAllByRole("article");

    expect(shown[1]?.getAttribute("aria-label")).toBe("Busy Event 1, 10:00 AM");
    expect(shown.length).toBeGreaterThan(5);
    expect(shown.length).toBeLessThan(50);
  });

  it("opens a busy day's overflow as a windowed list", async () => {
    await renderRoute("/?date=2026-03-01", {
      eventsDatabase: createTestEventsDatabase({
        extraSql: createBusyEventsSql("2026-03-12T14:00:00.000Z", 400),
      }),
    });

    fireEvent.click(await screen.findByRole("button", { name: /more/u }));

    const list = await screen.findByRole("region", {
      name: "Events on Thursday, March 12, 2026",
    });
    const shown = within(list).getAllByRole("article");

    expect(shown[0]?.getAttribute("aria-label")).toBe(
      "Mercury Retrograde, ongoing",
    );
    expect(shown[1]?.getAttribute("aria-label")).toBe("Busy Event 1, 10:00 AM");
    expect(shown.length).toBeLessThan(50);
  });

  it("opens on the agenda on a phone and on the month wider", async () => {
    setViewportWidth(375);
    await renderRoute("/?date=2026-03-04");

    await expect(
      screen.findByRole("region", { name: "Agenda" }),
    ).resolves.toBeDefined();

    act(() => {
      setViewportWidth(1280);
    });

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("region", { name: "Agenda" })).toBeNull();
  });

  it("keeps the view the link names whatever the width", async () => {
    setViewportWidth(375);
    await renderRoute("/?view=agenda&date=2026-03-04");

    await screen.findByRole("region", { name: "Agenda" });
    act(() => {
      setViewportWidth(1280);
    });

    expect(screen.getByRole("region", { name: "Agenda" })).toBeDefined();
    expect(screen.queryByRole("grid", { name: "March 2026" })).toBeNull();
  });

  it("picks a view from the toolbar's menu on a phone", async () => {
    setViewportWidth(375);
    await renderRoute("/?date=2026-03-04");

    fireEvent.click(
      within(await findToolbar()).getByRole("button", {
        name: "View: Agenda",
      }),
    );
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Month" }),
    );

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it.each([
    { end: "2026-04-16", link: "month&date=2026-03-04", start: "2026-02-21" },
    { end: "2026-03-09", link: "week&date=2026-03-04", start: "2026-02-28" },
    {
      end: "2026-03-08",
      link: "three-day&date=2026-03-04",
      start: "2026-03-03",
    },
    { end: "2026-03-06", link: "day&date=2026-03-04", start: "2026-03-03" },
    { end: "2026-04-04", link: "agenda&date=2026-03-04", start: "2026-03-03" },
    {
      end: "2026-06-03",
      link: "agenda&date=2026-03-04&days=90",
      start: "2026-03-03",
    },
  ])("reads only the days the $link view shows", async (expected) => {
    const { database, queries } = createRecordingEventsDatabase();

    await renderRoute(`/?view=${expected.link}`, { eventsDatabase: database });

    expect(queries.map(({ window }) => window)).toStrictEqual([
      {
        end: new Date(`${expected.end}T00:00:00.000Z`),
        start: new Date(`${expected.start}T00:00:00.000Z`),
      },
    ]);
  });

  it("never reads more than a year of agenda at once", async () => {
    const { database, queries } = createRecordingEventsDatabase();

    await renderRoute("/?view=agenda&date=2026-03-04&days=2557", {
      eventsDatabase: database,
    });

    expect(queries[0]?.window.end).toStrictEqual(
      new Date("2026-04-04T00:00:00.000Z"),
    );
  });

  it("loads later events into the agenda on request", async () => {
    await renderRoute("/?view=agenda&date=2026-03-04");

    const agenda = await screen.findByRole("region", { name: "Agenda" });

    expect(
      within(agenda).queryByRole("article", { name: /^Mars Square Saturn/u }),
    ).toBeNull();

    fireEvent.click(
      within(agenda).getByRole("button", { name: "Show later events" }),
    );

    await expect(
      within(agenda).findByRole("article", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
    expect(
      within(agenda).getByRole("article", { name: /^Mars Conjunct Venus/u }),
    ).toBeDefined();
  });

  it("keeps the calendar on screen while a slow move reloads", async () => {
    const { database } = createRecordingEventsDatabase(600);

    await renderRoute("/?date=2026-03-01", { eventsDatabase: database });
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
    await expect(
      screen.findByRole("button", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
  });

  it("falls back to the month for a view it does not know", async () => {
    await renderRoute("/?view=year&date=2026-03-01");

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("loads later events into the agenda when scrolled to its end", async () => {
    await renderRoute(`/?view=agenda&date=2026-03-10${UNGROUPED}`, {
      eventsDatabase: createTestEventsDatabase({
        extraSql: createBusyEventsSql("2026-03-10T14:00:00.000Z", 60),
      }),
    });

    const agenda = await screen.findByRole("region", { name: "Agenda" });

    fireEvent.scroll(agenda, { target: { scrollTop: 100_000 } });

    await expect(
      within(agenda).findByRole("article", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
  });

  it("says which days hold no events in the view shown", async () => {
    await renderRoute("/?view=week&date=2026-05-06");

    await expect(
      screen.findByText("No events this week"),
    ).resolves.toBeDefined();
  });

  it("stops offering later events at a year", async () => {
    await renderRoute("/?view=agenda&date=2026-03-04&days=366");

    const agenda = await screen.findByRole("region", { name: "Agenda" });

    expect(
      within(agenda).getByRole("article", { name: /^Sun Ingress Cancer/u }),
    ).toBeDefined();
    expect(
      within(agenda).queryByRole("button", { name: "Show later events" }),
    ).toBeNull();
  });

  it("reads a window already seen only once", async () => {
    const { database, queries } = createRecordingEventsDatabase();

    await renderRoute("/?date=2026-03-04", { eventsDatabase: database });

    const toolbar = await findToolbar();

    fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));
    await screen.findByRole("button", { name: /^Mars Square Saturn/u });
    fireEvent.click(within(toolbar).getByRole("button", { name: /Previous/u }));
    await screen.findByRole("grid", { name: "March 2026" });

    expect(queries).toHaveLength(2);
  });

  it("scrolls a phone's week sideways under a sticky hour column", async () => {
    setViewportWidth(375);
    await renderRoute("/?view=week&date=2026-03-04");

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
    const { database } = createRecordingEventsDatabase(600);

    await renderRoute("/?date=2026-05-01", { eventsDatabase: database });
    await screen.findByText("No events this month");
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: /Previous/u }),
    );
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    expect(screen.queryByText("No events this month")).toBeNull();
    await expect(
      screen.findByRole("button", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
  });

  it("keeps extending the agenda each time it is scrolled to its end", async () => {
    const { database, queries } = createRecordingEventsDatabase();
    const busy = createTestEventsDatabase({
      extraSql: createBusyEventsSql("2026-03-10T14:00:00.000Z", 60),
    });

    await renderRoute(`/?view=agenda&date=2026-03-10${UNGROUPED}`, {
      eventsDatabase: {
        ...database,
        findEvents: async (query) => {
          await database.findEvents(query);

          return busy.findEvents(query);
        },
      },
    });

    const agenda = await screen.findByRole("region", { name: "Agenda" });

    for (const count of [2, 3, 4]) {
      fireEvent.scroll(agenda, { target: { scrollTop: 100_000 + count } });
      await waitFor(() => {
        expect(queries).toHaveLength(count);
      });
    }

    await expect(
      within(agenda).findByRole("article", { name: /^Sun Ingress Cancer/u }),
    ).resolves.toBeDefined();
  });
});
