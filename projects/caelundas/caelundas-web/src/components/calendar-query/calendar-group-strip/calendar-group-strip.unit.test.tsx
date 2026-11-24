import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { CalendarGroupStrip } from "./calendar-group-strip";

import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Aspect / Major",
      },
    ],
  },
];

const TYPE: EventGroupLevel = { field: "tag:type" };

function renderStrip(grouping: EventGroupLevel[] = []): {
  onGroupingChange: ReturnType<
    typeof vi.fn<(grouping: EventGroupLevel[]) => void>
  >;
} {
  const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

  render(
    <CalendarGroupStrip
      facets={FACETS}
      grouping={grouping}
      onGroupingChange={onGroupingChange}
      view="timeline"
    />,
  );

  return { onGroupingChange };
}

describe(CalendarGroupStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarGroupStrip
        className="calendar-group-strip"
        facets={FACETS}
        grouping={[]}
        onGroupingChange={() => {}}
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-group-strip").className).toBe(
      "calendar-group-strip",
    );
  });

  it("draws one chip per level, in order, joined to the Group button", () => {
    renderStrip([TYPE]);

    const group = screen.getByRole("group", { name: "Group" });

    expect(group.textContent).toBe("GroupType");
  });

  it("labels a level that groups by a tag's children with the tag", () => {
    renderStrip([{ field: "tag:type", parent: "aspect" }]);

    expect(screen.getByRole("group", { name: "Group" }).textContent).toBe(
      "GroupType › Aspect",
    );
  });

  it("takes a level out from its ellipsis menu", async () => {
    const { onGroupingChange } = renderStrip([TYPE]);

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onGroupingChange).toHaveBeenCalledWith([]);
  });

  it("moves a level left or right from its menu", async () => {
    const other: EventGroupLevel = { field: "tag:other" };
    const { onGroupingChange } = renderStrip([TYPE, other]);

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onGroupingChange).toHaveBeenLastCalledWith([other, TYPE]);
  });

  it("moves a level left from its menu", async () => {
    const other: EventGroupLevel = { field: "tag:other" };
    const { onGroupingChange } = renderStrip([TYPE, other]);

    fireEvent.click(screen.getByRole("button", { name: "tag:other options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onGroupingChange).toHaveBeenLastCalledWith([other, TYPE]);
  });

  it("adds a level from the searchable list", async () => {
    const { onGroupingChange } = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByText("Type"));

    expect(onGroupingChange).toHaveBeenCalledWith([TYPE]);
  });

  it.each(["month", "week", "three-day", "day"] as const)(
    "draws nothing in the %s view, which has no groups",
    (view) => {
      render(
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[]}
          onGroupingChange={() => {}}
          view={view}
        />,
      );

      expect(screen.queryByTestId("calendar-group-strip")).toBeNull();
    },
  );

  it("puts Collapse all and Expand all in each chip's menu in the table, as the groups allow", async () => {
    const collapseAll = vi.fn();
    const expandAll = vi.fn();

    render(
      <TableGroupsContext
        value={{
          canCollapse: true,
          canExpand: true,
          collapseAll,
          dispatch: () => {},
          expandAll,
          provided: true,
          state: INITIAL_TABLE_GROUPS,
        }}
      >
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[TYPE]}
          onGroupingChange={() => {}}
          view="table"
        />
      </TableGroupsContext>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Collapse all" }),
    );

    expect(collapseAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Expand all" }),
    );

    expect(expandAll).toHaveBeenCalledTimes(1);
  });

  it("leaves them out of the menu outside the table", async () => {
    renderStrip([TYPE]);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    await screen.findByRole("menuitem", { name: "Remove" });

    expect(screen.queryByRole("menuitem", { name: "Collapse all" })).toBeNull();
  });
});
