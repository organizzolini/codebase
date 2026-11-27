import { describe, expect, it } from "vitest";

import { EVENT_COLOR_RULES } from "./calendar-colors.constants";
import { colorEvents, getEventColor } from "./calendar-colors.utilities";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

function colorOf(path: string): null | string {
  return EVENT_COLOR_RULES.find((rule) => rule.path === path)?.color ?? null;
}

function eventWith(
  paths: string[],
  color: null | string = null,
): CalendarEventRecord {
  return {
    color,
    durationMinutes: 0,
    end: new Date("2026-03-01T00:00:00Z"),
    groups: [],
    id: paths.join("|"),
    name: "An event",
    note: "",
    start: new Date("2026-03-01T00:00:00Z"),
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
            "Aspect / Simple / Major / Square",
            "Body / Planet / Personal / Mars",
          ]),
        ),
      ).toBe(colorOf("Aspect / Simple / Major"));
    });

    it("separates the kinds of aspect and the kinds of cycle", () => {
      const colors = new Set(
        [
          "Aspect / Simple / Major / Trine",
          "Aspect / Simple / Minor / Quincunx",
          "Aspect / Simple / Specialty / Novile",
          "Aspect / Compound / Triple / Yod",
          "Daily / Solar Cycle",
          "Daily / Lunar Cycle",
          "Sign / Ingress / Sign Ingress",
          "Daily / Twilight / Civil Dawn",
        ].map((path) => getEventColor(eventWith([path]))),
      );

      expect(colors.size).toBe(8);
      expect(colors.has(null)).toBe(false);
    });

    it("takes the most specific rule when several apply", () => {
      expect(
        getEventColor(eventWith(["Aspect", "Aspect / Compound / Yod"])),
      ).toBe(colorOf("Aspect / Compound"));
    });

    it("does not take a tag whose name only starts like a rule's", () => {
      expect(getEventColor(eventWith(["Sign / Ingressive"]))).toBeNull();
    });

    it("gives none for an event no kind rule covers, whatever color it carries", () => {
      expect(
        getEventColor(
          eventWith(["Body / Planet / Personal / Mars"], "#123456"),
        ),
      ).toBeNull();
      expect(
        getEventColor(eventWith(["Body / Planet / Personal / Mars"])),
      ).toBeNull();
    });

    it("colors a retrograde period by its own rule", () => {
      expect(
        getEventColor(eventWith(["Planetary / Direction / Retrograde Period"])),
      ).toBe(colorOf("Planetary / Direction / Retrograde Period"));
      expect(
        colorOf("Planetary / Direction / Retrograde Period"),
      ).not.toBeNull();
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
      eventWith(["Planetary / Direction"], "#123456"),
      eventWith(["Body / Planet / Personal / Mars"]),
    ];

    it("colors each event when enabled", () => {
      expect(
        colorEvents(events, true).map((event) => event.color),
      ).toStrictEqual([colorOf("Planetary / Direction"), null]);
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
