import { describe, expect, it } from "vitest";

import { fixtureMeander } from "../../../../testing/meanders-api";

import { buildGroupedItems, indexGroups } from "./grouped-gallery.utilities";

import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type { GalleryGroup } from "../meander-gallery/meanders-api.types";
import type { GroupedItem } from "./grouped-gallery.types";

/** A field of a grouping, with the words a picker needs but a header does not. */
function field(
  key: string,
  label: string,
  type: GroupField["type"],
): GroupField {
  return { category: "test", description: label, key, label, type };
}

const FIELDS: GroupField[] = [
  field("rows", "Rows", "number"),
  field("columns", "Columns", "number"),
  field("isChain", "Chain", "boolean"),
  field("junctionCount", "Junction count", "number"),
];

/** A group with no groups in it. */
function leaf(fieldKey: string, value: string, count: number): GalleryGroup {
  return { count, field: fieldKey, groups: [], value };
}

/** Words an item: a header as depth, label, count and continued; a row as its Codes. */
function wordItem(item: GroupedItem): string {
  return item.kind === "header"
    ? `${String(item.depth)}:${item.label}:${String(item.count)}${item.isContinued ? ":continued" : ""}`
    : item.meanders.map(({ code }) => code.slice(-1)).join("");
}

describe("grouped gallery utilities", () => {
  describe(indexGroups, () => {
    it("notes each group's count and how many meanders come before it, depth first", () => {
      const extents = indexGroups([
        {
          count: 5,
          field: "rows",
          groups: [leaf("columns", "1", 2), leaf("columns", "2", 3)],
          value: "1",
        },
        {
          count: 4,
          field: "rows",
          groups: [leaf("columns", "1", 4)],
          value: "2",
        },
      ]);

      expect([...extents]).toStrictEqual([
        ["/rows=1", { count: 5, start: 0 }],
        ["/rows=1/columns=1", { count: 2, start: 0 }],
        ["/rows=1/columns=2", { count: 3, start: 2 }],
        ["/rows=2", { count: 4, start: 5 }],
        ["/rows=2/columns=1", { count: 4, start: 5 }],
      ]);
    });
  });

  describe(buildGroupedItems, () => {
    it("puts a header before the first meander of each group, a header for each level that changed", () => {
      // Rows 4 throughout; columns are 1, 2, 3, 1, 2 and 3.
      const meanders = [0, 3, 1, 4, 2, 5].map((index) => fixtureMeander(index));
      const items = buildGroupedItems(meanders, {
        columns: 4,
        extents: indexGroups([
          {
            count: 6,
            field: "rows",
            groups: [
              leaf("columns", "1", 2),
              leaf("columns", "2", 2),
              leaf("columns", "3", 2),
            ],
            value: "4",
          },
        ]),
        fields: FIELDS,
        grouping: ["rows", "columns"],
        offset: 0,
      });

      expect(items.map((item) => wordItem(item))).toStrictEqual([
        "0:Rows: 4:6",
        "1:Columns: 1:2",
        "03",
        "1:Columns: 2:2",
        "14",
        "1:Columns: 3:2",
        "25",
      ]);
    });

    it("splits a group's cards into rows of the columns, keyed by their place", () => {
      const items = buildGroupedItems(
        [0, 1, 2].map((index) => fixtureMeander(index)),
        {
          columns: 2,
          extents: new Map([["/rows=4", { count: 3, start: 0 }]]),
          fields: FIELDS,
          grouping: ["rows"],
          offset: 0,
        },
      );

      expect(items.map(({ key }) => key)).toStrictEqual([
        "/rows=4",
        "cards#1",
        "cards#2",
      ]);
      expect(items.map((item) => wordItem(item))).toStrictEqual([
        "0:Rows: 4:3",
        "01",
        "2",
      ]);
    });

    it("continues the groups the first meander is in when they began on an earlier page", () => {
      const items = buildGroupedItems(
        [2, 3].map((index) => fixtureMeander(index)),
        {
          columns: 4,
          extents: indexGroups([
            {
              count: 4,
              field: "rows",
              groups: [leaf("columns", "3", 2), leaf("columns", "1", 2)],
              value: "4",
            },
          ]),
          fields: FIELDS,
          grouping: ["rows", "columns"],
          offset: 1,
        },
      );

      expect(items.map((item) => wordItem(item))).toStrictEqual([
        "0:Rows: 4:4:continued",
        "1:Columns: 3:2:continued",
        "2",
        "1:Columns: 1:2",
        "3",
      ]);
    });

    it("starts a group on the page's first meander as new when the page begins with it", () => {
      const items = buildGroupedItems([fixtureMeander(0)], {
        columns: 4,
        extents: indexGroups([leaf("columns", "1", 5)]),
        fields: FIELDS,
        grouping: ["columns"],
        offset: 0,
      });

      expect(items.map((item) => wordItem(item))).toStrictEqual([
        "0:Columns: 1:5",
        "0",
      ]);
    });

    it("reads a meander's characteristics as the API groups them: a missing one as 0 or false, a flag as held or not", () => {
      // Meander 0 holds a chain and junction count 1; meander 1 holds junction
      // count 2 alone.
      const items = buildGroupedItems([fixtureMeander(1), fixtureMeander(0)], {
        columns: 4,
        extents: new Map(),
        fields: FIELDS,
        grouping: ["isChain", "junctionCount"],
        offset: 0,
      });

      expect(
        items.map((item) => (item.kind === "header" ? item.key : "")),
      ).toStrictEqual([
        "/isChain=false",
        "/isChain=false/junctionCount=2",
        "",
        "/isChain=true",
        "/isChain=true/junctionCount=1",
        "",
      ]);
      expect(
        items
          .filter((item) => item.kind === "header")
          .map((item) => wordItem(item)),
      ).toStrictEqual([
        "0:Chain: Not held:0",
        "1:Junction count: 2:0",
        "0:Chain: Held:0",
        "1:Junction count: 1:0",
      ]);
    });

    it("names a header by the group's field when no field is called that", () => {
      const items = buildGroupedItems([fixtureMeander(0)], {
        columns: 4,
        extents: new Map(),
        fields: [],
        grouping: ["mystery"],
        offset: 0,
      });

      expect(items.map((item) => wordItem(item))[0]).toBe("0:mystery: 0:0");
    });

    it("is only rows of cards for a flat list, with no headers", () => {
      const items = buildGroupedItems(
        [0, 1, 2].map((index) => fixtureMeander(index)),
        {
          columns: 2,
          extents: new Map(),
          fields: FIELDS,
          grouping: [],
          offset: 0,
        },
      );

      expect(items.map((item) => wordItem(item))).toStrictEqual(["01", "2"]);
    });

    it("is empty for no meanders", () => {
      expect(
        buildGroupedItems([], {
          columns: 2,
          extents: new Map(),
          fields: FIELDS,
          grouping: ["rows"],
          offset: 0,
        }),
      ).toStrictEqual([]);
    });
  });
});
