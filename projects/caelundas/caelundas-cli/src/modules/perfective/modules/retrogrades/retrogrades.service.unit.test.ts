import moment, { type Moment } from "moment-timezone";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MARGIN_MINUTES } from "../../../caelundas/caelundas.constants";
import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";
import { MathService } from "../../../ephemeris/modules/math/math.service";
import { ProgressiveUtilitiesService } from "../../../progressive/progressive-utilities.service";

import { RetrogradesService } from "./retrogrades.service";

import type { RetrogradeBody } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../../../ephemeris/ephemeris.types";

const MINUTE_MILLISECONDS = 60_000;

describe(RetrogradesService, () => {
  let service: RetrogradesService;
  let ephemerisService: EphemerisService;
  let boundarySearchService: BoundarySearchService;
  let s: ServicePrivate;

  const testingModuleOptions = {
    imports: [BoundarySearchModule, EphemerisModule],
    providers: [MathService, ProgressiveUtilitiesService],
  };

  beforeAll(async () => {
    const { instance, module } = await buildTestingModule(
      RetrogradesService,
      testingModuleOptions,
    );
    service = instance;
    ephemerisService = module.get(EphemerisService);
    boundarySearchService = module.get(BoundarySearchService);
    s = service as unknown as ServicePrivate;
  });

  // Helper to create ephemeris data with margin
  function createCoordinateEphemeris(
    currentMinute: Moment,
    longitudes: number[],
  ): CoordinateEphemeris {
    const ephemeris: CoordinateEphemeris = {};
    const totalMinutes = MARGIN_MINUTES * 2 + 1;

    for (let index = 0; index < totalMinutes; index++) {
      const minute = currentMinute
        .clone()
        .subtract(MARGIN_MINUTES - index, "minutes");
      const longitude = longitudes[index] ?? longitudes.at(-1) ?? 0;
      ephemeris[minute.toISOString()] = {
        latitude: 0,
        longitude,
      };
    }

    return ephemeris;
  }

  describe("detect", () => {
    it("detects retrograde station when longitude starts decreasing", () => {
      const currentMinute = moment.utc("2024-04-01T12:00:00.000Z");

      // Mercury slowing down and then going retrograde
      // Longitudes increasing slower then decreasing (retrograde)
      const longitudes: number[] = [];
      for (let index = 0; index < MARGIN_MINUTES; index++) {
        // Previous: increasing toward maximum
        longitudes.push(100 + index * 0.001);
      }
      longitudes.push(100 + MARGIN_MINUTES * 0.001); // Current at peak
      for (let index = 0; index < MARGIN_MINUTES; index++) {
        // Next: decreasing (retrograde)
        longitudes.push(100 + MARGIN_MINUTES * 0.001 - (index + 1) * 0.001);
      }

      const mercuryEphemeris = createCoordinateEphemeris(
        currentMinute,
        longitudes,
      );

      // Create empty ephemeris for other bodies
      const emptyEphemeris: CoordinateEphemeris = {};
      for (let index = -MARGIN_MINUTES; index <= MARGIN_MINUTES; index++) {
        const minute = currentMinute.clone().add(index, "minutes");
        emptyEphemeris[minute.toISOString()] = { latitude: 0, longitude: 0 };
      }

      const coordinateEphemerisByBody: Record<
        RetrogradeBody,
        CoordinateEphemeris
      > = {
        ceres: emptyEphemeris,
        chiron: emptyEphemeris,
        juno: emptyEphemeris,
        jupiter: emptyEphemeris,
        mars: emptyEphemeris,
        mercury: mercuryEphemeris,
        neptune: emptyEphemeris,
        pallas: emptyEphemeris,
        pluto: emptyEphemeris,
        saturn: emptyEphemeris,
        uranus: emptyEphemeris,
        venus: emptyEphemeris,
        vesta: emptyEphemeris,
      };

      const events = service.detect({
        coordinateEphemerisByBody,
        minute: currentMinute,
      });

      const mercuryRetrograde = events.find(
        (e) =>
          e.description.includes("Mercury") &&
          e.description.includes("Retrograde"),
      );

      expect(mercuryRetrograde).toBeDefined();
    });

    it("returns empty array when no retrograde events occur", () => {
      const currentMinute = moment.utc("2024-04-01T12:00:00.000Z");

      // All planets moving direct (increasing longitude)
      const directLongitudes: number[] = [];
      for (let index = 0; index < MARGIN_MINUTES * 2 + 1; index++) {
        directLongitudes.push(100 + index * 0.01);
      }

      const directEphemeris = createCoordinateEphemeris(
        currentMinute,
        directLongitudes,
      );

      const coordinateEphemerisByBody: Record<
        RetrogradeBody,
        CoordinateEphemeris
      > = {
        ceres: directEphemeris,
        chiron: directEphemeris,
        juno: directEphemeris,
        jupiter: directEphemeris,
        mars: directEphemeris,
        mercury: directEphemeris,
        neptune: directEphemeris,
        pallas: directEphemeris,
        pluto: directEphemeris,
        saturn: directEphemeris,
        uranus: directEphemeris,
        venus: directEphemeris,
        vesta: directEphemeris,
      };

      const events = service.detect({
        coordinateEphemerisByBody,
        minute: currentMinute,
      });

      expect(events).toHaveLength(0);
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      RetrogradesService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(RetrogradesService);
  });

  describe("getRetrogradeEvent", () => {
    it("creates a retrograde event with correct structure", () => {
      const timestamp = moment.utc("2024-04-01T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "mercury",
        direction: "retrograde",
        timestamp,
      });

      expect(event.summary).toBe("☿↩️ Mercury Stationary Retrograde");
      expect(event.description).toBe("Mercury Stationary Retrograde");
      expect(event.start).toStrictEqual(timestamp);
      expect(event.end).toStrictEqual(timestamp);
      expect(event.tags).toContain("Astronomy");
      expect(event.tags).toContain("Astrology");
      expect(event.tags).toContain("Direction");
      expect(event.tags).toContain("Retrograde");
      expect(event.tags).toContain("Mercury");
    });

    it("creates a direct event with correct structure", () => {
      const timestamp = moment.utc("2024-04-25T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "mercury",
        direction: "direct",
        timestamp,
      });

      expect(event.summary).toBe("☿↪️ Mercury Stationary Direct");
      expect(event.description).toBe("Mercury Stationary Direct");
      expect(event.tags).toContain("Direct");
      expect(event.tags).not.toContain("Retrograde");
    });

    it("uses correct symbol for Venus", () => {
      const timestamp = moment.utc("2024-07-22T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "venus",
        direction: "retrograde",
        timestamp,
      });

      expect(event.summary).toBe("♀️↩️ Venus Stationary Retrograde");
    });

    it("uses correct symbol for Mars", () => {
      const timestamp = moment.utc("2024-12-06T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "mars",
        direction: "retrograde",
        timestamp,
      });

      expect(event.summary).toBe("♂️↩️ Mars Stationary Retrograde");
    });

    it("uses correct symbol for Jupiter", () => {
      const timestamp = moment.utc("2024-10-09T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "jupiter",
        direction: "retrograde",
        timestamp,
      });

      expect(event.summary).toBe("♃↩️ Jupiter Stationary Retrograde");
    });

    it("uses correct symbol for Saturn", () => {
      const timestamp = moment.utc("2024-06-29T12:00:00.000Z");

      const event = service.buildRetrogradeEvent({
        body: "saturn",
        direction: "retrograde",
        timestamp,
      });

      expect(event.summary).toBe("♄↩️ Saturn Stationary Retrograde");
    });
  });

  describe("detectProgressive", () => {
    it("creates progressive event from retrograde to direct", () => {
      const retrogradeEvent: DetectedCalendarEvent = {
        description: "Mercury Stationary Retrograde",
        end: moment.utc("2024-04-01T12:00:00.000Z"),
        start: moment.utc("2024-04-01T12:00:00.000Z"),
        summary: "☿↩️ Mercury Stationary Retrograde",
        tags: ["Astronomy", "Astrology", "Direction", "Retrograde"],
      };
      const directEvent: DetectedCalendarEvent = {
        description: "Mercury Stationary Direct",
        end: moment.utc("2024-04-25T12:00:00.000Z"),
        start: moment.utc("2024-04-25T12:00:00.000Z"),
        summary: "☿↪️ Mercury Stationary Direct",
        tags: ["Astronomy", "Astrology", "Direction", "Direct"],
      };

      const progressiveEvents = service.detectProgressive([
        retrogradeEvent,
        directEvent,
      ]);

      // Should create progressive events for each planet that has retrograde/direct pairs
      expect(progressiveEvents.length).toBeGreaterThanOrEqual(1);

      const mercuryDuration = progressiveEvents.find(
        (e) =>
          e.description.includes("Mercury") &&
          e.description.includes("Retrograde"),
      );

      expect(mercuryDuration).toStrictEqual(
        expect.objectContaining({
          end: directEvent.start,
          start: retrogradeEvent.start,
        }),
      );
      expect(mercuryDuration?.summary).toContain("Retrograde");
    });

    it("draws the body symbol whatever the source summary says", () => {
      const internals = service as unknown as {
        getRetrogradeProgressiveEvent: (
          beginningEvent: DetectedCalendarEvent,
          endingEvent: DetectedCalendarEvent,
          planet: "mercury",
        ) => DetectedCalendarEvent;
      };
      const beginningEvent: DetectedCalendarEvent = {
        description: "Mercury Stationary Retrograde",
        end: moment.utc("2024-04-01T12:00:00.000Z"),
        start: moment.utc("2024-04-01T12:00:00.000Z"),
        summary: "",
        tags: ["Astronomy", "Astrology", "Direction", "Retrograde"],
      };
      const endingEvent: DetectedCalendarEvent = {
        description: "Mercury Stationary Direct",
        end: moment.utc("2024-04-25T12:00:00.000Z"),
        start: moment.utc("2024-04-25T12:00:00.000Z"),
        summary: "☿↪️ Mercury Stationary Direct",
        tags: ["Astronomy", "Astrology", "Direction", "Direct"],
      };

      const progressive = internals.getRetrogradeProgressiveEvent(
        beginningEvent,
        endingEvent,
        "mercury",
      );

      expect(progressive.summary).toBe("☿↩️ Mercury Retrograde");
      expect(progressive.tags).toContain("Mercury");
    });

    it("returns empty array when no direction events provided", () => {
      const progressiveEvents = service.detectProgressive([]);

      expect(progressiveEvents).toHaveLength(0);
    });

    it("handles multiple planets retrograde periods", () => {
      const mercuryRetrograde: DetectedCalendarEvent = {
        description: "Mercury Stationary Retrograde",
        end: moment.utc("2024-04-01T12:00:00.000Z"),
        start: moment.utc("2024-04-01T12:00:00.000Z"),
        summary: "☿↩️ Mercury Stationary Retrograde",
        tags: ["Astronomy", "Astrology", "Direction", "Retrograde"],
      };
      const mercuryDirect: DetectedCalendarEvent = {
        description: "Mercury Stationary Direct",
        end: moment.utc("2024-04-25T12:00:00.000Z"),
        start: moment.utc("2024-04-25T12:00:00.000Z"),
        summary: "☿↪️ Mercury Stationary Direct",
        tags: ["Astronomy", "Astrology", "Direction", "Direct"],
      };
      const venusRetrograde: DetectedCalendarEvent = {
        description: "Venus Stationary Retrograde",
        end: moment.utc("2024-07-22T12:00:00.000Z"),
        start: moment.utc("2024-07-22T12:00:00.000Z"),
        summary: "♀️↩️ Venus Stationary Retrograde",
        tags: ["Astronomy", "Astrology", "Direction", "Retrograde"],
      };
      const venusDirect: DetectedCalendarEvent = {
        description: "Venus Stationary Direct",
        end: moment.utc("2024-09-03T12:00:00.000Z"),
        start: moment.utc("2024-09-03T12:00:00.000Z"),
        summary: "♀️↪️ Venus Stationary Direct",
        tags: ["Astronomy", "Astrology", "Direction", "Direct"],
      };

      const progressiveEvents = service.detectProgressive([
        mercuryRetrograde,
        mercuryDirect,
        venusRetrograde,
        venusDirect,
      ]);

      expect(
        progressiveEvents.map(({ end, start, summary }) => ({
          end: end.toISOString(),
          start: start.toISOString(),
          summary,
        })),
      ).toStrictEqual([
        {
          end: mercuryDirect.start.toISOString(),
          start: mercuryRetrograde.start.toISOString(),
          summary: "☿↩️ Mercury Retrograde",
        },
        {
          end: venusDirect.start.toISOString(),
          start: venusRetrograde.start.toISOString(),
          summary: "♀️↩️ Venus Retrograde",
        },
      ]);
    });

    it("never pairs one planet's station with another planet's", () => {
      const venusRetrograde: DetectedCalendarEvent = {
        description: "Venus Stationary Retrograde",
        end: moment.utc("2026-10-03T07:16:00.000Z"),
        start: moment.utc("2026-10-03T07:16:00.000Z"),
        summary: "♀️↩️ Venus Stationary Retrograde",
        tags: ["Astronomy", "Astrology", "Direction", "Retrograde"],
      };
      const plutoDirect: DetectedCalendarEvent = {
        description: "Pluto Stationary Direct",
        end: moment.utc("2026-10-16T02:40:00.000Z"),
        start: moment.utc("2026-10-16T02:40:00.000Z"),
        summary: "♇↪️ Pluto Stationary Direct",
        tags: ["Astronomy", "Astrology", "Direction", "Direct"],
      };

      expect(
        service.detectProgressive([venusRetrograde, plutoDirect]),
      ).toStrictEqual([]);
    });
  });

  describe("direct periods", () => {
    const station = (
      body: string,
      direction: "Direct" | "Retrograde",
      iso: string,
    ): DetectedCalendarEvent => ({
      description: `${body} Stationary ${direction}`,
      end: moment.utc(iso),
      start: moment.utc(iso),
      summary: `${body} Stationary ${direction}`,
      tags: ["Astronomy", "Astrology", "Direction", direction],
    });

    it("spans the time a planet moves forward, from a direct station to the next retrograde one", () => {
      const spans = service.detectProgressive([
        station("Mercury", "Retrograde", "2024-04-01T12:00:00.000Z"),
        station("Mercury", "Direct", "2024-04-25T12:00:00.000Z"),
        station("Mercury", "Retrograde", "2024-08-05T12:00:00.000Z"),
      ]);

      expect(
        spans.map(({ description, end, start, tags }) => [
          description,
          start.toISOString(),
          end.toISOString(),
          tags.at(-2),
        ]),
      ).toStrictEqual([
        [
          "Mercury Retrograde",
          "2024-04-01T12:00:00.000Z",
          "2024-04-25T12:00:00.000Z",
          "Retrogrades",
        ],
        [
          "Mercury Direct",
          "2024-04-25T12:00:00.000Z",
          "2024-08-05T12:00:00.000Z",
          "Directs",
        ],
      ]);
      expect(spans[1]?.summary).toBe("☿↪️ Mercury Direct");
    });

    it("never pairs one planet's direct station with another planet's retrograde", () => {
      expect(
        service.detectProgressive([
          station("Venus", "Direct", "2026-10-03T07:16:00.000Z"),
          station("Pluto", "Retrograde", "2026-10-16T02:40:00.000Z"),
        ]),
      ).toStrictEqual([]);
    });
  });

  // Each test walks the station search over the range for Mercury: a CI
  // run under coverage and load took 65 to 82 s for the two slowest of the
  // earlier all-bodies version, so 60 s leaves room for this one, eight times cheaper.
  describe("detectProgressive over a sweep window", { timeout: 60_000 }, () => {
    const day = (days: number): Moment =>
      moment.utc("2026-01-01T00:00:00.000Z").add(days, "days");

    /** Turns retrograde day 30, direct 90, retrograde 200, direct 300. */
    const longitudeAt = (milliseconds: number): number => {
      const days =
        (milliseconds - day(0).valueOf()) /
        moment.duration(1, "day").asMilliseconds();
      if (days <= 30) return 100 + 0.5 * days;
      if (days <= 90) return 115 - 0.2 * (days - 30);
      if (days <= 200) return 103 + 0.4 * (days - 90);
      if (days <= 300) return 147 - 0.2 * (days - 200);
      return 127 + 0.3 * (days - 300);
    };

    const station = (
      direction: "Direct" | "Retrograde",
      at: Moment,
    ): DetectedCalendarEvent => ({
      description: `Mercury Stationary ${direction}`,
      end: at,
      start: at,
      summary: `Mercury Stationary ${direction}`,
      tags: ["Astronomy", "Astrology", "Direction", direction],
    });

    const mercurySpans = (
      events: DetectedCalendarEvent[],
    ): [string, string, string][] =>
      events
        .filter((event) => event.tags.includes("Mercury"))
        .map((event) => [
          event.description,
          event.start.toISOString(),
          event.end.toISOString(),
        ]);

    /**
     * Answers the ephemeris of every minute, Mercury moving by the given
     * longitude of epoch milliseconds and every other body standing still,
     * as the tests read Mercury's spans alone and a station scan of each of
     * the others would cost eight times as much. It steps plain numbers, as a
     * window spans up to hundreds of thousands of minutes.
     */
    const useLongitude = (
      longitude: (milliseconds: number) => number,
    ): void => {
      vi.spyOn(
        ephemerisService,
        "getCoordinateEphemerisByBody",
      ).mockImplementation(({ bodies, end, start }) => {
        const build = (
          longitudeAtMinute: (milliseconds: number) => number,
        ): CoordinateEphemeris => {
          const ephemeris: CoordinateEphemeris = {};
          for (
            let milliseconds = start.valueOf();
            milliseconds <= end.valueOf();
            milliseconds += MINUTE_MILLISECONDS
          ) {
            ephemeris[new Date(milliseconds).toISOString()] = {
              latitude: 0,
              longitude: longitudeAtMinute(milliseconds),
            };
          }
          return ephemeris;
        };

        return Object.fromEntries(
          bodies.map((body) => [
            body,
            build(body === "mercury" ? longitude : () => 0),
          ]),
        ) as ReturnType<EphemerisService["getCoordinateEphemerisByBody"]>;
      });
    };

    beforeEach(() => {
      useLongitude(longitudeAt);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("begins the retrograde period underway at the true station before the window and ends the last one at the station after it", () => {
      const spans = service.detectProgressive(
        [station("Direct", day(90)), station("Retrograde", day(200))],
        { end: day(250), start: day(50) },
      );

      expect(mercurySpans(spans)).toStrictEqual([
        ["Mercury Retrograde", day(30).toISOString(), day(90).toISOString()],
        ["Mercury Retrograde", day(200).toISOString(), day(300).toISOString()],
        ["Mercury Direct", day(90).toISOString(), day(200).toISOString()],
      ]);
    });

    it("gives a window with no station the direct period it sits inside", () => {
      const spans = service.detectProgressive([], {
        end: day(150),
        start: day(120),
      });

      expect(mercurySpans(spans)).toStrictEqual([
        ["Mercury Direct", day(90).toISOString(), day(200).toISOString()],
      ]);
    });

    describe("at the range's limits", () => {
      const first = moment.utc("1900-01-01T00:00:00.000Z");
      const last = moment.utc("2100-12-31T23:59:00.000Z");
      const daysFrom = (origin: Moment, milliseconds: number): number =>
        (milliseconds - origin.valueOf()) /
        moment.duration(1, "day").asMilliseconds();

      it("begins a direct period at the first minute when the planet was direct before it", () => {
        // Direct for 20 days from the first minute, then retrograde.
        useLongitude((milliseconds) => {
          const days = daysFrom(first, milliseconds);
          return days <= 20 ? 100 + 0.5 * days : 110 - 0.2 * (days - 20);
        });

        const spans = service.detectProgressive([], {
          end: first.clone().add(5, "days"),
          start: first,
        });

        expect(
          spans
            .filter((event) => event.tags.includes("Mercury"))
            .map((event) => [
              event.description,
              event.start.toISOString(),
              event.end.toISOString(),
            ]),
        ).toStrictEqual([
          [
            "Mercury Direct",
            "1900-01-01T00:00:00.000Z",
            first.clone().add(20, "days").toISOString(),
          ],
        ]);
      });

      it("ends a retrograde period at the last minute when the planet stays retrograde past it", () => {
        // Direct until 20 days before the last minute, then retrograde.
        useLongitude((milliseconds) => {
          const days = daysFrom(last, milliseconds);
          return days <= -20 ? 100 + 0.5 * days : 90 - 0.2 * (days + 20);
        });

        const spans = service.detectProgressive([], {
          end: last,
          start: last.clone().subtract(5, "days"),
        });

        expect(
          spans
            .filter((event) => event.tags.includes("Mercury"))
            .map((event) => [
              event.description,
              event.start.toISOString(),
              event.end.toISOString(),
            ]),
        ).toStrictEqual([
          [
            "Mercury Retrograde",
            last.clone().subtract(20, "days").toISOString(),
            "2100-12-31T23:59:00.000Z",
          ],
        ]);
      });
    });

    it("leaves a period out when the station search gives up before the range ends", () => {
      vi.spyOn(boundarySearchService, "find").mockReturnValue(undefined);

      expect(
        service.detectProgressive([station("Direct", day(90))], {
          end: day(250),
          start: day(50),
        }),
      ).toStrictEqual([]);
    });
  });

  interface ServicePrivate {
    isDirect: (args: {
      currentLongitude: number;
      nextLongitudes: number[];
      previousLongitudes: number[];
    }) => boolean;
    isRetrograde: (args: {
      currentLongitude: number;
      nextLongitudes: number[];
      previousLongitudes: number[];
    }) => boolean;
  }

  describe("isRetrograde", () => {
    it("returns true when planet stations retrograde", () => {
      const result = s.isRetrograde({
        currentLongitude: 100,
        nextLongitudes: [100, 99], // Will be same or decreasing (retrograde)
        previousLongitudes: [98, 99], // Was increasing (direct motion)
      });

      expect(result).toBe(true);
    });

    it("returns false when planet continues direct motion", () => {
      const result = s.isRetrograde({
        currentLongitude: 100,
        nextLongitudes: [101, 102],
        previousLongitudes: [98, 99],
      });

      expect(result).toBe(false);
    });

    it("returns false when planet is already retrograde", () => {
      const result = s.isRetrograde({
        currentLongitude: 100,
        nextLongitudes: [99, 98],
        previousLongitudes: [102, 101], // Was decreasing (already retrograde)
      });

      expect(result).toBe(false);
    });

    it("handles 0/360 boundary crossing correctly", () => {
      const result = s.isRetrograde({
        currentLongitude: 5,
        nextLongitudes: [5, 4], // Will be retrograde
        previousLongitudes: [358, 360], // Effectively 358, 0 - was direct
      });

      expect(result).toBe(true);
    });

    it("returns false when not all previous longitudes indicate direct motion", () => {
      const result = s.isRetrograde({
        currentLongitude: 100,
        nextLongitudes: [100, 99],
        previousLongitudes: [101, 99], // Mixed - not all direct
      });

      expect(result).toBe(false);
    });

    it("returns false when not all next longitudes indicate retrograde", () => {
      const result = s.isRetrograde({
        currentLongitude: 100,
        nextLongitudes: [99, 101], // Mixed - not all retrograde
        previousLongitudes: [98, 99],
      });

      expect(result).toBe(false);
    });
  });

  describe("isDirect", () => {
    it("returns true when planet stations direct", () => {
      const result = s.isDirect({
        currentLongitude: 100,
        nextLongitudes: [100, 101], // Will be same or increasing (direct)
        previousLongitudes: [102, 101], // Was decreasing (retrograde motion)
      });

      expect(result).toBe(true);
    });

    it("returns false when planet continues retrograde motion", () => {
      const result = s.isDirect({
        currentLongitude: 100,
        nextLongitudes: [99, 98],
        previousLongitudes: [102, 101],
      });

      expect(result).toBe(false);
    });

    it("returns false when planet is already direct", () => {
      const result = s.isDirect({
        currentLongitude: 100,
        nextLongitudes: [101, 102],
        previousLongitudes: [98, 99], // Was increasing (already direct)
      });

      expect(result).toBe(false);
    });

    it("handles 0/360 boundary crossing correctly", () => {
      const result = s.isDirect({
        currentLongitude: 355,
        nextLongitudes: [355, 356], // Will be direct
        previousLongitudes: [358, 357], // Was retrograde
      });

      expect(result).toBe(true);
    });

    it("returns false when not all previous longitudes indicate retrograde motion", () => {
      const result = s.isDirect({
        currentLongitude: 100,
        nextLongitudes: [100, 101],
        previousLongitudes: [99, 101], // Mixed - not all retrograde
      });

      expect(result).toBe(false);
    });

    it("returns false when not all next longitudes indicate direct motion", () => {
      const result = s.isDirect({
        currentLongitude: 100,
        nextLongitudes: [101, 99], // Mixed - not all direct
        previousLongitudes: [102, 101],
      });

      expect(result).toBe(false);
    });
  });
});
