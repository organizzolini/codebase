import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import {
  calendarEventKey,
  formatCoordinate,
  mapWrittenIds,
  toTagLinks,
} from "./calendar-events.utilities";

describe("calendar events utilities", () => {
  describe(formatCoordinate, () => {
    it("rounds to the six decimals the column stores", () => {
      expect(formatCoordinate(39.949_309_4)).toBe("39.949309");
    });

    it("pads a short coordinate to six decimals", () => {
      expect(formatCoordinate(-75.5)).toBe("-75.500000");
    });
  });

  describe(calendarEventKey, () => {
    it("keys a moment and a date at the same instant alike", () => {
      const start = "2026-01-10T00:00:00.000Z";

      expect(calendarEventKey("Sunrise", moment.utc(start))).toBe(
        calendarEventKey("Sunrise", new Date(start)),
      );
    });
  });

  describe(mapWrittenIds, () => {
    const start = new Date("2026-01-10T00:00:00.000Z");

    it("keys each id by the summary and start read back with it", () => {
      expect(
        mapWrittenIds([
          { createdAt: start, id: "b", start, summary: "Sunset" },
          { id: "a", start, summary: "Sunrise" },
        ]),
      ).toStrictEqual(
        new Map([
          [calendarEventKey("Sunrise", start), "a"],
          [calendarEventKey("Sunset", start), "b"],
        ]),
      );
    });

    it("rejects a row read back without its id", () => {
      expect(() => mapWrittenIds([{ start, summary: "Sunrise" }])).toThrow(
        /id/u,
      );
    });
  });

  describe(toTagLinks, () => {
    const event = {
      description: "Sunrise description",
      end: moment.utc("2026-01-10T00:00:00Z"),
      start: moment.utc("2026-01-10T00:00:00Z"),
      summary: "Sunrise",
      tags: ["moon", "luminary", "moon"],
    };
    const tagIds = new Map([
      ["luminary", ["light"]],
      ["moon", ["light", "moon"]],
    ]);

    it("links each event to each node its tags resolve to once", () => {
      expect(
        toTagLinks([["key", event]], new Map([["key", "event"]]), tagIds),
      ).toStrictEqual([
        { calendarEventId: "event", tagId: "light" },
        { calendarEventId: "event", tagId: "moon" },
      ]);
    });

    it("throws for an event no id was read back for", () => {
      expect(() => toTagLinks([["key", event]], new Map(), tagIds)).toThrow(
        /Sunrise/u,
      );
    });
  });
});
