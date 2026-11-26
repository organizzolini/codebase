import { describe, expect, it, vi } from "vitest";

import { INITIAL_TABLE_GROUPS } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import {
  createGroupItems,
  getCollapseHandlers,
  labelGroupLevel,
  toGrouping,
  toGroupingChange,
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
const BRANCHES = { flag: "isGroupable", leaves: false } as const;
const TYPE: EventGroupLevel = { field: "tag:type" };
const DAY: EventGroupLevel = { field: "day" };
const IN_ASPECT: EventGroupLevel = { field: "tag:type", parent: "aspect" };
const IN_MAJOR: EventGroupLevel = { field: "tag:type", parent: "major" };

describe("calendar-group-strip utilities", () => {
  describe(createGroupItems, () => {
    it("nests only the tags with tags beneath them, and leaves a derived field a leaf", () => {
      const items = createGroupItems(FIELDS, BRANCHES);
      const type = items[0]?.children?.find(
        (item) => item.value === "tag:type",
      );
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

    it("lists a branch under two parents once, so a level groups by it once", () => {
      const value = (
        id: string,
        depth: number,
        path: string,
      ): Parameters<
        typeof createEventGroupFields
      >[0][number]["values"][number] => ({
        count: 1,
        depth,
        id,
        name: path.split(" / ").at(-1) ?? path,
        path,
      });
      const shared = createEventGroupFields([
        {
          id: "body",
          name: "Body",
          values: [
            value("planet", 1, "Planet"),
            value("inner", 2, "Planet / Inner"),
            value("venus", 3, "Planet / Inner / Venus"),
            value("tradition", 1, "Tradition"),
            value("inner", 2, "Tradition / Inner"),
            value("venus", 3, "Tradition / Inner / Venus"),
          ],
        },
      ]);
      const [body] = createGroupItems(shared, BRANCHES)[0]?.children ?? [];

      expect(body?.children?.map((child) => child.value)).toStrictEqual([
        "planet",
        "tradition",
      ]);
      expect(
        body?.children?.[0]?.children?.map((child) => child.value),
      ).toStrictEqual(["inner"]);
      expect(body?.children?.[1]?.children).toBeUndefined();
    });

    it("describes a tag by its note and event count, and a bare one by its count", () => {
      const [item] = createGroupItems(FIELDS)[0]?.children ?? [];
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
      const [item] = createGroupItems(fields)[0]?.children ?? [];

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
      const [item] = createGroupItems(fields, BRANCHES)[0]?.children ?? [];

      expect(item?.children).toBeUndefined();
    });

    it("holds every tag root under a Tag row first, before the derived fields", () => {
      const items = createGroupItems(FIELDS);

      expect(items[0]?.label).toBe("Tag");
      expect(items[0]?.value).toBe("tag:*");
      expect(items[0]?.icon).toBeDefined();
      expect(items[0]?.children?.map((child) => child.value)).toStrictEqual([
        "tag:type",
      ]);
      expect(
        items.slice(1).every((item) => !item.value.startsWith("tag:")),
      ).toBe(true);
    });

    it("has no Tag row where there are no tag roots", () => {
      expect(
        createGroupItems(
          FIELDS.filter((field) => !field.id.startsWith("tag:")),
        ).some((item) => item.value === "tag:*"),
      ).toBe(false);
    });
  });

  describe(toGroupingChange, () => {
    it("is the default, no levels, when the Tag row is ticked anew", () => {
      expect(
        toGroupingChange(["tag:*", "day"], {
          fields: FIELDS,
          grouping: [DAY],
          isDefaultGrouping: false,
        }),
      ).toStrictEqual([]);
    });

    it("is the default again when every tag root, and nothing else, is ticked", () => {
      expect(
        toGroupingChange(["tag:type"], {
          fields: FIELDS,
          grouping: [DAY],
          isDefaultGrouping: false,
        }),
      ).toStrictEqual([]);
    });

    it("leaves the Tag row out when it stays ticked with the default", () => {
      expect(
        toGroupingChange(["tag:*", "tag:type", "day"], {
          fields: FIELDS,
          grouping: [TYPE],
          isDefaultGrouping: true,
        }),
      ).toStrictEqual([TYPE, DAY]);
    });
  });

  describe(toGroupValue, () => {
    it("also ticks the Tag row for the default", () => {
      expect(toGroupValue([TYPE], true)).toStrictEqual(["tag:*", "tag:type"]);
    });

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

    it("ticks the tags a level makes a group of each", () => {
      expect(
        toGroupValue([{ field: "tag:type", tags: ["ingress", "conjunct"] }]),
      ).toStrictEqual(["ingress", "conjunct"]);
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

    it("applies a tag ticked beside a root that comes before other fields' levels", () => {
      const levels = toGrouping(
        ["tag:type", "aspect", "day"],
        [TYPE, DAY],
        FIELDS,
      );

      expect(levels).toStrictEqual([TYPE, IN_ASPECT, DAY]);
    });

    it("reads ticked tags with none beneath them as one level of groups, in place of the root's own", () => {
      expect(
        toGrouping(["tag:type", "ingress", "conjunct"], [TYPE], FIELDS),
      ).toStrictEqual([{ field: "tag:type", tags: ["conjunct", "ingress"] }]);
    });

    it("gives a level of ticked tags the picks as they are now", () => {
      const before: EventGroupLevel = { field: "tag:type", tags: ["ingress"] };

      expect(toGrouping(["conjunct"], [before], FIELDS)).toStrictEqual([
        { field: "tag:type", tags: ["conjunct"] },
      ]);
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

    it("names a level of picked tags by the tags", () => {
      expect(
        labelGroupLevel(
          { field: "tag:type", tags: ["ingress", "conjunct"] },
          FIELDS,
        ),
      ).toBe("Type › Conjunct, Ingress");
      expect(
        labelGroupLevel({ field: "tag:type", tags: ["gone"] }, FIELDS),
      ).toBe("Type");
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
