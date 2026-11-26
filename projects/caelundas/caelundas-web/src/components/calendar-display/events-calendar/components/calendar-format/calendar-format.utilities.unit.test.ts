import { describe, expect, it } from "vitest";

import {
  formatEventSpan,
  formatEventStamp,
  formatEventWhen,
} from "./calendar-format.utilities";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

const START = new Date("2026-03-04T10:00:00.000Z");
const EVENT: CalendarEventRecord = {
  color: null,
  durationMinutes: 0,
  end: START,
  groups: [],
  id: "event",
  name: "Event",
  note: "",
  start: START,
  tags: [],
  timezone: "UTC",
};

describe("calendar-format utilities", () => {
  describe(formatEventStamp, () => {
    it("writes the day and time in the zone", () => {
      expect(formatEventStamp(START, "UTC")).toBe("Mar 4, 10:00 AM");
      expect(formatEventStamp(START, "America/New_York")).toBe(
        "Mar 4, 5:00 AM",
      );
    });
  });

  describe(formatEventSpan, () => {
    it("writes the start and the end", () => {
      expect(
        formatEventSpan(START, new Date("2026-03-05T07:40:00.000Z"), "UTC"),
      ).toBe("Mar 4, 10:00 AM – Mar 5, 7:40 AM");
    });
  });

  describe(formatEventWhen, () => {
    it("writes an instant as one moment, in the event's own zone", () => {
      expect(formatEventWhen({ ...EVENT, timezone: "America/New_York" })).toBe(
        "Mar 4, 5:00 AM",
      );
    });

    it("writes a span with how long it lasts", () => {
      expect(
        formatEventWhen({
          ...EVENT,
          durationMinutes: 1500,
          end: new Date("2026-03-05T11:00:00.000Z"),
        }),
      ).toBe("Mar 4, 10:00 AM – Mar 5, 11:00 AM · 1 day, 1 hour");
    });
  });
});
