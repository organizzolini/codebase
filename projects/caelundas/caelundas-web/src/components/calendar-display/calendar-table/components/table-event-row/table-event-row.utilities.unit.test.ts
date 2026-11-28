import { describe, expect, it } from "vitest";

import { areEventRowsEqual, getEventIndent } from "./table-event-row.utilities";

import type { EventRowComparison } from "./table-event-row.types";

const AT = new Date("2026-03-04T10:00:00.000Z");
const RECORD = {
  color: null,
  durationMinutes: 0,
  end: AT,
  groups: [],
  id: "a",
  name: "A",
  note: "",
  start: AT,
  tags: [],
  timezone: "UTC",
};
const COLUMNS = [{ id: "name", kind: "name" as const, label: "Name" }];
const BASE: EventRowComparison = {
  columns: COLUMNS,
  row: { depth: 1, id: "g|a", kind: "event", position: 1, record: RECORD },
  timeZone: "UTC",
};

describe("table-event-row utilities", () => {
  describe(getEventIndent, () => {
    it("pads a half rem past the group's indent", () => {
      expect(getEventIndent(2)).toBe("3rem");
    });
  });

  describe(areEventRowsEqual, () => {
    it("treats a rebuilt row of the same event and depth as the same", () => {
      expect(areEventRowsEqual(BASE, { ...BASE, row: { ...BASE.row } })).toBe(
        true,
      );
    });

    it("tells apart another event, depth, column set, or zone", () => {
      expect(
        areEventRowsEqual(BASE, {
          ...BASE,
          row: { ...BASE.row, record: { ...RECORD } },
        }),
      ).toBe(false);
      expect(
        areEventRowsEqual(BASE, { ...BASE, row: { ...BASE.row, depth: 2 } }),
      ).toBe(false);
      expect(
        areEventRowsEqual(BASE, { ...BASE, row: { ...BASE.row, position: 2 } }),
      ).toBe(false);
      expect(areEventRowsEqual(BASE, { ...BASE, columns: [...COLUMNS] })).toBe(
        false,
      );
      expect(
        areEventRowsEqual(BASE, { ...BASE, timeZone: "America/New_York" }),
      ).toBe(false);
    });
  });
});
