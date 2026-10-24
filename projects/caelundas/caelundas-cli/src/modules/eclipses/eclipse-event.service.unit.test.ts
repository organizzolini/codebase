import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { EclipseEventService } from "./eclipse-event.service";

import type { DetectedCalendarEvent } from "../database/database.types";

describe(EclipseEventService, () => {
  let service: EclipseEventService;
  let progressiveUtilitiesService: ProgressiveUtilitiesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EclipseEventService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: ProgressiveUtilitiesService,
          useValue: createMock<ProgressiveUtilitiesService>(),
        },
      ],
    }).compile();

    service = await module.resolve(EclipseEventService);
    await module.resolve(LoggerService);
    progressiveUtilitiesService = await module.resolve(
      ProgressiveUtilitiesService,
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("buildSolarEclipseEvent", () => {
    it("builds geocentric solar eclipse event", () => {
      const timestamp = moment.utc("2024-04-08T18:00:00.000Z");

      const event = service.buildSolarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "beginning",
        type: "annular",
      });

      expect(event.summary).toBe("🌐 ☀️🐉▶️ Annular Solar Eclipse begins");
      expect(event.description).toBe(
        "Annular Solar Eclipse begins (Geocentric)",
      );
      expect(event.tags).toContain("Annular");
      expect(event.tags).toContain("Solar");
      expect(event.tags).toContain("Geocentric");
      expect(event.start).toStrictEqual(timestamp);
      expect(event.end).toStrictEqual(timestamp);
    });

    it("builds topocentric solar eclipse event", () => {
      const timestamp = moment.utc("2024-04-08T18:00:00.000Z");

      const event = service.buildSolarEclipseEvent({
        date: timestamp,
        frame: "topocentric",
        phase: "beginning",
        type: "annular",
      });

      expect(event.summary).toBe("📍 ☀️🐉▶️ Annular Solar Eclipse begins");
      expect(event.description).toBe(
        "Annular Solar Eclipse begins (Topocentric Visibility)",
      );
      expect(event.tags).toContain("Topocentric Visibility");
    });

    it("builds maximum and ending solar eclipse events", () => {
      const timestamp = moment.utc("2024-04-08T18:00:00.000Z");

      const maximumEvent = service.buildSolarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "maximum",
        type: "annular",
      });
      const endingEvent = service.buildSolarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "ending",
        type: "annular",
      });

      expect(maximumEvent.summary).toBe(
        "🌐 ☀️🐉🎯 Annular Solar Eclipse maximum",
      );
      expect(endingEvent.summary).toBe("🌐 ☀️🐉◀️ Annular Solar Eclipse ends");
    });
  });

  describe("buildLunarEclipseEvent", () => {
    it("builds geocentric lunar eclipse event", () => {
      const timestamp = moment.utc("2024-09-18T02:00:00.000Z");

      const event = service.buildLunarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "beginning",
        type: "total",
      });

      expect(event.summary).toBe("🌐 🌙🐉▶️ Total Lunar Eclipse begins");
      expect(event.description).toBe("Total Lunar Eclipse begins (Geocentric)");
      expect(event.tags).toContain("Total");
      expect(event.tags).toContain("Lunar");
      expect(event.tags).toContain("Geocentric");
      expect(event.start).toStrictEqual(timestamp);
      expect(event.end).toStrictEqual(timestamp);
    });

    it("builds topocentric lunar eclipse event", () => {
      const timestamp = moment.utc("2024-09-18T02:00:00.000Z");

      const event = service.buildLunarEclipseEvent({
        date: timestamp,
        frame: "topocentric",
        phase: "beginning",
        type: "total",
      });

      expect(event.summary).toBe("📍 🌙🐉▶️ Total Lunar Eclipse begins");
      expect(event.description).toBe(
        "Total Lunar Eclipse begins (Topocentric Visibility)",
      );
      expect(event.tags).toContain("Topocentric Visibility");
    });

    it("builds maximum and ending lunar eclipse events", () => {
      const timestamp = moment.utc("2024-09-18T02:00:00.000Z");

      const maximumEvent = service.buildLunarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "maximum",
        type: "total",
      });
      const endingEvent = service.buildLunarEclipseEvent({
        date: timestamp,
        frame: "geocentric",
        phase: "ending",
        type: "total",
      });

      expect(maximumEvent.summary).toBe(
        "🌐 🌙🐉🎯 Total Lunar Eclipse maximum",
      );
      expect(endingEvent.summary).toBe("🌐 🌙🐉◀️ Total Lunar Eclipse ends");
    });
  });

  describe("detectProgressive", () => {
    it("creates progressive events for geocentric solar and lunar eclipse ranges", () => {
      const solarBeginning: DetectedCalendarEvent = {
        description: "Partial Solar Eclipse begins (Geocentric)",
        end: moment.utc("2024-04-08T18:00:00.000Z"),
        start: moment.utc("2024-04-08T18:00:00.000Z"),
        summary: "🌐 ☀️🐉▶️ Solar Eclipse begins",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Solar",
          "Geocentric",
          "Partial",
        ],
      };
      const solarEnding: DetectedCalendarEvent = {
        description: "Solar Eclipse ends (Geocentric)",
        end: moment.utc("2024-04-08T19:00:00.000Z"),
        start: moment.utc("2024-04-08T19:00:00.000Z"),
        summary: "🌐 ☀️🐉◀️ Solar Eclipse ends",
        tags: ["Astronomy", "Astrology", "Eclipse", "Solar", "Geocentric"],
      };
      const lunarBeginning: DetectedCalendarEvent = {
        description: "Penumbral Lunar Eclipse begins (Geocentric)",
        end: moment.utc("2024-09-18T02:00:00.000Z"),
        start: moment.utc("2024-09-18T02:00:00.000Z"),
        summary: "🌐 🌙🐉▶️ Lunar Eclipse begins",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Lunar",
          "Geocentric",
          "Penumbral",
        ],
      };
      const lunarEnding: DetectedCalendarEvent = {
        description: "Lunar Eclipse ends (Geocentric)",
        end: moment.utc("2024-09-18T03:00:00.000Z"),
        start: moment.utc("2024-09-18T03:00:00.000Z"),
        summary: "🌐 🌙🐉◀️ Lunar Eclipse ends",
        tags: ["Astronomy", "Astrology", "Eclipse", "Lunar", "Geocentric"],
      };

      vi.mocked(progressiveUtilitiesService.pairProgressiveEvents)
        .mockReturnValueOnce([[lunarBeginning, lunarEnding]])
        .mockReturnValueOnce([[solarBeginning, solarEnding]])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      const progressiveEvents = service.detectProgressive([
        solarBeginning,
        solarEnding,
        lunarBeginning,
        lunarEnding,
      ]);

      expect(progressiveEvents).toHaveLength(2);

      const solarDurationEvent = progressiveEvents.find((event) =>
        event.tags.includes("Solar"),
      );
      const lunarDurationEvent = progressiveEvents.find((event) =>
        event.tags.includes("Lunar"),
      );

      expect(solarDurationEvent?.description).toBe(
        "Partial Solar Eclipse (Geocentric)",
      );
      expect(solarDurationEvent?.summary).toBe(
        "🌐 ☀️🐉 Partial Solar Eclipse (Geocentric)",
      );
      expect(lunarDurationEvent?.description).toBe(
        "Penumbral Lunar Eclipse (Geocentric)",
      );
      expect(lunarDurationEvent?.summary).toBe(
        "🌐 🌙🐉 Penumbral Lunar Eclipse (Geocentric)",
      );
    });

    it("returns empty array when no eclipse events exist", () => {
      vi.mocked(progressiveUtilitiesService.pairProgressiveEvents)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      const result = service.detectProgressive([
        {
          description: "Unrelated",
          end: moment.utc("2024-01-01T00:00:00.000Z"),
          start: moment.utc("2024-01-01T00:00:00.000Z"),
          summary: "Unrelated",
          tags: ["Astronomy"],
        },
      ]);

      expect(result).toStrictEqual([]);
    });

    it("leaves the type out of a span whose beginning carries none", () => {
      const makeEvent = (word: string): DetectedCalendarEvent => ({
        description: `Lunar Eclipse ${word} (Geocentric)`,
        end: moment.utc("2024-03-25T07:00:00.000Z"),
        start: moment.utc("2024-03-25T07:00:00.000Z"),
        summary: `Lunar Eclipse ${word}`,
        tags: ["Astronomy", "Astrology", "Eclipse", "Lunar", "Geocentric"],
      });
      const beginning = makeEvent("begins");
      const ending = makeEvent("ends");
      vi.mocked(progressiveUtilitiesService.pairProgressiveEvents)
        .mockReturnValueOnce([[beginning, ending]])
        .mockReturnValue([]);

      const [span] = service.detectProgressive([beginning, ending]);

      expect(span?.description).toBe("Lunar Eclipse (Geocentric)");
      expect(span?.tags).toStrictEqual([
        "Astronomy",
        "Astrology",
        "Eclipse",
        "Lunar",
        "Geocentric",
      ]);
    });

    it("creates topocentric progressive events for solar and lunar eclipse ranges", () => {
      const solarBeginning: DetectedCalendarEvent = {
        description: "Hybrid Solar Eclipse begins (Topocentric Visibility)",
        end: moment.utc("2024-04-08T18:00:00.000Z"),
        start: moment.utc("2024-04-08T18:00:00.000Z"),
        summary: "📍 ☀️🐉▶️ Solar Eclipse begins",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Solar",
          "Topocentric Visibility",
          "Hybrid",
        ],
      };
      const solarEnding: DetectedCalendarEvent = {
        description: "Solar Eclipse ends (Topocentric Visibility)",
        end: moment.utc("2024-04-08T19:00:00.000Z"),
        start: moment.utc("2024-04-08T19:00:00.000Z"),
        summary: "📍 ☀️🐉◀️ Solar Eclipse ends",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Solar",
          "Topocentric Visibility",
        ],
      };
      const lunarBeginning: DetectedCalendarEvent = {
        description: "Total Lunar Eclipse begins (Topocentric Visibility)",
        end: moment.utc("2024-09-18T02:00:00.000Z"),
        start: moment.utc("2024-09-18T02:00:00.000Z"),
        summary: "📍 🌙🐉▶️ Lunar Eclipse begins",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Lunar",
          "Topocentric Visibility",
          "Total",
        ],
      };
      const lunarEnding: DetectedCalendarEvent = {
        description: "Lunar Eclipse ends (Topocentric Visibility)",
        end: moment.utc("2024-09-18T03:00:00.000Z"),
        start: moment.utc("2024-09-18T03:00:00.000Z"),
        summary: "📍 🌙🐉◀️ Lunar Eclipse ends",
        tags: [
          "Astronomy",
          "Astrology",
          "Eclipse",
          "Lunar",
          "Topocentric Visibility",
        ],
      };

      vi.mocked(progressiveUtilitiesService.pairProgressiveEvents)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([[lunarBeginning, lunarEnding]])
        .mockReturnValueOnce([[solarBeginning, solarEnding]]);

      const progressiveEvents = service.detectProgressive([
        solarBeginning,
        solarEnding,
        lunarBeginning,
        lunarEnding,
      ]);

      expect(progressiveEvents).toHaveLength(2);

      const solarDurationEvent = progressiveEvents.find((event) =>
        event.tags.includes("Solar"),
      );
      const lunarDurationEvent = progressiveEvents.find((event) =>
        event.tags.includes("Lunar"),
      );

      expect(solarDurationEvent?.description).toBe(
        "Hybrid Solar Eclipse (Topocentric Visibility)",
      );
      expect(solarDurationEvent?.summary).toBe(
        "📍 ☀️🐉 Hybrid Solar Eclipse (Topocentric Visibility)",
      );
      expect(lunarDurationEvent?.description).toBe(
        "Total Lunar Eclipse (Topocentric Visibility)",
      );
      expect(lunarDurationEvent?.summary).toBe(
        "📍 🌙🐉 Total Lunar Eclipse (Topocentric Visibility)",
      );
    });
  });
});
