import { describe, expect, it } from "vitest";

import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  createColumnItems,
  toColumnIds,
} from "./calendar-select-strip.utilities";

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

      expect(items.slice(0, 3).map((item) => item.value)).toStrictEqual([
        "name",
        "start",
        "end",
      ]);
      expect(items.some((item) => item.value === "tag:type")).toBe(true);
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
});
