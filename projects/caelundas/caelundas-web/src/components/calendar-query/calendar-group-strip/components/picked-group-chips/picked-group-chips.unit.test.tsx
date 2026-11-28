import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { PickedGroupChips } from "./picked-group-chips";

import type { TableGroupsValue } from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";

function renderChips(
  view: CalendarViewName,
  dispatch = vi.fn<TableGroupsValue["dispatch"]>(),
): typeof dispatch {
  const value: TableGroupsValue = {
    canCollapse: () => false,
    canExpand: () => false,
    collapseAll: () => {},
    dispatch,
    expandAll: () => {},
    provided: true,
    state: {
      ...INITIAL_TABLE_GROUPS,
      groupIds: ["/0:alpha", "/0:alpha/1:one"],
      picked: [
        { color: "rgb(1, 2, 3)", id: "/0:alpha", label: "Alpha" },
        { color: undefined, id: "/0:alpha/1:one", label: "One" },
        { color: undefined, id: "/0:gone", label: "Gone" },
      ],
    },
  };

  render(
    <TableGroupsContext value={value}>
      <PickedGroupChips view={view} />
    </TableGroupsContext>,
  );

  return dispatch;
}

describe(PickedGroupChips, () => {
  it("draws a chip for each group opened by name that the layout holds, in its color", () => {
    renderChips("charts");

    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("One")).toBeDefined();
    expect(screen.queryByText("Gone")).toBeNull();
    expect(screen.getByTestId("picked-group-swatch").style.background).toBe(
      "rgb(1, 2, 3)",
    );
  });

  it("closes the group from its chip's menu", async () => {
    const dispatch = renderChips("table");

    fireEvent.click(screen.getByRole("button", { name: "Alpha options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(dispatch).toHaveBeenCalledExactlyOnceWith({
      id: "/0:alpha",
      type: "toggle",
    });
  });

  it("draws none where there are no groups to open", () => {
    renderChips("month");

    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("closes every other group from a chip's Only", async () => {
    const dispatch = renderChips("table");

    fireEvent.click(screen.getByRole("button", { name: "Alpha options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(dispatch).toHaveBeenCalledExactlyOnceWith({
      id: "/0:alpha/1:one",
      type: "toggle",
    });
  });
});
