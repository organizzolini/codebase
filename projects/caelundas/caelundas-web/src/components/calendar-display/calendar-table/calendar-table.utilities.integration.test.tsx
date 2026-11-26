import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { findToolbar } from "../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";

// Tested through the `/` route, as the page uses it; each test needs seconds on a loaded runner.
vi.setConfig({ testTimeout: 30_000 });

/**
 * The names of the events the table lists, in order.
 */
async function readEventNames(): Promise<string[]> {
  await screen.findAllByTestId("table-event-row");

  return screen.getAllByTestId("table-event-row").map((row) => row.textContent);
}

/**
 * The table's address for the seeded March, one group, a duration column, and the sorts as a JSON search parameter.
 */
function tableLink(sort: unknown, columns = ["name", "duration"]): string {
  const group = encodeURIComponent(JSON.stringify([{ field: "year" }]));

  return `/?view=table&date=2026-03-01&days=30&group=${group}&columns=${encodeURIComponent(JSON.stringify(columns))}&sort=${encodeURIComponent(JSON.stringify(sort))}`;
}

describe("table sorts by its columns", () => {
  it("shows a duration for each event, and Instant for one that lasts no time", async () => {
    await renderCalendarRoute(tableLink([{ direction: "asc", key: "name" }]));

    const names = await readEventNames();

    expect(names.some((name) => name.includes("Instant"))).toBe(true);
    expect(
      names.find((name) => name.includes("Mercury Retrograde")),
    ).not.toContain("Instant");
  });

  it("orders the events inside a group by duration, longest first when descending", async () => {
    await renderCalendarRoute(
      tableLink([{ direction: "desc", key: "duration" }]),
    );

    const names = await readEventNames();

    expect(names[0]).toContain("Mercury Retrograde");
  });

  it("orders the events inside a group by duration, longest last when ascending", async () => {
    await renderCalendarRoute(
      tableLink([{ direction: "asc", key: "duration" }]),
    );

    const names = await readEventNames();

    expect(names.at(-1)).toContain("Mercury Retrograde");
  });

  it("offers a sort by Duration only while the Duration column is selected", async () => {
    await renderCalendarRoute(
      tableLink([{ direction: "asc", key: "name" }], ["name"]),
    );
    await readEventNames();

    const strip = await within(await findToolbar()).findByRole("group", {
      name: "Sort",
    });

    fireEvent.click(within(strip).getByRole("button", { name: "Sort" }));

    await waitFor(() => {
      expect(screen.getByRole("treeitem", { name: /Name/u })).toBeDefined();
    });

    expect(screen.queryByRole("treeitem", { name: /Duration/u })).toBeNull();
  });
});
