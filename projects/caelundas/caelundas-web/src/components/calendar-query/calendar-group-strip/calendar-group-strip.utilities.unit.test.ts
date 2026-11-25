import { describe, expect, it, vi } from "vitest";

import { INITIAL_TABLE_GROUPS } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import {
  createGroupItems,
  getCollapseHandlers,
  labelGroupLevel,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import { createEventGroupFields } from "./components/event-group-model/event-group-fields.utilities";

import type { TableGroupsValue } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";

const FIELDS = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      {
        count: 2,
        depth: 1,
        id: "aspect",
        name: "Aspect",
        note: "Two bodies",
        path: "Aspect",
      },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major Aspect",
        path: "Aspect / Major Aspect",
      },
      {
        count: 1,
        depth: 3,
        id: "conjunct",
        name: "Conjunct",
        path: "Aspect / Major Aspect / Conjunct",
      },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
]);
const TYPE: EventGroupLevel = { field: "tag:type" };
const DAY: EventGroupLevel = { field: "day" };
const IN_ASPECT: EventGroupLevel = { field: "tag:type", parent: "aspect" };
const IN_MAJOR: EventGroupLevel = { field: "tag:type", parent: "major" };

describe("calendar-group-strip utilities", () => {
  describe(createGroupItems, () => {
    it("nests only the tags with tags beneath them, and leaves a derived field a leaf", () => {
      const items = createGroupItems(FIELDS);
      const type = items.find((item) => item.value === "tag:type");
      const day = items.find((item) => item.value === "day");

      expect(type?.children?.map((child) => child.value)).toStrictEqual([
        "aspect",
      ]);
      expect(
        type?.children?.[0]?.children?.map((child) => child.value),
      ).toStrictEqual(["major"]);
      expect(day?.children).toBeUndefined();
      expect(day?.icon).toBeDefined();
    });

    it("describes a tag by its note and event count, and a bare one by its count", () => {
      const [item] = createGroupItems(FIELDS);
      const [aspect] = item?.children ?? [];

      expect(aspect?.description).toBe("Two bodies · 2 events");
      expect(aspect?.children?.[0]?.description).toBe("1 event");
    });

    it("draws a tag's icon beside its name", () => {
      const fields = createEventGroupFields([
        {
          icon: "orbit",
          id: "body",
          name: "Body",
          values: [
            {
              count: 1,
              depth: 1,
              icon: "sun",
              id: "star",
              name: "Star",
              path: "Star",
            },
            {
              count: 1,
              depth: 2,
              id: "sun",
              name: "Sun",
              path: "Star / Sun",
            },
          ],
        },
      ]);
      const [item] = createGroupItems(fields);

      expect(item?.icon).toBeDefined();
      expect(item?.children?.[0]?.icon).toBeDefined();
    });

    it("offers a root whose tags are all leaves with no children", () => {
      const fields = createEventGroupFields([
        {
          id: "body",
          name: "Body",
          values: [{ count: 1, depth: 1, id: "sun", name: "Sun", path: "Sun" }],
        },
      ]);
      const [item] = createGroupItems(fields);

      expect(item?.children).toBeUndefined();
    });
  });

  describe(toGroupValue, () => {
    it("ticks each level's tag, or its field when it groups by the root's own", () => {
      expect(toGroupValue([DAY, TYPE, IN_ASPECT])).toStrictEqual([
        "day",
        "tag:type",
        "aspect",
      ]);
    });

    it("ticks nothing for no grouping", () => {
      expect(toGroupValue([])).toStrictEqual([]);
    });
  });

  describe(toGrouping, () => {
    it("reads a ticked derived field, and drops one no longer ticked", () => {
      expect(toGrouping(["day"], [], FIELDS)).toStrictEqual([{ field: "day" }]);
      expect(toGrouping(["week"], [DAY], FIELDS)).toStrictEqual([
        { field: "week" },
      ]);
    });

    it("reads a tag root ticked alone as a level of its own children", () => {
      expect(toGrouping(["tag:type"], [], FIELDS)).toStrictEqual([TYPE]);
    });

    it("reads a ticked tag as a level of that tag's children", () => {
      expect(toGrouping(["aspect"], [], FIELDS)).toStrictEqual([IN_ASPECT]);
    });

    it("lets a field repeat one tag deeper, straight after itself", () => {
      expect(
        toGrouping(["tag:type", "aspect", "major"], [], FIELDS),
      ).toStrictEqual([TYPE, IN_ASPECT, IN_MAJOR]);
      expect(toGrouping(["aspect", "day"], [], FIELDS)).toStrictEqual([
        IN_ASPECT,
        DAY,
      ]);
      expect(toGrouping(["major", "aspect"], [], FIELDS)).toStrictEqual([
        IN_ASPECT,
        IN_MAJOR,
      ]);
    });

    it("keeps the levels already there in place and adds new ones after", () => {
      expect(toGrouping(["day", "aspect"], [DAY], FIELDS)).toStrictEqual([
        DAY,
        IN_ASPECT,
      ]);
      expect(
        toGrouping(["aspect", "day"], [DAY, IN_ASPECT], FIELDS),
      ).toStrictEqual([DAY, IN_ASPECT]);
    });

    it("drops what is no longer ticked, and puts no cap on the levels", () => {
      expect(toGrouping([], [DAY], FIELDS)).toStrictEqual([]);
      expect(
        toGrouping(["day", "week", "month", "year"], [], FIELDS),
      ).toHaveLength(4);
    });
  });

  describe(labelGroupLevel, () => {
    it("names a level by its field, then the tag it groups by the children of", () => {
      expect(labelGroupLevel(TYPE, FIELDS)).toBe("Type");
      expect(labelGroupLevel(IN_ASPECT, FIELDS)).toBe("Type › Aspect");
      expect(labelGroupLevel(IN_MAJOR, FIELDS)).toBe("Type › Major Aspect");
    });

    it("names a level by its id when the field is gone", () => {
      expect(labelGroupLevel({ field: "retired" }, FIELDS)).toBe("retired");
    });
  });

  describe(getCollapseHandlers, () => {
    it("acts on the levels given and no others", () => {
      const collapseAll = vi.fn();
      const handlers = getCollapseHandlers(
        "table",
        {
          canCollapse: (levels) => levels.includes(1),
          canExpand: () => false,
          collapseAll,
          dispatch: () => {},
          expandAll: () => {},
          provided: true,
          state: INITIAL_TABLE_GROUPS,
        },
        [1, 2],
      );

      handlers.onCollapseAll?.();

      expect(collapseAll).toHaveBeenCalledWith([1, 2], undefined);
    });

    const groups = (
      overrides: Partial<TableGroupsValue>,
    ): TableGroupsValue => ({
      canCollapse: () => false,
      canExpand: () => false,
      collapseAll: () => {},
      dispatch: () => {},
      expandAll: () => {},
      provided: true,
      state: INITIAL_TABLE_GROUPS,
      ...overrides,
    });

    it("offers Collapse all and Expand all in the Charts and Totals too", () => {
      for (const view of ["charts", "totals"] as const) {
        const handlers = getCollapseHandlers(
          view,
          groups({ canCollapse: () => true, canExpand: () => true }),
          [0],
        );

        expect(handlers.onCollapseAll).toBeDefined();
        expect(handlers.onExpandAll).toBeDefined();
      }
    });

    it("offers neither in the views of days", () => {
      const handlers = getCollapseHandlers(
        "week",
        groups({ canCollapse: () => true, canExpand: () => true }),
        [0],
      );

      expect(handlers.onCollapseAll).toBeUndefined();
      expect(handlers.onExpandAll).toBeUndefined();
    });

    it("offers only Collapse all while no group is collapsed", () => {
      const handlers = getCollapseHandlers(
        "table",
        groups({ canCollapse: () => true }),
        [0],
      );

      expect(handlers.onCollapseAll).toBeDefined();
      expect(handlers.onExpandAll).toBeUndefined();
    });

    it("offers only Expand all while every group is collapsed", () => {
      const handlers = getCollapseHandlers(
        "table",
        groups({ canExpand: () => true }),
        [0],
      );

      expect(handlers.onCollapseAll).toBeUndefined();
      expect(handlers.onExpandAll).toBeDefined();
    });

    it("offers both while the groups are mixed", () => {
      const handlers = getCollapseHandlers(
        "table",
        groups({ canCollapse: () => true, canExpand: () => true }),
        [0],
      );

      expect(handlers.onCollapseAll).toBeDefined();
      expect(handlers.onExpandAll).toBeDefined();
    });

    it("offers them in the timeline too", () => {
      const handlers = getCollapseHandlers(
        "timeline",
        groups({ canCollapse: () => true, canExpand: () => true }),
        [0],
      );

      expect(handlers.onCollapseAll).toBeDefined();
      expect(handlers.onExpandAll).toBeDefined();
    });

    it("judges the Charts and Totals by no group open until a group is opened or closed", () => {
      const canCollapse = vi.fn<(levels: readonly number[]) => boolean>();
      const expandAll = vi.fn();

      for (const view of ["charts", "totals"] as const) {
        const handlers = getCollapseHandlers(
          view,
          groups({ canCollapse, canExpand: () => true, expandAll }),
          [0],
        );

        handlers.onExpandAll?.();
      }

      expect(canCollapse).toHaveBeenCalledTimes(2);

      for (const call of [...canCollapse.mock.calls, ...expandAll.mock.calls]) {
        expect(call[1]).toStrictEqual(new Set());
      }
    });

    it("judges them by the groups open once one has been opened or closed", () => {
      const canCollapse = vi.fn<(levels: readonly number[]) => boolean>();

      getCollapseHandlers(
        "charts",
        groups({
          canCollapse,
          state: { ...INITIAL_TABLE_GROUPS, touched: true },
        }),
        [0],
      );

      expect(canCollapse).toHaveBeenCalledWith([0], undefined);
    });

    it("offers neither where there are no rows to close", () => {
      expect(
        getCollapseHandlers(
          "month",
          groups({ canCollapse: () => true, canExpand: () => true }),
          [0],
        ),
      ).toStrictEqual({ onCollapseAll: undefined, onExpandAll: undefined });
    });
  });
});
