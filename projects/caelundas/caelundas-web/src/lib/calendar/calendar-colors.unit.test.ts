import { describe, expect, it } from "vitest";

import {
  colorEvents,
  EVENT_COLOR_RULES,
  getEventColor,
} from "./calendar-colors";

import type { CalendarEventRecord } from "../events-database/events-database.types";

function colorOf(path: string): null | string {
  return EVENT_COLOR_RULES.find((rule) => rule.path === path)?.color ?? null;
}

function eventWith(
  paths: string[],
  color: null | string = null,
): CalendarEventRecord {
  return {
    color,
    description: "",
    durationMinutes: 0,
    end: new Date("2026-03-01T00:00:00Z"),
    groups: [],
    id: paths.join("|"),
    location: null,
    start: new Date("2026-03-01T00:00:00Z"),
    summary: "An event",
    tags: paths.map((path, index) => ({
      depth: path.split(" / ").length - 1,
      id: `tag-${String(index)}`,
      name: path.split(" / ").at(-1) ?? path,
      path,
    })),
    timezone: "America/New_York",
  };
}

describe("calendar colors", () => {
  describe(getEventColor, () => {
    it("colors an event by the kind its tag falls under", () => {
      expect(
        getEventColor(
          eventWith([
            "Type / Aspect / Simple Aspect / Major Aspect / Square",
            "Planet / Mars",
          ]),
        ),
      ).toBe(colorOf("Type / Aspect / Simple Aspect / Major Aspect"));
    });

    it("separates the kinds of aspect and the kinds of cycle", () => {
      const colors = new Set(
        [
          "Type / Aspect / Simple Aspect / Major Aspect / Trine",
          "Type / Aspect / Simple Aspect / Minor Aspect / Quincunx",
          "Type / Aspect / Simple Aspect / Specialty Aspect / Novile",
          "Type / Aspect / Compound Aspect / Triple Aspect / Yod",
          "Type / Cycle / Daily Solar Cycle",
          "Type / Cycle / Daily Lunar Cycle",
          "Type / Ingress / Sign Ingress",
          "Type / Twilight / Civil Dawn",
        ].map((path) => getEventColor(eventWith([path]))),
      );

      expect(colors.size).toBe(8);
      expect(colors.has(null)).toBe(false);
    });

    it("takes the most specific rule when several apply", () => {
      expect(
        getEventColor(
          eventWith(["Type / Aspect", "Type / Aspect / Compound Aspect / Yod"]),
        ),
      ).toBe(colorOf("Type / Aspect / Compound Aspect"));
    });

    it("does not take a tag whose name only starts like a rule's", () => {
      expect(getEventColor(eventWith(["Type / Ingressive"]))).toBeNull();
    });

    it("falls back to the color the data gives, or none", () => {
      expect(getEventColor(eventWith(["Planet / Mars"], "#123456"))).toBe(
        "#123456",
      );
      expect(getEventColor(eventWith(["Planet / Mars"]))).toBeNull();
    });

    it("gives every rule a distinct color and path", () => {
      expect(new Set(EVENT_COLOR_RULES.map((rule) => rule.color)).size).toBe(
        EVENT_COLOR_RULES.length,
      );
      expect(new Set(EVENT_COLOR_RULES.map((rule) => rule.path)).size).toBe(
        EVENT_COLOR_RULES.length,
      );
    });
  });

  describe(colorEvents, () => {
    const events = [
      eventWith(["Type / Station"], "#123456"),
      eventWith(["Planet / Mars"]),
    ];

    it("colors each event when enabled", () => {
      expect(
        colorEvents(events, true).map((event) => event.color),
      ).toStrictEqual([colorOf("Type / Station"), null]);
    });

    it("leaves every event uncolored when disabled, the data's color too", () => {
      expect(
        colorEvents(events, false).map((event) => event.color),
      ).toStrictEqual([null, null]);
    });

    it("does not change the events it is handed", () => {
      colorEvents(events, true);

      expect(events[0]?.color).toBe("#123456");
    });
  });
});
