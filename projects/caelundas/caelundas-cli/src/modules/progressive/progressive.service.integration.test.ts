import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import _ from "lodash";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { MajorAspectEventService } from "../aspects/modules/major-aspects/major-aspect-event.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { inputSchema } from "../input/input.constants";
import { RetrogradesService } from "../perfective/modules/retrogrades/retrogrades.service";
import { TwilightsService } from "../perfective/modules/twilights/twilights.service";

import { ProgressiveModule } from "./progressive.module";
import { ProgressiveService } from "./progressive.service";

import type { Body } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";

/** Timeout for a pass that searches window edges, sized for CI. */
const EDGE_SEARCH_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Progressive-step tests: the real progressive pass, fed hand-built perfective
 * events and no ephemeris, for windows that open in the middle of an
 * occurrence. Each one used to shift every later span by one occurrence.
 */
describe("progressiveService span pairing", () => {
  let progressiveService: ProgressiveService;
  let majorAspectEventService: MajorAspectEventService;
  let retrogradesService: RetrogradesService;
  let ephemerisService: EphemerisService;
  let twilightsService: TwilightsService;

  const at = (iso: string): moment.Moment => moment.utc(iso);

  // A sweep of a window takes seconds and its events are only read, so each
  // window is swept once however many tests ask about it.
  const sweeps = new Map<string, DetectedCalendarEvent[]>();
  const sweepWindow = (
    input: ReturnType<typeof inputSchema.parse>,
  ): DetectedCalendarEvent[] => {
    const key = [
      input.start.toISOString(),
      input.end.toISOString(),
      input.latitude,
      input.longitude,
    ].join("|");
    const known = sweeps.get(key);

    if (known !== undefined) {
      return known;
    }

    const events = progressiveService.detect([], input);

    sweeps.set(key, events);

    return events;
  };
  const spans = (
    events: DetectedCalendarEvent[],
    summary: string,
  ): { end: string; start: string }[] =>
    events
      .filter((event) => event.summary === summary)
      .map((event) => ({
        end: event.end.toISOString(),
        start: event.start.toISOString(),
      }))
      .toSorted((first, second) => first.start.localeCompare(second.start));

  const expectNoInvertedSpans = (events: DetectedCalendarEvent[]): void => {
    const inverted = events.filter((event) => event.end.isBefore(event.start));

    expect(inverted.map((event) => event.summary)).toStrictEqual([]);
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        LoggerModule,
        ProgressiveModule,
      ],
    }).compile();

    progressiveService = module.get(ProgressiveService);
    majorAspectEventService = module.get(MajorAspectEventService, {
      strict: false,
    });
    retrogradesService = module.get(RetrogradesService, { strict: false });
    ephemerisService = module.get(EphemerisService, { strict: false });
    twilightsService = await module.resolve(TwilightsService, undefined, {
      strict: false,
    });
  });

  it("runs each night from tonight's astronomical dusk to tomorrow's dawn", () => {
    const perfective = [
      twilightsService.buildAstronomicalDawnEvent(at("2026-03-19T09:35:00Z")),
      twilightsService.buildAstronomicalDuskEvent(at("2026-03-20T00:43:00Z")),
      twilightsService.buildAstronomicalDawnEvent(at("2026-03-20T09:33:00Z")),
      twilightsService.buildAstronomicalDuskEvent(at("2026-03-21T00:44:00Z")),
      twilightsService.buildAstronomicalDawnEvent(at("2026-03-21T09:32:00Z")),
      twilightsService.buildAstronomicalDuskEvent(at("2026-03-22T00:45:00Z")),
    ];

    const progressive = progressiveService.detect(perfective);

    expect(spans(progressive, "🌃 Night")).toStrictEqual([
      { end: "2026-03-20T09:33:00.000Z", start: "2026-03-20T00:43:00.000Z" },
      { end: "2026-03-21T09:32:00.000Z", start: "2026-03-21T00:44:00.000Z" },
    ]);

    expectNoInvertedSpans(progressive);
  });

  it("keeps evening astronomical twilight forward when it ends after local midnight", () => {
    const perfective = [
      twilightsService.buildAstronomicalDuskEvent(at("2026-06-19T22:28:00Z")),
      twilightsService.buildNauticalDuskEvent(at("2026-06-20T21:34:00Z")),
      twilightsService.buildAstronomicalDuskEvent(at("2026-06-20T22:29:00Z")),
      twilightsService.buildNauticalDuskEvent(at("2026-06-21T21:34:00Z")),
    ];

    const progressive = progressiveService.detect(perfective);

    expect(
      spans(progressive, "🌌 Astronomical Twilight (Evening)"),
    ).toStrictEqual([
      { end: "2026-06-20T22:29:00.000Z", start: "2026-06-20T21:34:00.000Z" },
    ]);

    expectNoInvertedSpans(progressive);
  });

  it("emits no retrograde span for a window between two Mercury retrogrades", () => {
    // Station times are illustrative: only their order matters to pairing.
    const station = (
      direction: "direct" | "retrograde",
      iso: string,
    ): DetectedCalendarEvent =>
      retrogradesService.buildRetrogradeEvent({
        body: "mercury",
        direction,
        timestamp: at(iso),
      });
    const between = progressiveService.detect([
      station("direct", "2026-07-23T21:00:00Z"),
      station("retrograde", "2026-10-24T07:00:00Z"),
    ]);
    const control = progressiveService.detect([
      station("retrograde", "2026-06-29T17:00:00Z"),
      station("direct", "2026-07-23T21:00:00Z"),
    ]);

    expect(spans(between, "☿↩️ Mercury Retrograde")).toStrictEqual([]);
    expect(spans(control, "☿↩️ Mercury Retrograde")).toStrictEqual([
      { end: "2026-07-23T21:00:00.000Z", start: "2026-06-29T17:00:00.000Z" },
    ]);

    expectNoInvertedSpans(between);
    expectNoInvertedSpans(control);
  });

  it("pairs every later occurrence of an aspect when the window opens inside its orb", () => {
    const aspectEvent = (
      phase: "dissolving" | "forming",
      iso: string,
    ): DetectedCalendarEvent =>
      majorAspectEventService.buildMajorAspectEvent({
        body1: "sun",
        body2: "mars",
        longitudeBody1: 0,
        longitudeBody2: 92,
        phase,
        timestamp: at(iso),
      });
    const perfective = [
      aspectEvent("dissolving", "2026-01-02T00:00:00Z"),
      aspectEvent("forming", "2026-03-01T00:00:00Z"),
      aspectEvent("dissolving", "2026-03-20T00:00:00Z"),
      aspectEvent("forming", "2026-06-01T00:00:00Z"),
      aspectEvent("dissolving", "2026-06-25T00:00:00Z"),
    ];

    const progressive = progressiveService.detect(perfective);
    const aspectSpans = progressive
      .filter((event) => event.tags.includes("Major Aspect"))
      .map((event) => ({
        end: event.end.toISOString(),
        start: event.start.toISOString(),
      }));

    expect(aspectSpans).toStrictEqual([
      { end: "2026-03-20T00:00:00.000Z", start: "2026-03-01T00:00:00.000Z" },
      { end: "2026-06-25T00:00:00.000Z", start: "2026-06-01T00:00:00.000Z" },
    ]);

    expectNoInvertedSpans(progressive);
  });

  describe(
    "windows touching the range's limits",
    { timeout: EDGE_SEARCH_TIMEOUT_MILLISECONDS },
    () => {
      // Greenwich keeps UTC in 1900 and 2100, so the window edges are the limits.
      const greenwich = { latitude: 51.4779, longitude: 0 };
      const first = at("1900-01-01T00:00:00Z");
      const last = at("2100-12-31T23:59:00Z");
      const families = [
        ["a simple aspect", ["Simple Aspect"]],
        ["a compound aspect", ["Compound Aspect"]],
        ["a retrograde period", ["Retrogrades"]],
        ["a direct period", ["Directs"]],
        ["a stay in a sign", ["Ingress"]],
        ["a stay in a decan", ["Decan"]],
        ["a stay on one side of a peak", ["Peak"]],
        ["a Moon phase", ["Monthly Lunar Cycle"]],
        ["a lunar approach or recession", ["Lunar Apsides"]],
        ["a twilight, daylight or night", ["Twilight"]],
        ["a planetary visibility or half of one", ["Planetary Phase"]],
        ["a season", ["Annual Solar Cycle"]],
      ] as const;
      const clipped = (
        window: { endDate: string; startDate: string },
        edge: "end" | "start",
      ): DetectedCalendarEvent[] =>
        sweepWindow(inputSchema.parse({ ...greenwich, ...window })).filter(
          (event) =>
            edge === "start"
              ? event.start.isSame(first)
              : event.end.isSame(last),
        );

      it.each(families)("keeps %s at the first minute", (_name, [tag]) => {
        const events = clipped(
          { endDate: "1900-01-02", startDate: "1900-01-01" },
          "start",
        );

        expect(events.some((event) => event.tags.includes(tag))).toBe(true);
      });

      it.each(families.filter(([, [tag]]) => tag !== "Compound Aspect"))(
        "keeps %s at the last minute",
        (_name, [tag]) => {
          const events = clipped(
            { endDate: "2100-12-31", startDate: "2100-12-30" },
            "end",
          );

          expect(events.some((event) => event.tags.includes(tag))).toBe(true);
        },
      );

      it("leaves no span outside the range or empty", () => {
        for (const [window, edge] of [
          [{ endDate: "1900-01-02", startDate: "1900-01-01" }, "start"],
          [{ endDate: "2100-12-31", startDate: "2100-12-30" }, "end"],
        ] as const) {
          const events = sweepWindow(
            inputSchema.parse({ ...greenwich, ...window }),
          );

          expect(events.every((event) => !event.start.isBefore(first))).toBe(
            true,
          );
          expect(events.every((event) => !event.end.isAfter(last))).toBe(true);
          expect(events.every((event) => event.end.isAfter(event.start))).toBe(
            true,
          );
          expect(clipped(window, edge).length).toBeGreaterThan(0);
        }
      });
    },
  );

  describe(
    "sign stays at the window edges",
    { timeout: EDGE_SEARCH_TIMEOUT_MILLISECONDS },
    () => {
      // None of these crosses a sign boundary on 20-21 March 2026, so with no
      // ingress in view each has exactly one stay, cut off at both ends.
      const slowBodies = [
        "jupiter",
        "neptune",
        "pluto",
        "saturn",
        "uranus",
      ] as const;
      const request = {
        endDate: "2026-03-21",
        latitude: 39.949_309,
        longitude: -75.171_69,
        startDate: "2026-03-20",
      };
      const input = inputSchema.parse(request);
      const staysOf = (
        events: DetectedCalendarEvent[],
        body: Body,
      ): DetectedCalendarEvent[] =>
        events.filter(
          (event) =>
            event.tags.includes("Ingress") &&
            event.tags.includes(_.startCase(body)) &&
            !event.tags.includes("Decan") &&
            !event.tags.includes("Peak"),
        );
      const signIndexAt = (
        body: Body,
        minute: moment.Moment,
        degrees = 30,
      ): number => {
        const ephemeris = ephemerisService.getCoordinateEphemerisByBody({
          bodies: [body],
          end: minute,
          start: minute,
          timezone: "UTC",
        })[body];

        return Math.floor(
          ephemerisService.getCoordinateFromEphemeris(
            ephemeris,
            minute.toISOString(),
            "longitude",
          ) / degrees,
        );
      };

      it("gives each slow body one stay that opens and closes outside the window", () => {
        const events = sweepWindow(input);

        for (const body of slowBodies) {
          const [stay, ...rest] = staysOf(events, body);

          expect(rest).toStrictEqual([]);
          expect(stay?.start.isBefore(input.start)).toBe(true);
          expect(stay?.end.isAfter(input.end.clone().add(1, "day"))).toBe(true);
        }
      });

      it("starts and ends each stay on the minute the sign changes", () => {
        const events = sweepWindow(input);

        for (const body of slowBodies) {
          const [stay] = staysOf(events, body);
          if (stay === undefined) {
            throw new Error(`No stay for ${body}`);
          }
          const inside = signIndexAt(body, stay.start);

          expect(
            signIndexAt(body, stay.start.clone().subtract(1, "minute")),
          ).not.toBe(inside);
          expect(
            signIndexAt(body, stay.end.clone().subtract(1, "minute")),
          ).toBe(inside);
          expect(signIndexAt(body, stay.end)).not.toBe(inside);
        }
      });

      it.each([
        ["Decan", 10],
        ["Peak", 15],
      ] as const)(
        "starts and ends each %s stay on the minute its slice changes",
        (tag, degrees) => {
          const events = sweepWindow(input);

          for (const body of slowBodies) {
            const [stay, ...rest] = events.filter(
              (event) =>
                event.tags.includes(tag) &&
                event.tags.includes(_.startCase(body)),
            );
            if (stay === undefined) {
              throw new Error(`No ${tag} stay for ${body}`);
            }
            const inside = signIndexAt(body, stay.start, degrees);

            expect(rest).toStrictEqual([]);
            expect(stay.start.isBefore(input.start)).toBe(true);
            expect(stay.end.isAfter(input.end.clone().add(1, "day"))).toBe(
              true,
            );
            expect(
              signIndexAt(
                body,
                stay.start.clone().subtract(1, "minute"),
                degrees,
              ),
            ).not.toBe(inside);
            expect(
              signIndexAt(
                body,
                stay.end.clone().subtract(1, "minute"),
                degrees,
              ),
            ).toBe(inside);
            expect(signIndexAt(body, stay.end, degrees)).not.toBe(inside);
          }
        },
      );

      it("is the same stay whichever window finds it", () => {
        const later = inputSchema.parse({
          ...request,
          endDate: "2026-03-23",
          startDate: "2026-03-22",
        });
        const key = (events: DetectedCalendarEvent[]): string[] =>
          staysOf(events, "pluto").map(
            (event) =>
              `${event.summary}|${event.start.toISOString()}|${event.end.toISOString()}`,
          );

        expect(key(sweepWindow(later))).toStrictEqual(key(sweepWindow(input)));
      });
    },
  );
});
