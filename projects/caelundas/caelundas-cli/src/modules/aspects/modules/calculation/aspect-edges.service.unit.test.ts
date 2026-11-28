import { createMock } from "@golevelup/ts-vitest";
import moment from "moment-timezone";
import { describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";
import { MathService } from "../../../ephemeris/modules/math/math.service";
import { AspectsUtilitiesService } from "../utilities/aspects-utilities.service";

import { AspectEdgesService } from "./aspect-edges.service";

import type { Body } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { EphemerisService } from "../../../ephemeris/ephemeris.service";
import type { CoordinateEphemeris } from "../../../ephemeris/ephemeris.types";
import type { AspectBodies, SimpleAspectDetector } from "../../aspects.types";
import type { Moment } from "moment-timezone";

const DAY = 86_400_000;
const MINUTE = 60_000;
const origin = moment.utc("2026-01-01T00:00:00Z");
const atDay = (days: number): Moment =>
  moment.utc(origin.valueOf() + days * DAY);

/** Sun fixed at 100°; Moon passes it at 13° a day. */
const sunLongitude = 100;
const moonLongitude = (milliseconds: number): number =>
  100 + ((milliseconds - atDay(10).valueOf()) / DAY) * 13;
const inOrb = (milliseconds: number): boolean =>
  Math.abs(moonLongitude(milliseconds) - sunLongitude) <= 8;

/** A simple aspect's boundary event, as the sweep emits it. */
function boundary(
  label: "Dissolving" | "Forming",
  minute: Moment,
  bodies: [string, string] = ["Moon", "Sun"],
): DetectedCalendarEvent {
  return {
    description: `${bodies[0]} ${label.toLowerCase()} conjunct ${bodies[1]}`,
    end: minute,
    start: minute,
    summary: `${bodies[0]} conjunct ${bodies[1]}`,
    tags: [
      "Astronomy",
      "Astrology",
      "Simple Aspect",
      "Major Aspect",
      ...bodies,
      "Conjunct",
      label,
    ],
  };
}

/** Builds the service over a stand-in sky: a detector that sees the Moon pass the Sun. */
function buildService(args: { active?: AspectBodies[] } = {}): {
  detector: SimpleAspectDetector;
  search: BoundarySearchService;
  service: AspectEdgesService;
} {
  const ephemeris = createMock<EphemerisService>();
  ephemeris.getCoordinateEphemerisByBody.mockImplementation(
    ({ bodies, end, start }) => {
      const longitudeOf = (body: Body, milliseconds: number): number =>
        body === "sun" ? sunLongitude : moonLongitude(milliseconds);

      return Object.fromEntries(
        bodies.map((body): [Body, CoordinateEphemeris] => {
          const record: CoordinateEphemeris = {};
          for (
            const minute = start.clone();
            !minute.isAfter(end);
            minute.add(1, "minute")
          ) {
            record[minute.toISOString()] = {
              latitude: 0,
              longitude: longitudeOf(body, minute.valueOf()),
            };
          }
          return [body, record];
        }),
      ) as ReturnType<EphemerisService["getCoordinateEphemerisByBody"]>;
    },
  );
  ephemeris.getCoordinateFromEphemeris.mockImplementation(
    (data, timestamp) => data[timestamp]?.longitude ?? Number.NaN,
  );
  const detector: SimpleAspectDetector = {
    detect: vi.fn<SimpleAspectDetector["detect"]>(({ minute }) => {
      const at = minute.valueOf();
      if (inOrb(at) && !inOrb(at - MINUTE)) {
        return [boundary("Forming", minute)];
      }
      if (inOrb(at) && !inOrb(at + MINUTE)) {
        return [boundary("Dissolving", minute)];
      }
      return [];
    }),
    detectActive: vi.fn<SimpleAspectDetector["detectActive"]>(
      () => args.active ?? [],
    ),
  };
  const search = new BoundarySearchService();

  return {
    detector,
    search,
    service: new AspectEdgesService(
      [detector],
      new AspectsUtilitiesService(new MathService()),
      search,
      ephemeris,
      new LoggerService(),
    ),
  };
}

/** The first minute at or after `from` that is, or is not, in orb, found by scanning. */
function scan(from: number, direction: -1 | 1, wanted: boolean): number {
  let minute = from;
  while (inOrb(minute) !== wanted) {
    minute += direction * MINUTE;
  }
  return minute;
}

describe(AspectEdgesService, () => {
  const window = { end: atDay(10.2), start: atDay(9.6) };

  it("gives an aspect already in orb at the window start the forming event it lacks, at its true minute", () => {
    const { service } = buildService();
    const dissolving = boundary("Dissolving", atDay(10.6));

    const edges = service.complete([dissolving], {
      end: atDay(11),
      start: window.start,
    });

    expect(edges).toHaveLength(1);
    expect(edges[0]?.tags).toContain("Forming");
    expect(edges[0]?.start.valueOf()).toBe(
      scan(atDay(9.6).valueOf(), -1, false) + MINUTE,
    );
  });

  it("gives an aspect still in orb at the window end the dissolving event it lacks, at its true minute", () => {
    const { service } = buildService();
    const forming = boundary("Forming", atDay(9.7));

    const edges = service.complete([forming], window);

    expect(edges).toHaveLength(1);
    expect(edges[0]?.tags).toContain("Dissolving");
    expect(edges[0]?.start.valueOf()).toBe(
      scan(window.end.valueOf(), 1, false) - MINUTE,
    );
  });

  it("completes both edges of an aspect in orb through the whole window, which has no events at all", () => {
    const { service } = buildService({
      active: [{ aspect: "conjunct", bodies: ["moon", "sun"] }],
    });

    const edges = service.complete([], window);

    expect(edges.map((edge) => edge.tags.at(-1))).toStrictEqual([
      "Forming",
      "Dissolving",
    ]);
  });

  it("adds nothing to an aspect that forms and dissolves inside the window", () => {
    const { service } = buildService();

    expect(
      service.complete(
        [boundary("Forming", atDay(9.7)), boundary("Dissolving", atDay(10.5))],
        { end: atDay(11), start: atDay(9.6) },
      ),
    ).toStrictEqual([]);
  });

  it("completes only the edge of an aspect that dissolves, forms again and is still in orb", () => {
    const { service } = buildService();

    const edges = service.complete(
      [
        boundary("Dissolving", atDay(9.8)),
        boundary("Forming", atDay(10)),
        boundary("Forming", atDay(10.1)),
      ],
      window,
    );

    expect(edges.map((edge) => edge.tags.at(-1))).toStrictEqual([
      "Forming",
      "Dissolving",
    ]);
  });

  it("skips an edge the pair is no longer in orb at", () => {
    const { service } = buildService({
      active: [{ aspect: "conjunct", bodies: ["moon", "sun"] }],
    });

    const edges = service.complete([], { end: atDay(11), start: window.start });

    expect(edges.map((edge) => edge.tags.at(-1))).toStrictEqual(["Forming"]);
  });

  it("ignores events that are no simple aspect's forming or dissolving", () => {
    const { service } = buildService();
    const exact: DetectedCalendarEvent = {
      ...boundary("Forming", atDay(10)),
      tags: boundary("Forming", atDay(10)).tags.filter(
        (tag) => tag !== "Forming",
      ),
    };
    const compound: DetectedCalendarEvent = {
      ...boundary("Forming", atDay(10)),
      tags: ["Astronomy", "Astrology", "Compound Aspect", "Forming"],
    };
    const threeBodies: DetectedCalendarEvent = {
      ...boundary("Forming", atDay(10)),
      tags: [...boundary("Forming", atDay(10)).tags, "Mars"],
    };
    const bothPhases: DetectedCalendarEvent = {
      ...boundary("Forming", atDay(10)),
      tags: [...boundary("Forming", atDay(10)).tags, "Dissolving"],
    };
    const noAspect: DetectedCalendarEvent = {
      ...boundary("Forming", atDay(10)),
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Moon",
        "Sun",
        "Forming",
      ],
    };

    expect(
      service.complete(
        [exact, compound, threeBodies, bothPhases, noAspect],
        window,
      ),
    ).toStrictEqual([]);
  });

  it("leaves an edge without an event when the detectors give none there", () => {
    const { detector, service } = buildService();
    vi.mocked(detector.detect).mockReturnValue([]);

    expect(
      service.complete([boundary("Dissolving", atDay(10.6))], {
        end: atDay(11),
        start: window.start,
      }),
    ).toStrictEqual([]);
  });

  it("clips a pair still in orb at the start of the ephemeris range at that range's first minute", () => {
    const { detector, search, service } = buildService();
    vi.spyOn(search, "find").mockReturnValue(undefined);
    const separations: number[] = [];
    vi.mocked(detector.detect).mockImplementation(
      ({ coordinateEphemerisByBody, minute }) => {
        const longitudeAt = (offset: number): number =>
          coordinateEphemerisByBody.moon[
            minute.clone().add(offset, "minutes").toISOString()
          ]?.longitude ?? Number.NaN;
        separations.push(Math.abs(longitudeAt(-1) - longitudeAt(0)));

        return [boundary("Forming", minute)];
      },
    );

    const edges = service.complete([boundary("Dissolving", atDay(10.6))], {
      end: atDay(11),
      start: window.start,
    });

    expect(edges[0]?.start.toISOString()).toBe("1900-01-01T00:00:00.000Z");
    expect(separations[0]).toBeGreaterThanOrEqual(20);
  });

  it("clips a pair still in orb at the end of the ephemeris range at that range's last minute", () => {
    const { detector, search, service } = buildService();
    vi.spyOn(search, "find").mockReturnValue(undefined);
    vi.mocked(detector.detect).mockImplementation(({ minute }) => [
      boundary("Dissolving", minute),
    ]);

    const edges = service.complete([boundary("Forming", atDay(9.7))], window);

    expect(edges[0]?.start.toISOString()).toBe("2100-12-31T23:59:00.000Z");
  });

  it("probes a pair of slow bodies a day at a time and any other pair a quarter day", () => {
    const steps: number[] = [];

    for (const bodies of [
      ["jupiter", "saturn"],
      ["moon", "sun"],
    ] as const) {
      const { search, service } = buildService({
        active: [{ aspect: "conjunct", bodies: [...bodies] }],
      });
      vi.spyOn(search, "find").mockImplementation((args) => {
        steps.push(args.stepMinutes);
        return undefined;
      });

      service.complete([], window);
    }

    expect(steps).toStrictEqual([1440, 1440, 360, 360]);
  });
});
