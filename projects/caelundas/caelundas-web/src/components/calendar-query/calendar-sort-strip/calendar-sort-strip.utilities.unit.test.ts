import { describe, expect, it } from "vitest";

import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  createSortItems,
  flipSortAt,
  labelSort,
  toSorts,
  toSortValue,
} from "./calendar-sort-strip.utilities";

import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

const FIELDS = createEventGroupFields([
  {
    id: "aspect",
    name: "Aspect",
    values: [
      { count: 2, depth: 1, id: "simple", name: "Simple", path: "Simple" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Simple / Major",
      },
    ],
  },
  {
    id: "body",
    name: "Body",
    values: [{ count: 1, depth: 1, id: "sun", name: "Sun", path: "Sun" }],
  },
]);
const NAME_ASC: GroupSort = { direction: "asc", key: "name" };
const COUNT_DESC: GroupSort = { direction: "desc", key: "count" };
const IN_SIMPLE: GroupSort = { direction: "asc", key: "tag", tag: "simple" };
const ASPECT: GroupSort = { direction: "asc", key: "tag", tag: "tag:aspect" };

describe("calendar-sort-strip utilities", () => {
  describe(createSortItems, () => {
    it("offers the keys first, then each tag root that has tags beneath it", () => {
      const items = createSortItems(FIELDS);

      expect(items.map((item) => item.value)).toStrictEqual([
        "order",
        "name",
        "count",
        "first",
        "by:tag:aspect",
        "by:tag:body",
      ]);
    });

    it("draws an icon beside each key", () => {
      for (const item of createSortItems(FIELDS).slice(0, 4)) {
        expect(item.icon).toBeDefined();
        expect(item.children).toBeUndefined();
      }
    });

    it("prefixes each tag and the tags beneath it, so none is taken for a key", () => {
      const aspect = createSortItems(FIELDS).find(
        (item) => item.value === "by:tag:aspect",
      );

      expect(aspect?.children?.map((child) => child.value)).toStrictEqual([
        "by:simple",
      ]);
      expect(aspect?.children?.[0]?.children).toBeUndefined();
    });

    it("offers no derived field, which has no tags to rank by", () => {
      expect(createSortItems([])).toHaveLength(4);
      expect(
        createSortItems(FIELDS).some((item) => item.value === "by:month"),
      ).toBe(false);
    });
  });

  describe(labelSort, () => {
    it("names a key by its label", () => {
      expect(labelSort(NAME_ASC, FIELDS)).toBe("Name");
      expect(labelSort(COUNT_DESC, FIELDS)).toBe("Event count");
    });

    it("names a tag root by its label, and a tag after its root", () => {
      expect(labelSort(ASPECT, FIELDS)).toBe("Aspect");
      expect(labelSort(IN_SIMPLE, FIELDS)).toBe("Aspect › Simple");
    });

    it("names a tag the data lacks by its id, or a tag sort naming none by its key", () => {
      expect(labelSort({ ...IN_SIMPLE, tag: "gone" }, FIELDS)).toBe("gone");
      expect(labelSort({ direction: "asc", key: "tag" }, FIELDS)).toBe("tag");
    });
  });

  describe(toSortValue, () => {
    it("ticks each sort's key, or the tag with a prefix", () => {
      expect(toSortValue([NAME_ASC, COUNT_DESC, IN_SIMPLE])).toStrictEqual([
        "name",
        "count",
        "by:simple",
      ]);
      expect(toSortValue([])).toStrictEqual([]);
      expect(toSortValue([{ direction: "asc", key: "tag" }])).toStrictEqual([
        "by:",
      ]);
    });
  });

  describe(toSorts, () => {
    it("adds a sort ticked in the list after the others, ascending", () => {
      expect(toSorts(["name", "count"], [NAME_ASC])).toStrictEqual([
        NAME_ASC,
        { direction: "asc", key: "count" },
      ]);
      expect(toSorts(["name", "by:simple"], [NAME_ASC])).toStrictEqual([
        NAME_ASC,
        IN_SIMPLE,
      ]);
    });

    it("keeps the place and direction of a sort still ticked", () => {
      expect(toSorts(["name", "count"], [COUNT_DESC, NAME_ASC])).toStrictEqual([
        COUNT_DESC,
        NAME_ASC,
      ]);
    });

    it("takes out a sort that is cleared, and gives none when none are left", () => {
      expect(toSorts(["name"], [NAME_ASC, COUNT_DESC])).toStrictEqual([
        NAME_ASC,
      ]);
      expect(toSorts([], [NAME_ASC])).toBeUndefined();
    });

    it("ignores a stale value", () => {
      expect(toSorts(["narnia"], [])).toBeUndefined();
      expect(toSorts(["narnia", "name"], [])).toStrictEqual([NAME_ASC]);
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
});
