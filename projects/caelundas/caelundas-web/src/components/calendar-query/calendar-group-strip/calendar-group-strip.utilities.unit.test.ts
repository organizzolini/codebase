import { describe, expect, it } from "vitest";

import { createEventGroupFields } from "../calendar-group-by/components/event-group-model/event-group-fields.utilities";

import {
  createGroupItems,
  labelGroupLevel,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";

import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";

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
        name: "Major Aspect",
        path: "Aspect / Major Aspect",
      },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
]);
const TYPE: EventGroupLevel = { depth: 1, field: "tag:type" };
const DAY: EventGroupLevel = { field: "day" };

describe("calendar-group-strip utilities", () => {
  describe(createGroupItems, () => {
    it("nests a tag root's tags under it, and leaves a derived field a leaf", () => {
      const items = createGroupItems(FIELDS);
      const type = items.find((item) => item.value === "tag:type");
      const day = items.find((item) => item.value === "day");

      expect(type?.children?.map((child) => child.value)).toStrictEqual([
        "aspect",
        "ingress",
      ]);
      expect(
        type?.children?.[0]?.children?.map((child) => child.value),
      ).toStrictEqual(["major"]);
      expect(day?.children).toBeUndefined();
    });
  });

  describe(toGroupValue, () => {
    it("ticks a field alone, a first-level tag root with all its tags, and a tag choice by its tags", () => {
      expect(toGroupValue([DAY], FIELDS)).toStrictEqual(["day"]);
      expect(toGroupValue([TYPE], FIELDS)).toStrictEqual([
        "tag:type",
        "aspect",
        "major",
        "ingress",
      ]);
      expect(
        toGroupValue([{ field: "tag:type", tags: ["ingress"] }], FIELDS),
      ).toStrictEqual(["tag:type", "ingress"]);
    });
  });

  describe(toGrouping, () => {
    it("reads a ticked tag root as a first-level level, and a partly ticked one as its tags", () => {
      expect(
        toGrouping(["tag:type", "aspect", "major", "ingress"], [], FIELDS),
      ).toStrictEqual([TYPE]);
      expect(toGrouping(["ingress"], [], FIELDS)).toStrictEqual([
        { field: "tag:type", tags: ["ingress"] },
      ]);
    });

    it("keeps the levels already there in place and adds new ones after", () => {
      expect(
        toGrouping(["day", "ingress"], [DAY], FIELDS).map(
          (level) => level.field,
        ),
      ).toStrictEqual(["day", "tag:type"]);
      expect(
        toGrouping(["ingress", "day"], [TYPE, DAY], FIELDS).map(
          (level) => level.field,
        ),
      ).toStrictEqual(["tag:type", "day"]);
    });

    it("drops what is no longer ticked, and adds no level beyond the most there can be", () => {
      expect(toGrouping([], [DAY], FIELDS)).toStrictEqual([]);
      expect(
        toGrouping(["day", "week", "month", "year"], [], FIELDS),
      ).toHaveLength(3);
    });
  });

  describe(labelGroupLevel, () => {
    it("names a level by its field, with the tags it goes by, or by the id when the field is gone", () => {
      expect(labelGroupLevel(TYPE, FIELDS)).toBe("Type");
      expect(
        labelGroupLevel({ field: "tag:type", tags: ["ingress"] }, FIELDS),
      ).toBe("Type: Ingress");
      expect(labelGroupLevel({ field: "retired" }, FIELDS)).toBe("retired");
    });
  });
});
