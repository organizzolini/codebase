import { describe, expect, it } from "vitest";

import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  createKeyItems,
  createMetricSortItems,
  createSortItems,
  createViewSortItems,
  flipSortAt,
  getSortChipIcon,
  getSortIcon,
  labelSort,
  labelSortChip,
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

    it("names a key that is not a sort option by itself", () => {
      expect(labelSort({ direction: "asc", key: "metric" }, FIELDS)).toBe(
        "metric",
      );
    });
  });

  describe(createKeyItems, () => {
    it("offers every key, or only those asked", () => {
      expect(createKeyItems(["name"]).map((item) => item.value)).toStrictEqual([
        "name",
      ]);
      expect(createKeyItems().length).toBeGreaterThan(1);
    });
  });

  describe(getSortIcon, () => {
    it("gives a key its icon, and a tag its row's symbol", () => {
      expect(getSortIcon(NAME_ASC, FIELDS)).toBeDefined();
      expect(getSortIcon(ASPECT, FIELDS)).toBe(FIELDS[0]?.icon);
      expect(getSortIcon(IN_SIMPLE, FIELDS)).toBeDefined();
    });

    it("gives none to a tag the data lacks", () => {
      expect(
        getSortIcon({ ...IN_SIMPLE, tag: "gone" }, FIELDS),
      ).toBeUndefined();
    });

    it("gives none to a key that is not a sort option", () => {
      expect(
        getSortIcon({ direction: "asc", key: "metric" }, FIELDS),
      ).toBeUndefined();
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

  describe("metric sorts", () => {
    const BY_SPANS: GroupSort = {
      direction: "asc",
      key: "metric",
      metric: "SPANS",
    };

    it("offers the tag order, the name, then a row for each metric", () => {
      const items = createMetricSortItems(["EVENTS", "SPANS"]);

      expect(items.map((item) => item.value)).toStrictEqual([
        "order",
        "name",
        "metric:EVENTS",
        "metric:SPANS",
      ]);
      expect(items[3]?.label).toBe("Spans");
      expect(items[3]?.description).toBe("By each group's spans.");
    });

    it("ticks a metric sort by its own value, and reads it back, ascending", () => {
      expect(toSortValue([BY_SPANS])).toStrictEqual(["metric:SPANS"]);
      expect(toSortValue([{ direction: "asc", key: "metric" }])).toStrictEqual([
        "metric:",
      ]);
      expect(toSorts(["metric:SPANS"], [])).toStrictEqual([BY_SPANS]);
    });

    it("keeps a metric sort's direction, and ignores a metric that is not a name", () => {
      const descending: GroupSort = { ...BY_SPANS, direction: "desc" };

      expect(toSorts(["metric:SPANS", "name"], [descending])).toStrictEqual([
        descending,
        NAME_ASC,
      ]);
      expect(toSorts(["metric:narnia"], [])).toBeUndefined();
    });

    it("names the sort and draws the icon of its metric", () => {
      expect(labelSortChip(BY_SPANS, FIELDS)).toBe("Spans");
      expect(labelSortChip({ direction: "asc", key: "metric" }, FIELDS)).toBe(
        "Metric",
      );
      expect(getSortChipIcon(BY_SPANS, FIELDS)).toBeDefined();
      expect(
        getSortChipIcon({ direction: "asc", key: "metric" }, FIELDS),
      ).toBeUndefined();
    });

    it("names and draws the other sorts as before", () => {
      expect(labelSortChip(NAME_ASC, FIELDS)).toBe("Name");
      expect(getSortChipIcon(NAME_ASC, FIELDS)).toBeDefined();
    });

    it("offers a view its own sorts", () => {
      const context = {
        columns: undefined,
        fields: FIELDS,
        metrics: ["SPANS" as const],
      };

      expect(
        createViewSortItems("totals", context).map((item) => item.value),
      ).toStrictEqual(["order", "name", "metric:SPANS"]);
      expect(
        createViewSortItems("timeline", context).map((item) => item.value),
      ).toContain("count");
      expect(
        createViewSortItems("table", { ...context, columns: ["name"] }).map(
          (item) => item.value,
        ),
      ).not.toContain("first");
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
