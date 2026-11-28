import { describe, expect, it } from "vitest";

import { CATALOG } from "../../../../testing/metrics/metric-catalog";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import { TAG_SORT_PARENT } from "./calendar-sort-strip.constants";
import {
  createKeyItems,
  createMetricSortItems,
  createSortItems,
  createViewSortItems,
  flipSortAt,
  getSortChipIcon,
  getSortIcon,
  isSortChoice,
  labelSort,
  labelSortChip,
  listSortNames,
  pathSort,
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
    it("offers the keys first, the tag order holding each tag root", () => {
      const items = createSortItems(FIELDS);

      expect(items.map((item) => item.value)).toStrictEqual([
        "order",
        "name",
        "count",
        "first",
        "start",
        "end",
        "duration",
      ]);
      expect(items[0]?.label).toBe("Tag");
      expect(items[0]?.children?.map((item) => item.value)).toStrictEqual([
        "by:tag:aspect",
        "by:tag:body",
      ]);
    });

    it("draws an icon beside each key, only the tag order holding roots", () => {
      for (const item of createSortItems(FIELDS).slice(1, 7)) {
        expect(item.icon).toBeDefined();
        expect(item.children).toBeUndefined();
      }

      expect(createSortItems(FIELDS)[0]?.icon).toBeDefined();
    });

    it("holds the roots under an own Tag row where the tag order is not offered", () => {
      const items = createSortItems(FIELDS, ["name"]);

      expect(items.map((item) => item.value)).toStrictEqual([
        "name",
        TAG_SORT_PARENT,
      ]);
      expect(items[1]?.children).toHaveLength(2);
      expect(isSortChoice({ label: "Tag", value: TAG_SORT_PARENT })).toBe(
        false,
      );
      expect(isSortChoice({ label: "Name", value: "name" })).toBe(true);
    });

    it("leaves out a tag that is not sortable, and cannot tick a folder", () => {
      const fields = createEventGroupFields([
        {
          id: "aspect",
          name: "Aspect",
          values: [
            {
              count: 2,
              depth: 1,
              id: "simple",
              isSortable: false,
              name: "Simple",
              path: "Simple",
            },
            {
              count: 1,
              depth: 2,
              id: "major",
              name: "Major",
              path: "Simple / Major",
            },
            {
              count: 1,
              depth: 3,
              id: "square",
              name: "Square",
              path: "Simple / Major / Square",
            },
          ],
        },
      ]);
      const aspect = createSortItems(fields)[0]?.children?.find(
        (item) => item.value === "by:tag:aspect",
      );
      const [simple] = aspect?.children ?? [];

      expect(simple?.value).toBe("by:simple");
      expect(isSortChoice(simple ?? { label: "", value: "" })).toBe(false);
      expect(simple?.children?.map((item) => item.value)).toStrictEqual([
        "by:major",
      ]);
    });

    it("prefixes each tag and the tags beneath it, so none is taken for a key", () => {
      const aspect = createSortItems(FIELDS)[0]?.children?.find(
        (item) => item.value === "by:tag:aspect",
      );

      expect(aspect?.children?.map((child) => child.value)).toStrictEqual([
        "by:simple",
      ]);
      expect(aspect?.children?.[0]?.children).toBeUndefined();
    });

    it("offers no derived field, which has no tags to rank by", () => {
      expect(createSortItems([])).toHaveLength(7);
      expect(
        JSON.stringify(createSortItems(FIELDS).map((item) => item.value)),
      ).not.toContain("by:month");
    });
  });

  describe(pathSort, () => {
    it("writes a tag's root before it, and nothing for other sorts or a root", () => {
      expect(pathSort(IN_SIMPLE, FIELDS)).toBe("Aspect › Simple");
      expect(pathSort(ASPECT, FIELDS)).toBeUndefined();
      expect(pathSort(NAME_ASC, FIELDS)).toBeUndefined();
    });
  });

  describe(labelSort, () => {
    it("names a key by its label", () => {
      expect(labelSort(NAME_ASC, FIELDS)).toBe("Name");
      expect(labelSort(COUNT_DESC, FIELDS)).toBe("Event count");
    });

    it("names a tag root by its label, and a tag after its root", () => {
      expect(labelSort(ASPECT, FIELDS)).toBe("Aspect");
      expect(labelSort(IN_SIMPLE, FIELDS)).toBe("Simple");
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
      metric: "progressive-events",
    };

    it("offers the tag order, the name, then a row for each metric", () => {
      const items = createMetricSortItems(
        ["events", "progressive-events", "unknown-slug"],
        CATALOG.bySlug,
      );

      expect(items.map((item) => item.value)).toStrictEqual([
        "order",
        "name",
        "metric:events",
        "metric:progressive-events",
      ]);
      expect(items[3]?.label).toBe("Progressive events");
      expect(items[3]?.description).toBe("By each group's progressive events.");
    });

    it("ticks a metric sort by its own value, and reads it back, ascending", () => {
      expect(toSortValue([BY_SPANS])).toStrictEqual([
        "metric:progressive-events",
      ]);
      expect(toSortValue([{ direction: "asc", key: "metric" }])).toStrictEqual([
        "metric:",
      ]);
      expect(toSorts(["metric:progressive-events"], [])).toStrictEqual([
        BY_SPANS,
      ]);
    });

    it("keeps a metric sort's direction, and ignores a metric that is not a slug", () => {
      const descending: GroupSort = { ...BY_SPANS, direction: "desc" };

      expect(
        toSorts(["metric:progressive-events", "name"], [descending]),
      ).toStrictEqual([descending, NAME_ASC]);
      expect(toSorts(["metric:Not A Slug"], [])).toBeUndefined();
    });

    it("names the sort and draws the icon of its metric", () => {
      expect(labelSortChip(BY_SPANS, FIELDS, CATALOG.bySlug)).toBe(
        "Progressive events",
      );
      expect(
        labelSortChip(
          { direction: "asc", key: "metric" },
          FIELDS,
          CATALOG.bySlug,
        ),
      ).toBe("Metric");
      expect(getSortChipIcon(BY_SPANS, FIELDS, CATALOG.bySlug)).toBeDefined();
      expect(
        getSortChipIcon(
          { direction: "asc", key: "metric" },
          FIELDS,
          CATALOG.bySlug,
        ),
      ).toBeUndefined();
    });

    it("reads a metric sort written with an old name as its slug", () => {
      expect(toSorts(["metric:SPANS"], [])).toStrictEqual([BY_SPANS]);
    });

    it("names a metric sort of a metric the catalog lacks plainly", () => {
      const unknown: GroupSort = { ...BY_SPANS, metric: "unknown-slug" };

      expect(labelSortChip(unknown, FIELDS, CATALOG.bySlug)).toBe("Metric");
      expect(getSortChipIcon(unknown, FIELDS, CATALOG.bySlug)).toBeUndefined();
    });

    it("names and draws the other sorts as before", () => {
      expect(labelSortChip(NAME_ASC, FIELDS, CATALOG.bySlug)).toBe("Name");
      expect(getSortChipIcon(NAME_ASC, FIELDS, CATALOG.bySlug)).toBeDefined();
    });

    it("offers a view its own sorts", () => {
      const context = {
        columns: undefined,
        fields: FIELDS,
        metrics: ["progressive-events"],
      };

      expect(
        createViewSortItems("totals", context, CATALOG).map(
          (item) => item.value,
        ),
      ).toStrictEqual(["order", "name", "metric:progressive-events"]);
      expect(
        createViewSortItems("timeline", context, CATALOG).map(
          (item) => item.value,
        ),
      ).toContain("count");
      expect(
        createViewSortItems(
          "table",
          { ...context, columns: ["name"] },
          CATALOG,
        ).map((item) => item.value),
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

  describe(listSortNames, () => {
    const context = { bySlug: CATALOG.bySlug, fields: [] };

    it("names a chip for each sort", () => {
      expect(
        listSortNames(
          [
            { direction: "asc", key: "name" },
            { direction: "desc", key: "metric", metric: "events" },
          ],
          false,
          context,
        ),
      ).toStrictEqual(["Name", "Events"]);
    });

    it("names the default sort Tags", () => {
      expect(
        listSortNames([{ direction: "asc", key: "order" }], true, context),
      ).toStrictEqual(["Tags"]);
    });
  });
});
