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
    const ids = ["a", "b", "c"];

    it("offers only opening when no group is open", () => {
      expect(getCollapseActions(ids, new Set())).toStrictEqual({
        canCollapse: false,
        canExpand: true,
      });
    });

    it("offers only closing when every group is open", () => {
      expect(getCollapseActions(ids, new Set(ids))).toStrictEqual({
        canCollapse: true,
        canExpand: false,
      });
    });

    it("offers both when the groups are mixed", () => {
      expect(getCollapseActions(ids, new Set(["b"]))).toStrictEqual({
        canCollapse: true,
        canExpand: true,
      });
    });

    it("offers neither when there are no groups", () => {
      expect(getCollapseActions([], new Set())).toStrictEqual({
        canCollapse: false,
        canExpand: false,
      });
    });

    it("ignores an open id that is no group", () => {
      expect(getCollapseActions(ids, new Set(["gone"]))).toStrictEqual({
        canCollapse: false,
        canExpand: true,
      });
    });
  });

  describe(reduceTableGroups, () => {
    const state: TableGroupsState = {
      ...INITIAL_TABLE_GROUPS,
      groupIds: ["a", "b"],
    };

    it("opens every group, and closes them all", () => {
      const open = reduceTableGroups(state, { type: "expand-all" });

      expect([...open.expanded]).toStrictEqual(["a", "b"]);
      expect(
        reduceTableGroups(open, { type: "collapse-all" }).expanded.size,
      ).toBe(0);
    });

    it("opens a closed group, and closes an open one", () => {
      const open = reduceTableGroups(state, { id: "a", type: "toggle" });

      expect([...open.expanded]).toStrictEqual(["a"]);
      expect(
        reduceTableGroups(open, { id: "a", type: "toggle" }).expanded.size,
      ).toBe(0);
    });

    it("loads a list a page past what shows, by its own id", () => {
      const more = reduceTableGroups(state, {
        listId: "a",
        shown: 25,
        type: "more",
      });

      expect([...more.limits]).toStrictEqual([["a", 50]]);
    });

    it("starts every list's own loading over when the page size or the pages change", () => {
      const more = reduceTableGroups(state, {
        listId: "a",
        shown: 25,
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
        reduceTableGroups(reduceTableGroups(state, { type: "expand-all" }), {
          pages: 4,
          type: "set-pages",
        }),
        { firstPath: ["a"], groupIds: ["a", "b"], type: "reset" },
      );

      expect([...reset.expanded]).toStrictEqual(["a"]);
      expect(reset.pages).toBe(1);
      expect(reset.limits.size).toBe(0);
    });

    it("takes the groups of the new data on a reset", () => {
      const reset = reduceTableGroups(state, {
        firstPath: ["x"],
        groupIds: ["x", "y"],
        type: "reset",
      });

      expect(reset.groupIds).toStrictEqual(["x", "y"]);
      expect([...reset.expanded]).toStrictEqual(["x"]);
    });

    it("is the same state when a reset or the sizes change nothing", () => {
      const first = reduceTableGroups(state, {
        firstPath: ["a"],
        groupIds: ["a", "b"],
        type: "reset",
      });

      expect(
        reduceTableGroups(first, {
          firstPath: ["a"],
          groupIds: ["a", "b"],
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
