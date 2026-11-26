import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { CalendarGroupStrip } from "./calendar-group-strip";

import type { TableGroupsValue } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";
import type { StripFold } from "./components/strip-fold-button/strip-fold-button.types";

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

function renderStrip(
  grouping: EventGroupLevel[] = [],
  isDefaultGrouping = false,
  view: CalendarViewName = "timeline",
): {
  onGroupingChange: ReturnType<
    typeof vi.fn<(grouping: EventGroupLevel[]) => void>
  >;
} {
  const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

  render(
    <CalendarGroupStrip
      facets={FACETS}
      grouping={grouping}
      isDefaultGrouping={isDefaultGrouping}
      onGroupingChange={onGroupingChange}
      view={view}
    />,
  );

  return { onGroupingChange };
}

describe(CalendarGroupStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("flags each of its buttons as an item of one wrapping strip", () => {
    renderStrip();

    const strip = screen.getByRole("group", { name: "Group" });

    expect(Object.hasOwn(strip.dataset, "stripButtons")).toBe(true);
    expect(strip.className).toContain("flex-wrap");
    expect(strip.className).toContain("[&>[data-line-start]]:border-l!");
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

  it("draws one Tags chip while the link names no grouping", () => {
    renderStrip([], true);

    expect(screen.getByRole("group", { name: "Group" }).textContent).toBe(
      "GroupTags",
    );
  });

  it.each(["month", "week", "day", "table", "timeline"] as const)(
    "draws the one Tags chip on the %s too",
    (view) => {
      renderStrip([], true, view);

      expect(screen.getByRole("group", { name: "Group" }).textContent).toBe(
        "GroupTags",
      );
    },
  );

  it("cannot remove the Tags chip, so some grouping always stays", async () => {
    const { onGroupingChange } = renderStrip([], true);

    fireEvent.click(screen.getByRole("button", { name: "Tags options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(
      screen
        .getByRole("menuitem", { name: "Remove" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(onGroupingChange).not.toHaveBeenCalled();
  });

  it("draws one chip per level, in order, joined to the Group button", () => {
    renderStrip([TYPE]);

    const group = screen.getByRole("group", { name: "Group" });

    expect(group.textContent).toBe("GroupType");
  });

  it("labels a level that groups by a tag's children with the tag's own name", () => {
    renderStrip([{ field: "tag:type", parent: "aspect" }]);

    expect(screen.getByRole("group", { name: "Group" }).textContent).toBe(
      "GroupAspect",
    );
    expect(screen.getByTitle("Type › Aspect")).toBeDefined();
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

  it("returns to the default when the list ticks every tag root, here the only one", async () => {
    const { onGroupingChange } = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByText("Type"));

    expect(onGroupingChange).toHaveBeenCalledWith([]);
  });

  it("holds the tag roots under a Tag row, open from the start, whose tick is the default", async () => {
    const { onGroupingChange } = renderStrip([{ field: "day" }]);

    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByText("Tag"));

    expect(screen.getByText("Type")).toBeDefined();
    expect(onGroupingChange).toHaveBeenCalledWith([]);
  });

  it.each(["month", "week", "day"] as const)(
    "draws in the %s view too, saying it colors events by the first group",
    (view) => {
      render(
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[]}
          onGroupingChange={() => {}}
          view={view}
        />,
      );

      expect(screen.queryByTestId("calendar-group-strip")).not.toBeNull();
      expect(
        screen.getAllByTitle("Colors events by the first group").length,
      ).toBeGreaterThan(0);
    },
  );

  it.each(["table", "timeline"] as const)(
    "puts Collapse all and Expand all in each chip's menu in the %s, as the groups allow",
    async (view) => {
      const collapseAll = vi.fn();
      const expandAll = vi.fn();

      render(
        <TableGroupsContext
          value={{
            canCollapse: () => true,
            canExpand: () => true,
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
            view={view}
          />
        </TableGroupsContext>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Type options" }));
      fireEvent.click(
        await screen.findByRole("menuitem", { name: "Collapse all" }),
      );

      expect(collapseAll).toHaveBeenCalledWith([0], undefined);

      fireEvent.click(screen.getByRole("button", { name: "Type options" }));
      fireEvent.click(
        await screen.findByRole("menuitem", { name: "Expand all" }),
      );

      expect(expandAll).toHaveBeenCalledWith([0], undefined);
    },
  );

  it("reads the Charts' open groups as none until one is toggled, so its chips offer only Expand all", async () => {
    render(
      <TableGroupsContext
        value={{
          // The state holds the table's lazy first path, which the chart does not draw.
          canCollapse: (_levels, base) => (base ?? new Set(["a"])).size > 0,
          canExpand: () => true,
          collapseAll: () => {},
          dispatch: () => {},
          expandAll: () => {},
          provided: true,
          state: { ...INITIAL_TABLE_GROUPS, expanded: new Set(["a"]) },
        }}
      >
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[TYPE]}
          onGroupingChange={() => {}}
          view="charts"
        />
      </TableGroupsContext>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    await screen.findByRole("menuitem", { name: "Expand all" });

    expect(screen.queryByRole("menuitem", { name: "Collapse all" })).toBeNull();
  });

  it("lists the groups opened by name after the levels, closing one from its chip", async () => {
    const dispatch = vi.fn();

    render(
      <TableGroupsContext
        value={{
          canCollapse: () => false,
          canExpand: () => false,
          collapseAll: () => {},
          dispatch,
          expandAll: () => {},
          provided: true,
          state: {
            ...INITIAL_TABLE_GROUPS,
            groupIds: ["/0:alpha"],
            picked: [{ color: "red", id: "/0:alpha", label: "Alpha" }],
          },
        }}
      >
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[TYPE]}
          onGroupingChange={() => {}}
          view="charts"
        />
      </TableGroupsContext>,
    );

    expect(screen.getByText("Alpha")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Alpha options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(dispatch).toHaveBeenCalledWith({ id: "/0:alpha", type: "toggle" });
  });

  it("leaves them out of the menu when no groups are registered", async () => {
    renderStrip([TYPE]);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    await screen.findByRole("menuitem", { name: "Remove" });

    expect(screen.queryByRole("menuitem", { name: "Collapse all" })).toBeNull();
  });

  describe("folding", () => {
    const YEAR: EventGroupLevel = { field: "year" };

    function renderFolded(
      isFolded: boolean,
      grouping: EventGroupLevel[] = [TYPE, YEAR],
      isDefaultGrouping = false,
    ): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      render(
        <CalendarGroupStrip
          facets={FACETS}
          fold={fold}
          grouping={grouping}
          isDefaultGrouping={isDefaultGrouping}
          onGroupingChange={() => {}}
          view="timeline"
        />,
      );

      return fold;
    }

    it("shows the Group button and a count of its chips, and unfolds when it is pressed", () => {
      const fold = renderFolded(true);
      const strip = screen.getByRole("group", { name: "Group" });

      expect(strip.querySelectorAll("button")).toHaveLength(2);
      expect(screen.queryByRole("button", { name: "Type options" })).toBeNull();

      const count = screen.getByRole("button", { name: /2 Facets/u });

      expect(count.title).toBe("Type, Year");

      fireEvent.click(count);

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("counts the one Tags chip of the default grouping, and the groups picked in the layout", () => {
      renderFolded(true, [], true);

      expect(screen.getByRole("button", { name: /1 Facet,/u }).title).toBe(
        "Tags",
      );
    });

    it("counts the groups picked in the layout among the chips", () => {
      render(
        <TableGroupsContext
          value={{
            canCollapse: () => false,
            canExpand: () => false,
            collapseAll: () => {},
            dispatch: vi.fn<TableGroupsValue["dispatch"]>(),
            expandAll: () => {},
            provided: true,
            state: {
              ...INITIAL_TABLE_GROUPS,
              groupIds: ["/0:alpha"],
              picked: [{ color: "red", id: "/0:alpha", label: "Alpha" }],
            },
          }}
        >
          <CalendarGroupStrip
            facets={FACETS}
            fold={{
              isFolded: true,
              onFold: () => {},
              onUnfold: () => {},
            }}
            grouping={[TYPE]}
            onGroupingChange={() => {}}
            view="charts"
          />
        </TableGroupsContext>,
      );

      expect(screen.getByRole("button", { name: /2 Facets/u }).title).toBe(
        "Type, Alpha",
      );
    });

    it("folds from a chip's menu while it is unfolded", async () => {
      const fold = renderFolded(false);

      expect(screen.queryByTestId("strip-fold-button")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "Year options" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

      expect(fold.onFold).toHaveBeenCalledTimes(1);
    });

    it("never folds without a fold", () => {
      renderStrip([TYPE, YEAR]);

      expect(screen.queryByTestId("strip-fold-button")).toBeNull();
    });
  });
});
