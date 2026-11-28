import { createMock } from "@golevelup/ts-vitest";
import moment, { type Moment } from "moment-timezone";
import { describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import { SignTransitsService } from "./sign-transits.service";

import type { Body } from "../../../caelundas/caelundas.types";
import type { EphemerisService } from "../../../ephemeris/ephemeris.service";
import type { CoordinateEphemeris } from "../../../ephemeris/ephemeris.types";

const DAY = 86_400_000;
const MINUTE = 60_000;
const origin = moment.utc("2026-01-01T00:00:00Z");
const atDay = (days: number): Moment =>
  moment.utc(origin.valueOf() + days * DAY);

/** Builds the service over a stand-in ephemeris that samples `longitude`. */
function buildService(longitude: (milliseconds: number) => number): {
  samples: () => number;
  service: SignTransitsService;
} {
  const ephemeris = createMock<EphemerisService>();
  const sample = vi.fn<(minute: Moment) => CoordinateEphemeris>((minute) => ({
    [minute.toISOString()]: {
      latitude: 0,
      longitude: longitude(minute.valueOf()),
    },
  }));
  ephemeris.getCoordinateEphemerisByBody.mockImplementation(({ start }) =>
    createMock<Record<Body, CoordinateEphemeris>>({ sun: sample(start) }),
  );
  ephemeris.getCoordinateFromEphemeris.mockImplementation(
    (data, timestamp) => data[timestamp]?.longitude ?? Number.NaN,
  );

  return {
    samples: () => sample.mock.calls.length,
    service: new SignTransitsService(
      new BoundarySearchService(),
      ephemeris,
      new LoggerService(),
    ),
  };
}

/** A body whose longitude moves linearly between (day, degrees) knots, wrapped to 0-360. */
function longitudeBetween(
  knots: [number, number][],
): (milliseconds: number) => number {
  return (milliseconds) => {
    const day = (milliseconds - origin.valueOf()) / DAY;
    const after = knots.findIndex(([knotDay]) => knotDay >= day);
    const next = knots[Math.max(after, 1)];
    const previous = knots[Math.max(after, 1) - 1];
    if (next === undefined || previous === undefined) {
      throw new Error("A body needs two knots");
    }
    const share = (day - previous[0]) / (next[0] - previous[0]);
    const degrees = previous[1] + share * (next[1] - previous[1]);

    return ((degrees % 360) + 360) % 360;
  };
}

/** The first minute at or after `from` whose sign is not the one at `from`, found by scanning. */
function scanForExit(
  longitude: (milliseconds: number) => number,
  from: Moment,
): number {
  const sign = Math.floor(longitude(from.valueOf()) / 30);
  let minute = from.valueOf();
  while (Math.floor(longitude(minute) / 30) === sign) {
    minute += MINUTE;
  }
  return minute;
}

describe(SignTransitsService, () => {
  // 1° a day from 0° Aries: Taurus on day 30, Gemini on day 60.
  const steady = longitudeBetween([
    [0, 0],
    [200, 200],
  ]);

  it("names the sign a longitude falls in", () => {
    const { service } = buildService(steady);

    expect(service.getSignAt("sun", atDay(10))).toBe("aries");
    expect(service.getSignAt("sun", atDay(30))).toBe("taurus");
    expect(service.getSignAt("sun", atDay(179))).toBe("virgo");
  });

  it("refuses a longitude outside the zodiac", () => {
    const { service } = buildService(() => 400);

    expect(() => service.getSignAt("sun", atDay(1))).toThrow(
      "not in the zodiac",
    );
  });

  it("finds the minute the stay in progress at the window start began", () => {
    const { service } = buildService(steady);
    const window = { end: atDay(50), start: atDay(40) };

    const entry = service.getEntry("sun", window);

    expect(entry.sign).toBe("taurus");
    expect(entry.start.toISOString()).toBe(atDay(30).toISOString());
  });

  it("finds the minute the stay at the window end finishes", () => {
    const { service } = buildService(steady);
    const window = { end: atDay(50), start: atDay(40) };

    expect(service.getExit("sun", window).toISOString()).toBe(
      atDay(60).toISOString(),
    );
  });

  it("bisects to the minute instead of scanning every minute", () => {
    const { samples, service } = buildService(steady);

    service.getEntry("sun", { end: atDay(50), start: atDay(40) });

    // About ten daily probes back to day 30, then eleven steps narrowing a day.
    expect(samples()).toBeLessThan(40);
  });

  it("starts a stay at the window edge when the window opens on an ingress", () => {
    const { service } = buildService(steady);
    const window = { end: atDay(50), start: atDay(30) };

    // The minute before the window is still Aries, so the stay is Aries.
    const entry = service.getEntry("sun", window);

    expect(entry.sign).toBe("aries");
    expect(entry.start.toISOString()).toBe(atDay(0).toISOString());
  });

  describe("a retrograde body", () => {
    // Taurus from day 30, back into Aries from about day 52, into Taurus
    // again from about day 67, and not yet into Gemini by day 100.
    const retrograde = longitudeBetween([
      [0, 0],
      [30, 30],
      [45, 32],
      [60, 28],
      [80, 34],
      [100, 40],
    ]);

    it("starts the stay at the latest re-entry, not the first entry", () => {
      const { service } = buildService(retrograde);
      const window = { end: atDay(90), start: atDay(85) };

      const entry = service.getEntry("sun", window);
      const reentry = scanForExit(retrograde, atDay(60));

      expect(entry.sign).toBe("taurus");
      expect(entry.start.valueOf()).toBe(reentry);
    });

    it("ends the stay when the body next leaves the sign, even backward", () => {
      const { service } = buildService(retrograde);
      const window = { end: atDay(40), start: atDay(35) };

      expect(service.getExit("sun", window).valueOf()).toBe(
        scanForExit(retrograde, atDay(40)),
      );
    });
  });

  describe("a body that never changes sign", () => {
    const parked = longitudeBetween([
      [0, 10],
      [1000, 10],
    ]);

    it("clips at the range's limits and says so", () => {
      const { service } = buildService(parked);
      // Windows a few days from each limit, so each search walks days and
      // not the 46,000 from today to a limit, which cost 6 s on CI.
      const early = {
        end: moment.utc("1900-01-11T00:00:00Z"),
        start: moment.utc("1900-01-06T00:00:00Z"),
      };
      const late = {
        end: moment.utc("2100-12-26T00:00:00Z"),
        start: moment.utc("2100-12-21T00:00:00Z"),
      };

      expect(service.getEntry("sun", early).sign).toBe("aries");
      expect(service.getEntry("sun", early).start.toISOString()).toBe(
        "1900-01-01T00:00:00.000Z",
      );
      expect(service.getExit("sun", late).toISOString()).toBe(
        "2100-12-31T23:59:00.000Z",
      );
    });
  });

  describe("a window touching the range's limits", () => {
    const first = moment.utc("1900-01-01T00:00:00Z");
    const last = moment.utc("2100-12-31T23:59:00Z");

    it.each([30, 15, 10])(
      "keeps a %s° stay in progress at the first minute from the first minute",
      (size) => {
        const { service } = buildService(() => 5);
        const window = { end: first.clone().add(1, "day"), start: first };

        expect(
          service
            .getZoneEntry({ body: "sun", size, window })
            .start.toISOString(),
        ).toBe("1900-01-01T00:00:00.000Z");
      },
    );

    it.each([30, 15, 10])(
      "keeps a %s° stay in progress at the last minute to the last minute",
      (size) => {
        const { service } = buildService(() => 5);
        const window = { end: last, start: last.clone().subtract(1, "day") };

        expect(
          service.getZoneExit({ body: "sun", size, window }).toISOString(),
        ).toBe("2100-12-31T23:59:00.000Z");
      },
    );

    it("finds the true edge of a stay that ends just after the window", () => {
      const { service } = buildService(
        longitudeBetween([
          [0, 0],
          [200, 200],
        ]),
      );
      const window = { end: atDay(5), start: atDay(1) };

      expect(service.getExit("sun", window).toISOString()).toBe(
        atDay(30).toISOString(),
      );
    });
  });

  describe("slices of a sign", () => {
    const steady = longitudeBetween([
      [0, 0],
      [200, 200],
    ]);

    it("reads the longitude of a body at a minute", () => {
      const { service } = buildService(steady);

      expect(service.getLongitudeAt("sun", atDay(25))).toBeCloseTo(25);
    });

    it("counts a body's slice of any width from 0° Aries", () => {
      const { service } = buildService(steady);

      expect(service.getZoneAt("sun", atDay(25), 10)).toBe(2);
      expect(service.getZoneAt("sun", atDay(25), 15)).toBe(1);
      expect(service.getZoneAt("sun", atDay(25), 30)).toBe(0);
    });

    it("finds when the decan stay in progress at the window start began", () => {
      const { service } = buildService(steady);

      const entry = service.getZoneEntry({
        body: "sun",
        size: 10,
        window: { end: atDay(55), start: atDay(45) },
      });

      expect(entry.index).toBe(4);
      expect(entry.start.toISOString()).toBe(atDay(40).toISOString());
    });

    it("finds when the half stay at the window end finishes", () => {
      const { service } = buildService(steady);

      expect(
        service
          .getZoneExit({
            body: "sun",
            size: 15,
            window: { end: atDay(40), start: atDay(35) },
          })
          .toISOString(),
      ).toBe(atDay(45).toISOString());
    });
  });
});
