import { describe, expect, it } from "vitest";

import {
  createSortItems,
  flipSortDirection,
  toSort,
  toSortValue,
} from "./calendar-sort-strip.utilities";

describe("calendar-sort-strip utilities", () => {
  describe(createSortItems, () => {
    it("offers the default order, then each key with a direction beneath it", () => {
      const items = createSortItems();

      expect(items.map((item) => item.value)).toStrictEqual([
        "default",
        "name",
        "count",
        "first",
      ]);
      expect(items[2]?.children?.map((child) => child.value)).toStrictEqual([
        "count:asc",
        "count:desc",
      ]);
    });
  });

  describe(toSortValue, () => {
    it("ticks the key and direction, or the default order for no sort", () => {
      expect(toSortValue({ direction: "desc", key: "count" })).toStrictEqual([
        "count:desc",
      ]);
      expect(toSortValue(undefined)).toStrictEqual(["default"]);
    });
  });

  describe(toSort, () => {
    it("reads a key and direction, and nothing for the default order or a stale value", () => {
      expect(toSort(["first:asc"])).toStrictEqual({
        direction: "asc",
        key: "first",
      });
      expect(toSort(["default"])).toBeUndefined();
      expect(toSort(["narnia:asc"])).toBeUndefined();
      expect(toSort(["name:sideways"])).toBeUndefined();
      expect(toSort([])).toBeUndefined();
    });
  });

  describe(flipSortDirection, () => {
    it("turns the same sort the other way round", () => {
      expect(
        flipSortDirection({ direction: "asc", key: "name" }),
      ).toStrictEqual({
        direction: "desc",
        key: "name",
      });
      expect(
        flipSortDirection({ direction: "desc", key: "name" }),
      ).toStrictEqual({
        direction: "asc",
        key: "name",
      });
    });
  });
});
