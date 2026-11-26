import { describe, expect, it } from "vitest";

import { createEventGroupFields } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  cleanColumns,
  cleanFilter,
  cleanGrouping,
  cleanSorts,
  dropUnofferedTags,
} from "./calendar-search-flags.utilities";

import type { EventFilterQuery } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";

const FIELDS = createEventGroupFields([
  {
    id: "root",
    isSelectable: false,
    name: "Root",
    values: [
      {
        count: 1,
        depth: 1,
        id: "hidden",
        isFilterable: false,
        isGroupable: false,
        isSelectable: false,
        isSortable: false,
        name: "Hidden",
        path: "Hidden",
      },
      { count: 1, depth: 1, id: "shown", name: "Shown", path: "Shown" },
    ],
  },
]);
const NONE = new Set<string>();
const HIDDEN = new Set(["hidden"]);

/** A one-rule filter picking the given values. */
function filterOf(...values: string[]): EventFilterQuery {
  return {
    combinator: "and",
    id: "root",
    rules: [
      {
        field: "tag:root",
        id: "rule",
        operator: "is_any_of",
        type: "rule",
        value: values,
      },
    ],
    type: "group",
  } as unknown as EventFilterQuery;
}

describe("link tags the menus leave out", () => {
  describe(cleanFilter, () => {
    it("drops an unoffered pick and keeps the others", () => {
      expect(cleanFilter(filterOf("hidden", "shown"), HIDDEN)).toStrictEqual(
        filterOf("shown"),
      );
    });

    it("drops a rule left with no pick, and a group left with no rule", () => {
      const nested = {
        ...filterOf("shown"),
        rules: [{ ...filterOf("hidden"), id: "inner" }],
      } as unknown as EventFilterQuery;

      expect(cleanFilter(filterOf("hidden"), HIDDEN)?.rules).toStrictEqual([]);
      expect(cleanFilter(nested, HIDDEN)?.rules).toStrictEqual([]);
    });

    it("returns the same filter when nothing was left out, and for no filter", () => {
      const filter = filterOf("shown");

      expect(cleanFilter(filter, HIDDEN)).toBe(filter);
      expect(cleanFilter(filter, NONE)).toBe(filter);
      expect(cleanFilter(undefined, HIDDEN)).toBeUndefined();
    });
  });

  describe(cleanGrouping, () => {
    it("drops the levels that name an unoffered tag or root, and its picks", () => {
      expect(
        cleanGrouping(
          [
            { field: "tag:root", parent: "hidden" },
            { field: "tag:root", tags: ["hidden"] },
            { field: "tag:root", tags: ["hidden", "shown"] },
            { field: "tag:hidden" },
            { field: "day" },
          ],
          HIDDEN,
        ),
      ).toStrictEqual([
        { field: "tag:root", tags: ["shown"] },
        { field: "tag:hidden" },
        { field: "day" },
      ]);
    });

    it("returns the same grouping when nothing was left out", () => {
      const grouping = [{ field: "day" }];

      expect(cleanGrouping(grouping, HIDDEN)).toBe(grouping);
      expect(cleanGrouping(undefined, HIDDEN)).toBeUndefined();
    });
  });

  describe(cleanSorts, () => {
    it("drops the sorts by an unoffered tag, and all of them to the default", () => {
      const keep = { direction: "asc", key: "name" } as const;
      const hidden = { direction: "asc", key: "tag", tag: "hidden" } as const;

      expect(cleanSorts([hidden, keep], HIDDEN)).toStrictEqual([keep]);
      expect(cleanSorts([hidden], HIDDEN)).toBeUndefined();
      expect(cleanSorts([keep], HIDDEN)).toStrictEqual([keep]);
      expect(cleanSorts(undefined, HIDDEN)).toBeUndefined();
    });
  });

  describe(cleanColumns, () => {
    it("drops the unoffered columns, and all of them to the defaults", () => {
      expect(cleanColumns(["name", "hidden"], HIDDEN)).toStrictEqual(["name"]);
      expect(cleanColumns(["hidden"], HIDDEN)).toBeUndefined();
      expect(cleanColumns(undefined, HIDDEN)).toBeUndefined();
    });
  });

  describe(dropUnofferedTags, () => {
    it("names only what changed, by each menu's flag", () => {
      expect(
        dropUnofferedTags(
          {
            columns: ["name", "hidden"],
            filter: filterOf("hidden"),
            group: [{ field: "tag:root", parent: "hidden" }],
            sort: [{ direction: "asc", key: "tag", tag: "hidden" }],
          },
          FIELDS,
        ),
      ).toStrictEqual({
        columns: ["name"],
        filter: { ...filterOf("hidden"), rules: [] },
        group: [],
        sort: undefined,
      });
    });

    it("reads the root's own flag, and names nothing when no tag was left out", () => {
      expect(
        dropUnofferedTags({ columns: ["tag:root", "name"] }, FIELDS),
      ).toStrictEqual({ columns: ["name"] });
      expect(
        dropUnofferedTags(
          { columns: ["name"], group: [{ field: "day" }] },
          FIELDS,
        ),
      ).toBeUndefined();
    });
  });
});
