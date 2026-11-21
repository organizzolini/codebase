import { describe, expect, it } from "vitest";

import {
  labelGroupLevel,
  toggleGroupLevel,
} from "./calendar-group-strip.utilities";

import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";

const TYPE: EventGroupLevel = { depth: 1, field: "tag:type" };

describe("calendar-group-strip utilities", () => {
  describe(toggleGroupLevel, () => {
    const field = {
      description: "",
      id: "day",
      label: "Day",
      levels: [],
      options: [],
    };

    it("appends a field's level, and takes it out again", () => {
      expect(toggleGroupLevel([TYPE], field)).toStrictEqual([
        TYPE,
        { field: "day" },
      ]);
      expect(toggleGroupLevel([TYPE, { field: "day" }], field)).toStrictEqual([
        TYPE,
      ]);
    });

    it("adds no level beyond the most there can be", () => {
      const full = [{ field: "a" }, { field: "b" }, { field: "c" }];

      expect(toggleGroupLevel(full, field)).toStrictEqual(full);
    });
  });

  describe(labelGroupLevel, () => {
    it("names a level by its field, or by the id when the field is gone", () => {
      const fields = [
        { description: "", id: "day", label: "Day", levels: [], options: [] },
      ];

      expect(labelGroupLevel({ field: "day" }, fields)).toBe("Day");
      expect(labelGroupLevel({ field: "retired" }, fields)).toBe("retired");
    });
  });
});
