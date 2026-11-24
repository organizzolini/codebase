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
          stats: { longest: 100, shown: 25, total: 130 },
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

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("to 25")).toBeDefined();
    expect(screen.getByText("of 130")).toBeDefined();
  });

  it("starts at 0 when no event shows, such as when every group is collapsed", () => {
    renderStrip({ stats: { longest: 100, shown: 0, total: 572 } });

    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("to 0")).toBeDefined();
    expect(screen.getByText("of 572")).toBeDefined();
  });

  it("disables stepping back on the first page, and steps forward and to the last", () => {
    const dispatch = renderStrip();

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "First page" })
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Previous page",
      }).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      pages: 2,
      type: "set-pages",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      pages: 4,
      type: "set-pages",
    });
  });

  it("disables stepping forward on the last page, and steps back and to the first", () => {
    const dispatch = renderStrip({ pages: 4 });

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Next page" })
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Last page" })
        .disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "First page" }));

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      pages: 3,
      type: "set-pages",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      pages: 1,
      type: "set-pages",
    });
  });

  it("opens the page sizes and the pages, and changes the page size", async () => {
    const dispatch = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    fireEvent.click(await screen.findByRole("button", { name: "50" }));

    expect(dispatch).toHaveBeenCalledWith({ limit: 50, type: "set-limit" });
  });
});
