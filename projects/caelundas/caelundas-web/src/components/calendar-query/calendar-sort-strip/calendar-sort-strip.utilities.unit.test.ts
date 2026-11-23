import { describe, expect, it } from "vitest";

import {
  createSortItems,
  flipSortAt,
  labelDefaultSort,
  toSorts,
  toSortValue,
} from "./calendar-sort-strip.utilities";

import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

const NAME_ASC: GroupSort = { direction: "asc", key: "name" };
const COUNT_DESC: GroupSort = { direction: "desc", key: "count" };

describe("calendar-sort-strip utilities", () => {
  describe(createSortItems, () => {
    it("offers each key with a direction beneath it", () => {
      const items = createSortItems();

      expect(items.map((item) => item.value)).toStrictEqual([
        "name",
        "count",
        "first",
      ]);
      expect(items[1]?.children?.map((child) => child.value)).toStrictEqual([
        "count:asc",
        "count:desc",
      ]);
    });
  });

  describe(toSortValue, () => {
    it("ticks each sort's key and direction", () => {
      expect(toSortValue([NAME_ASC, COUNT_DESC])).toStrictEqual([
        "name:asc",
        "count:desc",
      ]);
      expect(toSortValue([])).toStrictEqual([]);
    });
  });

  describe(toSorts, () => {
    it("adds a sort ticked in the list after the others", () => {
      expect(toSorts(["name:asc", "count:desc"], [NAME_ASC])).toStrictEqual([
        NAME_ASC,
        COUNT_DESC,
      ]);
    });

    it("replaces the other direction of a key ticked again", () => {
      expect(
        toSorts(
          ["name:asc", "name:desc", "count:desc"],
          [NAME_ASC, COUNT_DESC],
        ),
      ).toStrictEqual([COUNT_DESC, { direction: "desc", key: "name" }]);
    });

    it("takes out a sort that is cleared, and gives none when none are left", () => {
      expect(toSorts(["name:asc"], [NAME_ASC, COUNT_DESC])).toStrictEqual([
        NAME_ASC,
      ]);
      expect(toSorts([], [NAME_ASC])).toBeUndefined();
    });

    it("ignores a stale value, or no change", () => {
      expect(toSorts(["narnia:asc"], [])).toBeUndefined();
      expect(toSorts(["name:sideways"], [])).toBeUndefined();
      expect(toSorts(["name:asc"], [NAME_ASC])).toStrictEqual([NAME_ASC]);
    });
  });

  describe(flipSortAt, () => {
    it("turns only the sort at the index the other way round", () => {
      expect(flipSortAt([NAME_ASC, COUNT_DESC], 1)).toStrictEqual([
        NAME_ASC,
        { direction: "asc", key: "count" },
      ]);
      expect(flipSortAt([NAME_ASC], 0)).toStrictEqual([
        { direction: "desc", key: "name" },
      ]);
    });
  });

  describe(labelDefaultSort, () => {
    it("names the first group, or the names of groups with none", () => {
      expect(labelDefaultSort([], [])).toBe("Name");
      expect(labelDefaultSort([{ field: "tag:type" }], [])).toBe("tag:type");
    });
  });
});
