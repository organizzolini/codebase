import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { findToolbar } from "../../../testing/calendar-page";
import { createRecordingEventsDatabase } from "../../../testing/events-database";
import { renderRoute } from "../../../testing/render-route";

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
 * The calendar's address for the agenda from a day grouped by levels,
 * written the way the router writes a search parameter that holds a list.
 */
function groupedAgendaLink(date: string, grouping: unknown): string {
  return `/?view=agenda&date=${date}&group=${encodeURIComponent(JSON.stringify(grouping))}`;
}

/**
 * Opens the toolbar's Group by popover.
 */
async function openGroupBy(): Promise<HTMLElement> {
  fireEvent.click(
    within(await findToolbar()).getByRole("button", { name: /^Group by/u }),
  );

  return screen.findByRole("dialog", { name: "Group by" });
}

// Grouping is tested through the `/` route, the way the page uses it; it
// lives apart from the route's own tests only to keep each file short.
describe("event grouping", () => {
  it("groups the agenda by type unless told otherwise", async () => {
    await renderRoute("/?view=agenda&date=2026-03-04");

    expect(
      within(await findToolbar()).getByRole("button", {
        name: "Group by: Type",
      }),
    ).toBeDefined();
  });

  it("reads the events again with the grouping picked", async () => {
    const { database, queries } = createRecordingEventsDatabase();

    await renderRoute("/?view=agenda&date=2026-03-04", {
      eventsDatabase: database,
    });
    fireEvent.click(
      within(await openGroupBy()).getByRole("button", {
        name: "Add sub-group",
      }),
    );

    await waitFor(() => {
      expect(queries.at(-1)?.groups).toHaveLength(2);
    });

    expect(queries.at(-1)?.groups?.[1]?.parameters).toStrictEqual([
      "tag-element",
      1,
      1,
    ]);
    expect(
      within(await findToolbar()).getByRole("button", {
        name: "Group by: Type, Element",
      }),
    ).toBeDefined();
  });

  it("sections the agenda by type, counting each group's events", async () => {
    await renderRoute("/?view=agenda&date=2026-03-04");

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
    await renderRoute(
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
        { name: /^Mars Conjunct Venus/u },
      ),
    ).toHaveLength(2);
  });

  it("groups by a period, in time order", async () => {
    await renderRoute(groupedAgendaLink("2026-03-04", [{ field: "weekday" }]));

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "Wednesday 2 events",
      "Thursday 1 event",
      "Friday 1 event",
    ]);
  });

  it("restores the grouping a link holds", async () => {
    await renderRoute(
      groupedAgendaLink("2026-03-04", [
        { depth: 1, field: "tag:tag-planet" },
        { depth: 2, field: "tag:tag-type" },
      ]),
    );

    const popover = await openGroupBy();

    expect(
      within(popover).getByRole<HTMLSelectElement>("combobox", {
        name: "Group 1 by",
      }).value,
    ).toBe("tag:tag-planet");
    expect(
      within(popover).getByRole<HTMLSelectElement>("combobox", {
        name: "Group 2 depth",
      }).value,
    ).toBe("2");
    await expect(findAgendaHeadings(4)).resolves.toContain(
      "Major Aspect 1 event",
    );
  });

  it("keeps the grouping picked in the link", async () => {
    await renderRoute("/?view=agenda&date=2026-03-04");

    fireEvent.change(
      within(await openGroupBy()).getByRole("combobox", {
        name: "Group 1 by",
      }),
      { target: { value: "month" } },
    );

    await expect(findAgendaHeadings(3)).resolves.toStrictEqual([
      "February 2026 1 event",
      "March 2026 3 events",
    ]);

    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Group by" })).getByRole(
        "button",
        { name: "Remove group 1" },
      ),
    );

    await expect(
      within(await findToolbar()).findByRole("button", {
        name: "Group by: none",
      }),
    ).resolves.toBeDefined();
  });

  it.each([
    { expected: "Group by: Type", group: "not-a-grouping" },
    {
      expected: "Group by: Month",
      group: [{ field: "tag:tag-moon" }, { field: "month" }],
    },
    {
      expected: "Group by: Type, Month",
      group: [
        { depth: 0, field: "tag:tag-type" },
        { field: 7 },
        { field: "month" },
      ],
    },
    {
      expected: "Group by: Element, Month, Planet",
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
      await renderRoute(
        `/?view=agenda&date=2026-03-04&group=${encodeURIComponent(JSON.stringify(group))}`,
      );

      await expect(
        within(await findToolbar()).findByRole("button", { name: expected }),
      ).resolves.toBeDefined();
    },
  );

  it("carries the grouping from the agenda to the timeline", async () => {
    await renderRoute(groupedAgendaLink("2026-03-04", [{ field: "month" }]));

    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Timeline" }),
    );

    await expect(
      screen.findByTestId("calendar-timeline"),
    ).resolves.toBeDefined();
    expect(
      within(await findToolbar()).getByRole("button", {
        name: "Group by: Month",
      }),
    ).toBeDefined();
  });

  it("offers grouping only in the views that group", async () => {
    await renderRoute("/?view=month&date=2026-03-04");

    expect(
      within(await findToolbar()).queryByRole("button", { name: /^Group by/u }),
    ).toBeNull();
  });
});
