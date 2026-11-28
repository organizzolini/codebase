import { describe, expect, it } from "vitest";

import { INITIAL_TABLE_GROUPS } from "./table-groups-provider.constants";
import {
  areSameIds,
  getCollapseActions,
  reduceTableGroups,
} from "./table-groups-provider.utilities";

import type { TableGroupsState } from "./table-groups-provider.types";

describe("table-groups-provider utilities", () => {
  describe(areSameIds, () => {
    it("is true for the same ids in the same order", () => {
      expect(areSameIds(["a", "b"], ["a", "b"])).toBe(true);
      expect(areSameIds([], [])).toBe(true);
    });

    it("is false for other ids, another order, or another length", () => {
      expect(areSameIds(["a", "b"], ["b", "a"])).toBe(false);
      expect(areSameIds(["a"], ["a", "b"])).toBe(false);
      expect(areSameIds(["a"], ["c"])).toBe(false);
    });
  });

  describe(getCollapseActions, () => {
    const groups = {
      groupIds: ["a", "b", "c"],
      groupLevels: [0, 1, 1],
    };
    const both = [0, 1];

    it("offers only opening when no group is open", () => {
      expect(
        getCollapseActions({ ...groups, expanded: new Set() }, both),
      ).toStrictEqual({ canCollapse: false, canExpand: true });
    });

    it("offers only closing when every group is open", () => {
      expect(
        getCollapseActions(
          { ...groups, expanded: new Set(groups.groupIds) },
          both,
        ),
      ).toStrictEqual({ canCollapse: true, canExpand: false });
    });

    it("offers both when the groups are mixed", () => {
      expect(
        getCollapseActions({ ...groups, expanded: new Set(["b"]) }, both),
      ).toStrictEqual({ canCollapse: true, canExpand: true });
    });

    it("offers neither when there are no groups", () => {
      expect(
        getCollapseActions(
          { expanded: new Set(), groupIds: [], groupLevels: [] },
          both,
        ),
      ).toStrictEqual({ canCollapse: false, canExpand: false });
    });

    it("ignores an open id that is no group", () => {
      expect(
        getCollapseActions({ ...groups, expanded: new Set(["gone"]) }, both),
      ).toStrictEqual({ canCollapse: false, canExpand: true });
    });

    it("judges only the groups at the levels given", () => {
      const expanded = new Set(["a"]);

      expect(getCollapseActions({ ...groups, expanded }, [0])).toStrictEqual({
        canCollapse: true,
        canExpand: false,
      });
      expect(getCollapseActions({ ...groups, expanded }, [1])).toStrictEqual({
        canCollapse: false,
        canExpand: true,
      });
    });
  });

  describe(reduceTableGroups, () => {
    const state: TableGroupsState = {
      ...INITIAL_TABLE_GROUPS,
      groupIds: ["a", "b"],
      groupLevels: [0, 1],
    };

    it("opens every group of the levels, and closes them all", () => {
      const open = reduceTableGroups(state, {
        levels: [0, 1],
        type: "expand-all",
      });

      expect([...open.expanded]).toStrictEqual(["a", "b"]);
      expect(
        reduceTableGroups(open, { levels: [0, 1], type: "collapse-all" })
          .expanded.size,
      ).toBe(0);
    });

    it("leaves the groups of other levels as they are", () => {
      const open = reduceTableGroups(state, {
        levels: [1],
        type: "expand-all",
      });

      expect([...open.expanded]).toStrictEqual(["b"]);

      const both = reduceTableGroups(open, {
        levels: [0],
        type: "expand-all",
      });

      expect([...both.expanded].toSorted()).toStrictEqual(["a", "b"]);
      expect([
        ...reduceTableGroups(both, { levels: [0], type: "collapse-all" })
          .expanded,
      ]).toStrictEqual(["b"]);
    });

    it("opens a closed group, and closes an open one", () => {
      const open = reduceTableGroups(state, { id: "a", type: "toggle" });

      expect([...open.expanded]).toStrictEqual(["a"]);
      expect(
        reduceTableGroups(open, { id: "a", type: "toggle" }).expanded.size,
      ).toBe(0);
    });

    it("toggles on the groups a layout shows when it hands them over", () => {
      const open = reduceTableGroups(
        { ...state, expanded: new Set(["a", "b"]) },
        { base: new Set(), id: "a", type: "toggle" },
      );

      expect([...open.expanded]).toStrictEqual(["a"]);
    });

    it("opens or closes the levels over the groups a layout shows when it hands them over", () => {
      const lazy = { ...state, expanded: new Set(["a", "b"]) };
      const base = new Set<string>();
      const open = reduceTableGroups(lazy, {
        base,
        levels: [0],
        type: "expand-all",
      });

      expect([...open.expanded]).toStrictEqual(["a"]);
      expect(
        reduceTableGroups(open, {
          base: open.expanded,
          levels: [0],
          type: "collapse-all",
        }).expanded.size,
      ).toBe(0);
    });

    it("remembers a group opened by name and forgets it once closed", () => {
      const named = { color: "red", id: "a", label: "Alpha" };
      const open = reduceTableGroups(state, {
        id: "a",
        picked: named,
        type: "toggle",
      });

      expect(open.picked).toStrictEqual([named]);
      expect(
        reduceTableGroups(open, { id: "a", type: "toggle" }).picked,
      ).toStrictEqual([]);
    });

    it("does not remember a group opened without a name", () => {
      expect(
        reduceTableGroups(state, { id: "a", type: "toggle" }).picked,
      ).toStrictEqual([]);
    });

    it("opens the groups named and remembers the last, once", () => {
      const named = { color: undefined, id: "b", label: "Beta" };
      const open = reduceTableGroups(state, {
        ids: ["a", "b"],
        picked: named,
        type: "open",
      });

      expect([...open.expanded]).toStrictEqual(["a", "b"]);
      expect(open.picked).toStrictEqual([named]);
      expect(open.touched).toBe(true);
      expect(
        reduceTableGroups(open, {
          ids: ["a", "b"],
          picked: named,
          type: "open",
        }).picked,
      ).toStrictEqual([named]);
    });

    it("opens the groups named over the ones a layout shows", () => {
      const open = reduceTableGroups(
        { ...state, expanded: new Set(["x"]) },
        {
          base: new Set(),
          ids: ["a"],
          picked: { color: undefined, id: "a", label: "Alpha" },
          type: "open",
        },
      );

      expect([...open.expanded]).toStrictEqual(["a"]);
    });

    it("forgets a remembered group a bulk change closes", () => {
      const open = reduceTableGroups(state, {
        ids: ["a", "b"],
        picked: { color: undefined, id: "b", label: "Beta" },
        type: "open",
      });

      expect(
        reduceTableGroups(open, { levels: [1], type: "collapse-all" }).picked,
      ).toStrictEqual([]);
      expect(
        reduceTableGroups(open, { levels: [0], type: "collapse-all" }).picked,
      ).toHaveLength(1);
    });

    it("forgets every remembered group when the data is reset", () => {
      const open = reduceTableGroups(state, {
        ids: ["a"],
        picked: { color: undefined, id: "a", label: "Alpha" },
        type: "open",
      });

      expect(
        reduceTableGroups(open, {
          firstPath: ["a"],
          groupIds: ["a", "b"],
          groupLevels: [0, 1],
          type: "reset",
        }).picked,
      ).toStrictEqual([]);
    });

    it("is untouched until a group is toggled or opened or closed in bulk, and again after a reset", () => {
      const levels = [0];
      const data = {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
      };

      expect(state.touched).toBe(false);
      expect(
        reduceTableGroups(state, { id: "a", type: "toggle" }).touched,
      ).toBe(true);
      expect(
        reduceTableGroups(state, { levels, type: "expand-all" }).touched,
      ).toBe(true);
      expect(
        reduceTableGroups(state, { levels, type: "collapse-all" }).touched,
      ).toBe(true);

      const touched = reduceTableGroups(state, { id: "a", type: "toggle" });

      expect(
        reduceTableGroups(touched, { ...data, type: "register" }).touched,
      ).toBe(true);
      expect(
        reduceTableGroups(touched, { ...data, type: "reset" }).touched,
      ).toBe(false);
    });

    it("loads a list a page past what shows, by its own id", () => {
      const more = reduceTableGroups(state, {
        listId: "a",
        shown: 100,
        type: "more",
      });

      expect([...more.limits]).toStrictEqual([["a", 200]]);
    });

    it("starts every list's own loading over when the page size or the pages change", () => {
      const more = reduceTableGroups(state, {
        listId: "a",
        shown: 100,
        type: "more",
      });

      expect(
        reduceTableGroups(more, { limit: 10, type: "set-limit" }),
      ).toMatchObject({ limit: 10, pages: 1 });
      expect(
        reduceTableGroups(more, { limit: 10, type: "set-limit" }).limits.size,
      ).toBe(0);
      expect(
        reduceTableGroups(more, { pages: 3, type: "set-pages" }).limits.size,
      ).toBe(0);
    });

    it("keeps at least the first page", () => {
      expect(
        reduceTableGroups(state, { pages: 0, type: "set-pages" }).pages,
      ).toBe(1);
    });

    it("opens only the first path again when the data is reset", () => {
      const reset = reduceTableGroups(
        reduceTableGroups(
          reduceTableGroups(state, { levels: [0, 1], type: "expand-all" }),
          {
            pages: 4,
            type: "set-pages",
          },
        ),
        {
          firstPath: ["a"],
          groupIds: ["a", "b"],
          groupLevels: [0, 1],
          type: "reset",
        },
      );

      expect([...reset.expanded]).toStrictEqual(["a"]);
      expect(reset.pages).toBe(1);
      expect(reset.limits.size).toBe(0);
    });

    it("keeps which groups are open when a layout registers the groups already known", () => {
      const first = reduceTableGroups(state, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
        type: "reset",
      });
      const opened = reduceTableGroups(first, { id: "b", type: "toggle" });

      expect(
        reduceTableGroups(opened, {
          firstPath: ["a"],
          groupIds: ["a", "b"],
          groupLevels: [0, 1],
          type: "register",
        }),
      ).toBe(opened);
    });

    it("opens only the first path of groups it does not know, keeping the rest", () => {
      const first = reduceTableGroups(state, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
        type: "reset",
      });
      const registered = reduceTableGroups(
        reduceTableGroups(first, { id: "b", type: "toggle" }),
        {
          firstPath: ["x"],
          groupIds: ["x", "y"],
          groupLevels: [0, 1],
          type: "register",
        },
      );

      expect(registered.groupIds).toStrictEqual(["x", "y"]);
      expect([...registered.expanded].toSorted()).toStrictEqual([
        "a",
        "b",
        "x",
      ]);
    });

    it("keeps a closed group closed when another layout registers and the first comes back", () => {
      const first = reduceTableGroups(state, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
        type: "reset",
      });
      const closed = reduceTableGroups(first, { id: "a", type: "toggle" });
      const away = reduceTableGroups(closed, {
        firstPath: ["x"],
        groupIds: ["x", "y"],
        groupLevels: [0, 1],
        type: "register",
      });
      const back = reduceTableGroups(away, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
        type: "register",
      });

      expect(back.groupIds).toStrictEqual(["a", "b"]);
      expect(back.expanded.has("a")).toBe(false);
      expect(back.expanded.has("x")).toBe(true);
    });

    it("takes the groups of the new data on a reset", () => {
      const reset = reduceTableGroups(state, {
        firstPath: ["x"],
        groupIds: ["x", "y"],
        groupLevels: [0, 1],
        type: "reset",
      });

      expect(reset.groupIds).toStrictEqual(["x", "y"]);
      expect([...reset.expanded]).toStrictEqual(["x"]);
    });

    it("is the same state when a reset or the sizes change nothing", () => {
      const first = reduceTableGroups(state, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        groupLevels: [0, 1],
        type: "reset",
      });

      expect(
        reduceTableGroups(first, {
          firstPath: ["a"],
          groupIds: ["a", "b"],
          groupLevels: [0, 1],
          type: "reset",
        }),
      ).toBe(first);

      const stats = { longest: 3, shown: 2, total: 5 };
      const measured = reduceTableGroups(first, { stats, type: "set-stats" });

      expect(measured.stats).toStrictEqual(stats);
      expect(
        reduceTableGroups(measured, { stats: { ...stats }, type: "set-stats" }),
      ).toBe(measured);
    });
  });
});
