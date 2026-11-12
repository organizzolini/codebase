import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { initializeSwissEphemeris } from "./ephemeris.constants";
import { EphemerisModule } from "./ephemeris.module";
import { EphemerisService } from "./ephemeris.service";

import type { AzimuthElevationEphemeris } from "./ephemeris.types";

/** Moon from Philadelphia, 20 March 2026, checked against JPL Horizons. */
const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };
const moonCulmination = "2026-03-20T18:26:00.000Z";
const moonrise = "2026-03-20T11:38:00.000Z";
/** Horizons, refracted elevation at the Moon's upper transit. */
const horizonsRefractedCulminationElevation = 61.795_438;
/** Horizons, airless (true) elevation at USNO's moonrise minute. */
const horizonsAirlessMoonriseElevation = -0.771_692;
/** Horizons, angular diameter 1941.923″ at USNO's moonrise minute, halved. */
const horizonsMoonriseSemidiameter = 1941.923 / 2 / 3600;
/** USNO's standard refraction at the horizon, 34′, in degrees. */
const horizonRefraction = 34 / 60;

/** Sun and Moon at greatest eclipse, per JPL Horizons. */
const greatestLocalEclipse = "2026-08-12T17:54:00.000Z";
/** Horizons RA/Dec of the topocentric Moon and Sun, in degrees. */
const horizonsSunMoonSeparation = 0.459_136;
/** Horizons azimuth of the Moon and the Sun at greatest local eclipse. */
const horizonsAzimuths = { moon: 205.898_816, sun: 206.185_78 };

/** Great-circle separation, degrees, of two positions given in degrees. */
function getSeparation(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
): number {
  const radians = Math.PI / 180;
  const haversine =
    Math.sin(((second.latitude - first.latitude) * radians) / 2) ** 2 +
    Math.cos(first.latitude * radians) *
      Math.cos(second.latitude * radians) *
      Math.sin(((second.longitude - first.longitude) * radians) / 2) ** 2;
  return (2 * Math.asin(Math.sqrt(haversine))) / radians;
}

describe("ephemerisHorizonService against JPL Horizons", () => {
  let moonEphemeris: AzimuthElevationEphemeris;

  beforeAll(async () => {
    initializeSwissEphemeris();
    const module = await Test.createTestingModule({
      imports: [EphemerisModule],
    }).compile();
    moonEphemeris = module
      .get(EphemerisService)
      .getAzimuthElevationEphemerisByBody({
        bodies: ["moon"],
        coordinates: [philadelphia.longitude, philadelphia.latitude],
        end: moment.utc(moonCulmination),
        start: moment.utc(moonrise),
        timezone: "America/New_York",
      }).moon;
  });

  it("places the culminating Moon where a Philadelphia observer sees it", () => {
    expect(moonEphemeris[moonCulmination]?.elevation).toBeCloseTo(
      horizonsRefractedCulminationElevation,
      2,
    );
  });

  it("gives the Moon's true elevation at moonrise, without refraction", () => {
    expect(moonEphemeris[moonrise]?.trueElevation).toBeCloseTo(
      horizonsAirlessMoonriseElevation,
      2,
    );
  });

  it("gives the Moon's topocentric semidiameter", () => {
    expect(moonEphemeris[moonrise]?.semidiameter).toBeCloseTo(
      horizonsMoonriseSemidiameter,
      3,
    );
  });

  it("puts the Moon's upper limb on the horizon at USNO's moonrise minute", () => {
    const sample = moonEphemeris[moonrise];
    const upperLimbAltitude =
      (sample?.trueElevation ?? Number.NaN) +
      (sample?.semidiameter ?? Number.NaN) +
      horizonRefraction;

    // The Moon climbs about 0.2° a minute here, so ±30 s is ±0.1°.
    expect(Math.abs(upperLimbAltitude)).toBeLessThan(0.1);
  });

  describe("topocentric eclipse positions against JPL Horizons", () => {
    let ephemerides: Record<"moon" | "sun", AzimuthElevationEphemeris>;

    beforeAll(async () => {
      initializeSwissEphemeris();
      const module = await Test.createTestingModule({
        imports: [EphemerisModule],
      }).compile();
      const byBody = module
        .get(EphemerisService)
        .getAzimuthElevationEphemerisByBody({
          bodies: ["moon", "sun"],
          coordinates: [philadelphia.longitude, philadelphia.latitude],
          end: moment.utc(greatestLocalEclipse),
          start: moment.utc(greatestLocalEclipse),
          timezone: "America/New_York",
        });
      ephemerides = { moon: byBody.moon, sun: byBody.sun };
    });

    it("separates the topocentric Moon from the Sun as Horizons does", () => {
      const moon = ephemerides.moon[greatestLocalEclipse];
      const sun = ephemerides.sun[greatestLocalEclipse];

      expect(
        getSeparation(
          {
            latitude: moon?.eclipticLatitude ?? Number.NaN,
            longitude: moon?.eclipticLongitude ?? Number.NaN,
          },
          {
            latitude: sun?.eclipticLatitude ?? Number.NaN,
            longitude: sun?.eclipticLongitude ?? Number.NaN,
          },
        ),
      ).toBeCloseTo(horizonsSunMoonSeparation, 3);
    });

    it("measures azimuth from North, as Horizons does", () => {
      expect(ephemerides.moon[greatestLocalEclipse]?.azimuth).toBeCloseTo(
        horizonsAzimuths.moon,
        2,
      );
      expect(ephemerides.sun[greatestLocalEclipse]?.azimuth).toBeCloseTo(
        horizonsAzimuths.sun,
        2,
      );
    });
  });
});
