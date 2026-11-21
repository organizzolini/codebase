import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../../../testing/calendar-api";
import {
  findToolbar,
  pickCalendarView,
} from "../../../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../../../testing/render-route";

/**
 * The agenda's headings at one level, as they read.
 */
async function findAgendaHeadings(level: number): Promise<string[]> {
  const agenda = await screen.findByRole("region", { name: "Agenda" });

  return within(agenda)
    .getAllByRole("heading", { level })
    .map((heading) => heading.textContent);
}

/**
 * The agenda's address for a day grouped by levels, with the grouping as a JSON search parameter.
 */
function groupedAgendaLink(date: string, grouping: unknown): string {
  return `/?view=agenda&date=${date}&group=${encodeURIComponent(JSON.stringify(grouping))}`;
}

/**
 * Opens the Group menu, a nested checklist of what to group by.
 */
async function openGroupBy(): Promise<HTMLElement> {
  fireEvent.click(
    within(
      await within(await findToolbar()).findByRole("group", { name: "Group" }),
    ).getByRole("button", { name: "Group" }),
  );

  return screen.findByTestId("query-cascader");
}

/**
 * The Group strip's text: its button, then one chip per level of the grouping.
 */
async function readGrouping(): Promise<string> {
  const strip = await within(await findToolbar()).findByRole("group", {
    name: "Group",
  });

  return strip.textContent;
}

// Tested through the `/` route, as the page uses it; each test needs over 5 seconds on a loaded CI runner.
vi.setConfig({ testTimeout: 30_000 });

describe("event grouping", () => {
  it("groups the agenda by type unless told otherwise", async () => {
    await renderCalendarRoute("/?view=agenda&date=2026-03-04");

    await expect(readGrouping()).resolves.toBe("GroupType");
  });

  it("reads the events again with the grouping picked", async () => {
    await renderCalendarRoute("/?view=agenda&date=2026-03-04");
    const api = readServedApi();

    fireEvent.click(within(await openGroupBy()).getByText("Element"));

    await waitFor(() => {
      expect(api.requests.events.at(-1)?.grouping?.levels).toHaveLength(2);
    });

    expect(api.requests.events.at(-1)?.grouping?.levels?.[1]).toStrictEqual({
      depth: 1,
      field: "tag:tag-element",
    });

    await waitFor(async () => {
      await expect(readGrouping()).resolves.toBe("GroupTypeElement");
    });
  });

  it("sections the agenda by type, counting each group's events", async () => {
    await renderCalendarRoute("/?view=agenda&date=2026-03-04");

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "Aspect 1 event",
      "Ingress 2 events",
      "Retrograde 1 event",
    ]);
    await expect(findAgendaHeadings(4)).resolves.toContain(
      "Friday, March 20, 2026",
    );
  });

  it("lists a two-planet event under each planet but counts it once", async () => {
    await renderCalendarRoute(
      groupedAgendaLink("2026-03-04", [
        { depth: 1, field: "tag:tag-type" },
        { depth: 1, field: "tag:tag-planet" },
      ]),
    );

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "Aspect 1 event",
      "Ingress 2 events",
      "Retrograde 1 event",
    ]);
    await expect(findAgendaHeadings(4)).resolves.toStrictEqual([
      "Mars 1 event",
      "Venus 1 event",
      "Sun 1 event",
      "Venus 1 event",
      "Mercury 1 event",
    ]);
    expect(
      within(screen.getByRole("region", { name: "Agenda" })).getAllByRole(
        "article",
        {
          name: /^Mars Conjunct Venus/u,
        },
      ),
    ).toHaveLength(2);
  });

  it("groups by a period, in time order", async () => {
    await renderCalendarRoute(
      groupedAgendaLink("2026-03-04", [{ field: "weekday" }]),
    );

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "Wednesday 2 events",
      "Thursday 1 event",
      "Friday 1 event",
    ]);
  });

  it("restores the grouping a link holds", async () => {
    await renderCalendarRoute(
      groupedAgendaLink("2026-03-04", [
        { depth: 1, field: "tag:tag-planet" },
        { depth: 2, field: "tag:tag-type" },
      ]),
    );

    await expect(readGrouping()).resolves.toBe("GroupPlanetType");
    await expect(findAgendaHeadings(4)).resolves.toContain(
      "Major Aspect 1 event",
    );
  });

  it("keeps the grouping picked in the link", async () => {
    await renderCalendarRoute("/?view=agenda&date=2026-03-04");

    fireEvent.click(
      within(await findToolbar()).getByRole("button", {
        name: "Stop grouping by Type",
      }),
    );
    fireEvent.click(within(await openGroupBy()).getByText("Month"));

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "February 2026 1 event",
      "March 2026 3 events",
    ]);

    fireEvent.click(
      within(await findToolbar()).getByRole("button", {
        name: "Stop grouping by Month",
      }),
    );

    await waitFor(async () => {
      await expect(readGrouping()).resolves.toBe("Group");
    });
  });

  it.each([
    { expected: "GroupType", group: "not-a-grouping" },
    {
      expected: "GroupMonth",
      group: [{ field: "tag:tag-moon" }, { field: "month" }],
    },
    {
      expected: "GroupTypeMonth",
      group: [
        { depth: 0, field: "tag:tag-type" },
        { field: 7 },
        { field: "month" },
      ],
    },
    {
      expected: "GroupElementMonthPlanet",
      group: [
        { field: "tag:tag-element" },
        { field: "month" },
        { field: "tag:tag-planet" },
        { field: "hour" },
      ],
    },
  ])(
    "falls back quietly from a stale grouping to $expected",
    async ({ expected, group }) => {
      await renderCalendarRoute(
        `/?view=agenda&date=2026-03-04&group=${encodeURIComponent(JSON.stringify(group))}`,
      );

      await expect(readGrouping()).resolves.toBe(expected);
    },
  );

  it("carries the grouping from the agenda to the timeline", async () => {
    await renderCalendarRoute(
      groupedAgendaLink("2026-03-04", [{ field: "month" }]),
    );

    await pickCalendarView("Timeline");

    await expect(
      screen.findByTestId("calendar-timeline"),
    ).resolves.toBeDefined();

    await expect(readGrouping()).resolves.toBe("GroupMonth");
  });

  it("offers grouping only in the views that group", async () => {
    await renderCalendarRoute("/?view=month&date=2026-03-04");

    await findToolbar();

    expect(
      within(await findToolbar()).queryByRole("group", { name: "Group" }),
    ).toBeNull();
  });
});
