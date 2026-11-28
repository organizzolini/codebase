import { describe, expect, it } from "vitest";

import {
  getCellText,
  resolveColumns,
} from "../../calendar-display/calendar-table/calendar-table.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  createColumnItems,
  isColumnChoice,
  toColumnIds,
} from "./calendar-select-strip.utilities";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

const TREE_FIELDS = createEventGroupFields([
  {
    id: "aspect",
    name: "Aspect",
    values: [
      { count: 3, depth: 1, id: "simple", name: "Simple", path: "Simple" },
      {
        count: 2,
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
      {
        count: 1,
        depth: 2,
        id: "minor",
        name: "Minor",
        path: "Simple / Minor",
      },
      {
        count: 1,
        depth: 3,
        id: "quincunx",
        name: "Quincunx",
        path: "Simple / Minor / Quincunx",
      },
    ],
  },
  {
    id: "body",
    name: "Body",
    values: [
      { count: 2, depth: 1, id: "planet", name: "Planet", path: "Planet" },
      {
        count: 2,
        depth: 2,
        id: "personal",
        name: "Personal",
        path: "Planet / Personal",
      },
      {
        count: 1,
        depth: 3,
        id: "venus",
        name: "Venus",
        path: "Planet / Personal / Venus",
      },
      { count: 1, depth: 1, id: "point", name: "Point", path: "Point" },
      { count: 1, depth: 2, id: "node", name: "Node", path: "Point / Node" },
    ],
  },
]);
const EVENT: CalendarEventRecord = {
  color: null,
  durationMinutes: 60,
  end: new Date("2026-03-04T11:00:00.000Z"),
  groups: [],
  id: "e",
  name: "Venus square Mars",
  note: "",
  start: new Date("2026-03-04T10:00:00.000Z"),
  tags: [
    {
      depth: 3,
      id: "square",
      name: "Square",
      path: "Aspect / Simple / Major / Square",
    },
    {
      depth: 3,
      id: "quincunx",
      name: "Quincunx",
      path: "Aspect / Simple / Minor / Quincunx",
    },
    {
      depth: 3,
      id: "venus",
      name: "Venus",
      path: "Body / Planet / Personal / Venus",
    },
    {
      depth: 3,
      id: "venus-again",
      name: "Venus",
      path: "Body / Planet / Personal / Venus",
    },
    { depth: 2, id: "node", name: "Node", path: "Body / Point / Node" },
  ],
  timezone: "UTC",
};

function cells(ids: readonly string[]): string[][] {
  return resolveColumns(ids, TREE_FIELDS).map((column) => [
    column.label,
    getCellText(EVENT, column, "UTC"),
  ]);
}

const FIELDS = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Aspect / Major",
      },
    ],
  },
]);

describe("calendar-select-strip utilities", () => {
  describe(createColumnItems, () => {
    it("lists the name and times first, then each tag root with tags beneath it", () => {
      const items = createColumnItems(FIELDS);

      expect(items.slice(0, 4).map((item) => item.value)).toStrictEqual([
        "name",
        "start",
        "end",
        "duration",
      ]);
      expect(items[3]?.description).toBe("How long the event lasts.");
      expect(items[4]?.value).toBe("tag:*");
      expect(items[4]?.label).toBe("Tag");
      expect(
        items[4]?.children?.some((item) => item.value === "tag:type"),
      ).toBe(true);
      expect(isColumnChoice({ label: "Tag", value: "tag:*" })).toBe(false);
      expect(isColumnChoice({ label: "Name", value: "name" })).toBe(true);
    });

    it("offers only the selectable tags, keeping a left-out tag as a folder that cannot be ticked", () => {
      const fields = createEventGroupFields([
        {
          id: "body",
          name: "Body",
          values: [
            {
              count: 2,
              depth: 1,
              id: "planet",
              isSelectable: false,
              name: "Planet",
              path: "Planet",
            },
            {
              count: 1,
              depth: 2,
              id: "inner",
              name: "Inner",
              path: "Planet / Inner",
            },
            {
              count: 1,
              depth: 3,
              id: "venus",
              name: "Venus",
              path: "Planet / Inner / Venus",
            },
            {
              count: 1,
              depth: 1,
              id: "benefic",
              isSelectable: false,
              name: "Benefic",
              path: "Benefic",
            },
            {
              count: 1,
              depth: 2,
              id: "sun",
              name: "Sun",
              path: "Benefic / Sun",
            },
          ],
        },
      ]);
      const tag = createColumnItems(fields)[4];
      const [body] = tag?.children ?? [];
      const [planet, benefic] = body?.children ?? [];

      expect(planet?.label).toBe("Planet");
      expect(isColumnChoice(planet ?? { label: "", value: "" })).toBe(false);
      expect(planet?.children?.map((item) => item.value)).toStrictEqual([
        "inner",
      ]);
      expect(benefic).toBeUndefined();
    });

    it("leaves a derived field out, since it has no tags to show", () => {
      const items = createColumnItems(FIELDS);

      expect(items.some((item) => item.value === "day")).toBe(false);
    });

    it("draws an icon beside each base column", () => {
      const [name] = createColumnItems(FIELDS);

      expect(name?.icon).toBeDefined();
      expect(name?.label).toBe("Name");
    });
  });

  describe(toColumnIds, () => {
    it("keeps the ticked columns in place and appends the newly ticked", () => {
      expect(
        toColumnIds(["end", "name", "start"], ["name", "start"]),
      ).toStrictEqual(["name", "start", "end"]);
    });

    it("drops a column that was unchecked", () => {
      expect(toColumnIds(["start"], ["name", "start"])).toStrictEqual([
        "start",
      ]);
    });

    it("returns nothing when no column is left, meaning the defaults", () => {
      expect(toColumnIds([], ["name"])).toBeUndefined();
    });
  });

  describe("tag columns of different levels", () => {
    it("shows a root everything beneath it", () => {
      expect(cells(["tag:aspect"])).toStrictEqual([
        ["Aspect", "Simple / Major / Square, Simple / Minor / Quincunx"],
      ]);
    });

    it("shows a node only its descendants, below its own path", () => {
      expect(cells(["simple", "major", "minor"])).toStrictEqual([
        ["Aspect › Simple", "Major / Square, Minor / Quincunx"],
        ["Aspect › Simple › Major", "Square"],
        ["Aspect › Simple › Minor", "Quincunx"],
      ]);
    });

    it("names a grandchild node by its whole path", () => {
      expect(cells(["personal", "planet", "point"])).toStrictEqual([
        ["Body › Planet › Personal", "Venus"],
        ["Body › Planet", "Personal / Venus"],
        ["Body › Point", "Node"],
      ]);
    });

    it("mixes a node of one root with another root, in the order given", () => {
      expect(cells(["tag:body", "major", "name"])).toStrictEqual([
        ["Body", "Planet / Personal / Venus, Point / Node"],
        ["Aspect › Simple › Major", "Square"],
        ["Name", "Venus square Mars"],
      ]);
    });

    it("keeps a parent and its child as columns of their own", () => {
      expect(
        cells(["simple", "tag:aspect", "major"]).map(([label]) => label),
      ).toStrictEqual(["Aspect › Simple", "Aspect", "Aspect › Simple › Major"]);
    });

    it("shows a tag once however often the event repeats it", () => {
      expect(cells(["venus"])).toStrictEqual([]);
      expect(cells(["personal"])).toStrictEqual([
        ["Body › Planet › Personal", "Venus"],
      ]);
    });

    it("lists a column once however often its id is named", () => {
      expect(
        cells(["simple", "simple", "end"]).map(([label]) => label),
      ).toStrictEqual(["Aspect › Simple", "End"]);
    });

    it("ignores an id the data does not have", () => {
      expect(
        cells(["tag:gone", "simple"]).map(([label]) => label),
      ).toStrictEqual(["Aspect › Simple"]);
    });
  });

  describe("the tree of columns", () => {
    it("offers each root with its tags that have tags beneath, nested", () => {
      const aspect = createColumnItems(TREE_FIELDS)[4]?.children?.find(
        (item) => item.value === "tag:aspect",
      );
      const simple = aspect?.children?.[0];

      expect(simple?.value).toBe("simple");
      expect(simple?.children?.map((child) => child.value)).toStrictEqual([
        "major",
        "minor",
      ]);
    });

    it("keeps ticked parents and children independently", () => {
      expect(
        toColumnIds(["name", "simple", "major"], ["name", "simple"]),
      ).toStrictEqual(["name", "simple", "major"]);
      expect(
        toColumnIds(["name", "major"], ["name", "simple", "major"]),
      ).toStrictEqual(["name", "major"]);
    });
  });
});
