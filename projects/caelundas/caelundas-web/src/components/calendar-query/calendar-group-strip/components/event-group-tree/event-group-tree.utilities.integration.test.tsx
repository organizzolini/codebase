import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../../../testing/calendar/calendar-api";
import {
  BUILDER_WAIT,
  findToolbar,
  pickCalendarView,
} from "../../../../../../testing/calendar/calendar-page";
import { renderCalendarRoute } from "../../../../../../testing/render-route";

/**
 * The table's address for a day grouped by levels, with the grouping as a JSON search parameter.
 */
function groupedLink(date: string, grouping: unknown): string {
  return `/?view=table&date=${date}&group=${encodeURIComponent(JSON.stringify(grouping))}`;
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
  it("starts the table grouped by Tags unless told otherwise", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-04");

    await expect(readGrouping()).resolves.toBe("GroupTags");
  });

  it("starts the table with the tag roots as its first rows, then the tags beneath each", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-04");
    const api = readServedApi();

    await waitFor(() => {
      expect(
        api.requests.events
          .at(-1)
          ?.grouping?.levels?.map((level) => level.depth),
      ).toStrictEqual([undefined, 1, 2, 3]);
    });

    // The roots head the rows, and the first is open to the tags beneath it.
    await expect(
      screen.findByRole("button", { name: "Sign" }),
    ).resolves.toBeDefined();
    await expect(
      screen.findByRole("button", { name: "Simple" }),
    ).resolves.toBeDefined();
  });

  it("reads the events again with the grouping picked", async () => {
    await renderCalendarRoute(
      groupedLink("2026-03-04", [{ field: "tag:tag-aspect" }]),
    );
    const api = readServedApi();

    fireEvent.click(within(await openGroupBy()).getByText("Element"));

    await waitFor(() => {
      expect(api.requests.events.at(-1)?.grouping?.levels).toHaveLength(2);
    });

    expect(api.requests.events.at(-1)?.grouping?.levels?.[1]).toMatchObject({
      field: "tag:tag-element",
    });

    await waitFor(async () => {
      await expect(readGrouping()).resolves.toBe("GroupAspectElement");
    }, BUILDER_WAIT);
  });

  it("restores the grouping a link holds", async () => {
    await renderCalendarRoute(
      groupedLink("2026-03-04", [
        { field: "tag:tag-body" },
        { field: "tag:tag-aspect", parent: "tag-simple" },
      ]),
    );

    await expect(readGrouping()).resolves.toBe("GroupBodySimple");
  });

  it("returns to the Tags chip when the last level is removed from the link", async () => {
    await renderCalendarRoute(
      groupedLink("2026-03-04", [{ field: "tag:tag-aspect" }]),
    );

    fireEvent.click(
      await within(await findToolbar()).findByRole("button", {
        name: "Aspect options",
      }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(async () => {
      await expect(readGrouping()).resolves.toBe("GroupTags");
    }, BUILDER_WAIT);
  });

  it.each([
    { expected: "GroupTags", group: "not-a-grouping" },
    {
      expected: "GroupMonth",
      group: [{ field: "tag:tag-moon" }, { field: "month" }],
    },
    {
      expected: "GroupAspectMonth",
      group: [
        { depth: 0, field: "tag:tag-aspect" },
        { field: 7 },
        { field: "month" },
      ],
    },
    {
      expected: "GroupElementMonthBodyHour",
      group: [
        { field: "tag:tag-element" },
        { field: "month" },
        { field: "tag:tag-body" },
        { field: "hour" },
      ],
    },
  ])(
    "falls back quietly from a stale grouping to $expected",
    async ({ expected, group }) => {
      await renderCalendarRoute(
        `/?view=table&date=2026-03-04&group=${encodeURIComponent(JSON.stringify(group))}`,
      );

      await expect(readGrouping()).resolves.toBe(expected);
    },
  );

  it("carries the grouping from the table to the timeline", async () => {
    await renderCalendarRoute(groupedLink("2026-03-04", [{ field: "month" }]));

    await pickCalendarView("Timeline");

    await expect(
      screen.findByTestId("calendar-timeline"),
    ).resolves.toBeDefined();

    await expect(readGrouping()).resolves.toBe("GroupMonth");
  });

  it.each(["Charts", "Totals"])(
    "keeps a closed group closed through the %s layout and back to the table",
    async (layout) => {
      await renderCalendarRoute("/?view=table&date=2026-03-04");

      const simple = await screen.findByRole("button", { name: "Simple" });

      fireEvent.click(simple);
      await waitFor(() => {
        expect(simple.getAttribute("aria-expanded")).toBe("false");
      });

      await pickCalendarView(layout);
      await screen.findByTestId(`calendar-${layout.toLowerCase()}`);
      await pickCalendarView("Table");

      const back = await screen.findByRole("button", { name: "Simple" });

      expect(back.getAttribute("aria-expanded")).toBe("false");
    },
  );

  it("colors the month by the first group, shown as Tags", async () => {
    await renderCalendarRoute("/?view=month&date=2026-03-04");

    await expect(readGrouping()).resolves.toBe("GroupTags");
  });
});
