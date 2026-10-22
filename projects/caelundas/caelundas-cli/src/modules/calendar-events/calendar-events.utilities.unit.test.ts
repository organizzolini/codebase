import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { tagPathKey } from "../tags/tags.utilities";

import {
  calendarEventKey,
  formatCoordinate,
  mapWrittenIds,
  toTagLinks,
} from "./calendar-events.utilities";

import type { TagPath } from "../tags/tags.types";

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
      tags: ["Sun"],
    };
    const planet: TagPath = ["Planet", "Sun"];
    const type: TagPath = ["Type", "Cycle", "Daily Solar Cycle"];
    const classified = { event, paths: [planet, type, planet] };
    const tagIds = new Map([
      [tagPathKey(planet), "sun"],
      [tagPathKey(type), "cycle"],
    ]);

    it("links each event to the node of each of its paths once", () => {
      expect(
        toTagLinks([["key", classified]], new Map([["key", "event"]]), tagIds),
      ).toStrictEqual([
        { calendarEventId: "event", tagId: "sun" },
        { calendarEventId: "event", tagId: "cycle" },
      ]);
    });

    it("throws for a path no node was resolved for", () => {
      expect(() =>
        toTagLinks(
          [["key", classified]],
          new Map([["key", "event"]]),
          new Map([[tagPathKey(planet), "sun"]]),
        ),
      ).toThrow(/Daily Solar Cycle/u);
    });

    it("throws for an event no id was read back for", () => {
      expect(() =>
        toTagLinks([["key", classified]], new Map(), tagIds),
      ).toThrow(/Sunrise/u);
    });
  });
});
