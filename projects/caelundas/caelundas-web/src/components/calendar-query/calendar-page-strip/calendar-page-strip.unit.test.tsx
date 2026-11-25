import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
  UNPROVIDED_TABLE_GROUPS,
} from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { CalendarPageStrip } from "./calendar-page-strip";

import type { TableGroupsAction } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";

function renderStrip(
  state: Partial<typeof INITIAL_TABLE_GROUPS> = {},
  view: "table" | "timeline" = "table",
  stats?: { longest: number; shown: number; total: number },
): ReturnType<typeof vi.fn<(action: TableGroupsAction) => void>> {
  const dispatch = vi.fn<(action: TableGroupsAction) => void>();

  render(
    <TableGroupsContext
      value={{
        ...UNPROVIDED_TABLE_GROUPS,
        dispatch,
        provided: true,
        state: {
          ...INITIAL_TABLE_GROUPS,
          stats: stats ?? { longest: 100, shown: 25, total: 130 },
          ...state,
        },
      }}
    >
      <CalendarPageStrip view={view} />
    </TableGroupsContext>,
  );

  return dispatch;
}

describe(CalendarPageStrip, () => {
  it("flags each of its buttons as an item of one wrapping strip", () => {
    renderStrip();

    const strip = screen.getByRole("group", { name: "Page" });

    expect(Object.hasOwn(strip.dataset, "stripButtons")).toBe(true);
    expect(strip.className).toContain("flex-wrap");
    expect(strip.className).toContain("[&>[data-line-start]]:border-l!");
  });

  it("applies its class name", () => {
    render(
      <CalendarPageStrip
        className="calendar-page-strip"
        view="table"
      />,
    );

    expect(screen.getByTestId("calendar-page-strip").className).toBe(
      "calendar-page-strip",
    );
  });

  it("draws nothing outside the table, the only view with pages", () => {
    renderStrip({}, "timeline");

    expect(screen.queryByTestId("calendar-page-strip")).toBeNull();
  });

  it("says which events show: the first, how many, and out of how many", () => {
    renderStrip();

    expect(screen.getByText("1 to 25 of 130")).toBeDefined();
  });

  it("starts at 0 when no event shows, such as when every group is collapsed", () => {
    renderStrip({ stats: { longest: 100, shown: 0, total: 572 } });

    expect(screen.getByText("0 to 0 of 572")).toBeDefined();
  });

  it("has no arrow buttons stepping between pages", () => {
    renderStrip({ limit: 100 });

    for (const name of [
      "First page",
      "Previous page",
      "Next page",
      "Last page",
    ]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
  });

  it("keeps two or more buttons in the strip", () => {
    renderStrip();

    expect(
      screen.getByRole("group", { name: "Page" }).children.length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("shows the range as one button reading x to y of z, named after the Page", () => {
    renderStrip();

    const range = screen.getByRole("button", { name: "Page 1 to 25 of 130" });

    expect(range.textContent).toBe("1 to 25 of 130");
    expect(range.className).toBe(
      screen.getByRole("button", { name: "Page" }).className,
    );
  });

  it("opens the same Page menu from the range button", async () => {
    const dispatch = renderStrip();

    fireEvent.click(
      screen.getByRole("button", { name: "Page 1 to 25 of 130" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "500" }));

    expect(dispatch).toHaveBeenCalledWith({ limit: 500, type: "set-limit" });
  });

  it("loads more pages from the checkboxes in the Page menu", async () => {
    const dispatch = renderStrip({ limit: 100 }, "table", {
      longest: 300,
      shown: 100,
      total: 300,
    });

    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "Page 3" }));

    expect(dispatch).toHaveBeenCalledWith({ pages: 3, type: "set-pages" });
  });

  it("opens the page sizes and the pages, and changes the page size", async () => {
    const dispatch = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    fireEvent.click(await screen.findByRole("button", { name: "500" }));

    expect(dispatch).toHaveBeenCalledWith({ limit: 500, type: "set-limit" });
  });
});
