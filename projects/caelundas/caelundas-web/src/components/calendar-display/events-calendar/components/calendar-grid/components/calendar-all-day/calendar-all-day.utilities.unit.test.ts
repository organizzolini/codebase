import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";

import {
  getAllDayRecords,
  getNextAllDayMode,
  parseAllDayMode,
  toAllDaySearch,
} from "./calendar-all-day.utilities";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { EventCalendarSegment } from "@codebase/presentation";

function segment(
  day: string,
  record: CalendarEventRecord | undefined,
): EventCalendarSegment<CalendarEventRecord> {
  return {
    day: new Date(day),
    occurrence: { event: { data: record } },
  } as never;
}

describe("the all-day row's utilities", () => {
  describe(getAllDayRecords, () => {
    it("lists the events of each day by start", () => {
      const early = createRecord("early", "2026-03-01T01:00:00Z");
      const late = createRecord("late", "2026-03-01T09:00:00Z");
      const byDay = getAllDayRecords([
        segment("2026-03-02T00:00:00Z", late),
        segment("2026-03-02T00:00:00Z", early),
        segment("2026-03-03T00:00:00Z", late),
        segment("2026-03-03T00:00:00Z", undefined),
      ]);

      expect(
        byDay.get(new Date("2026-03-02T00:00:00Z").getTime()),
      ).toStrictEqual([early, late]);
      expect(
        byDay.get(new Date("2026-03-03T00:00:00Z").getTime()),
      ).toStrictEqual([late]);
    });
  });

  describe(getNextAllDayMode, () => {
    it("goes from the slim row to the groups to every event and around", () => {
      expect(getNextAllDayMode("contracted")).toBe("grouped");
      expect(getNextAllDayMode("grouped")).toBe("expanded");
      expect(getNextAllDayMode("expanded")).toBe("contracted");
    });
  });

  describe("the all-day link value", () => {
    it("reads c and e, and nothing else", () => {
      expect(parseAllDayMode("c")).toBe("contracted");
      expect(parseAllDayMode("e")).toBe("expanded");
      expect(parseAllDayMode("g")).toBeUndefined();
      expect(parseAllDayMode(undefined)).toBeUndefined();
    });

    it("writes the groups, the default, as none", () => {
      expect(toAllDaySearch("contracted")).toBe("c");
      expect(toAllDaySearch("expanded")).toBe("e");
      expect(toAllDaySearch("grouped")).toBeUndefined();
    });
  });
});
