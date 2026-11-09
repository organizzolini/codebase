// ♟️ Constants
import { constants, set_ephe_path } from "sweph";

import {
  DOWNLOAD_COMMAND,
  EPHEMERIS_FIRST_YEAR,
  EPHEMERIS_LAST_YEAR,
} from "../ephemeris-download/ephemeris-download.constants";
import { resolveEphemerisDirectory } from "../ephemeris-download/ephemeris-download.utilities";

import type { Asteroid, Node, Planet } from "../caelundas/caelundas.types";
import type {
  AzimuthElevationEphemerisBody,
  SwissEphemerisSubject,
} from "./ephemeris.types";

/** Kilometers in one astronomical unit (IAU 2012). */
export const KILOMETERS_PER_ASTRONOMICAL_UNIT = 149_597_870.7;
/**
 * Mean radius of the Sun and Moon in kilometers, for the semidiameter that rise and set use.
 */
export const radiusKilometersByHorizonBody: Record<
  AzimuthElevationEphemerisBody,
  number
> = { moon: 1737.4, sun: 695_700 };
/**
 * Standard horizon refraction, 34′ as the US Naval Observatory uses it.
 */
export const HORIZON_REFRACTION_DEGREES = 34 / 60;
/** Swiss Ephemeris flag for converting ecliptic coordinates to horizontal (azimuth/elevation). */
export const ECLIPTIC_TO_HORIZONTAL_FLAG: number = constants.SE_ECL2HOR;
/**
 * Observer height above sea level, in meters, for topocentric positions.
 * Sea level matches the US Naval Observatory, which ignores site elevation.
 */
export const OBSERVER_ELEVATION_METERS = 0;
/** Swiss Ephemeris flag selecting the proleptic Gregorian calendar for Julian Day conversions. */
export const GREGORIAN_CALENDAR_FLAG: number = constants.SE_GREG_CAL;
/** Swiss Ephemeris flag requesting osculating (instantaneous) orbital elements for the Moon. */
export const OSCULATING_ORBITAL_ELEMENTS_FLAG: number =
  constants.SE_NODBIT_OSCU;
/**
 * Swiss Ephemeris flags for every body: built-in data files, and daily velocity for retrograde detection.
 */
export const SWISS_EPHEMERIS_FLAGS: number =
  constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
/**
 * {@link SWISS_EPHEMERIS_FLAGS} plus `SEFLG_TOPOCTR`: the position seen from
 * the observer that `set_topo` placed, parallax included, not from Earth's center.
 */
export const TOPOCENTRIC_EPHEMERIS_FLAGS: number =
  SWISS_EPHEMERIS_FLAGS | constants.SEFLG_TOPOCTR;

/** Maps each planet name to its Swiss Ephemeris integer body identifier. */
export const swissEphemerisConstantByPlanet: Record<Planet, number> = {
  jupiter: constants.SE_JUPITER,
  mars: constants.SE_MARS,
  mercury: constants.SE_MERCURY,
  moon: constants.SE_MOON,
  neptune: constants.SE_NEPTUNE,
  pluto: constants.SE_PLUTO,
  saturn: constants.SE_SATURN,
  sun: constants.SE_SUN,
  uranus: constants.SE_URANUS,
  venus: constants.SE_VENUS,
};

/** Maps each asteroid name to its Swiss Ephemeris integer body identifier. */
export const swissEphemerisConstantByAsteroid: Record<Asteroid, number> = {
  ceres: constants.SE_CERES,
  chiron: constants.SE_CHIRON,
  juno: constants.SE_JUNO,
  lilith: constants.SE_MEAN_APOG,
  pallas: constants.SE_PALLAS,
  vesta: constants.SE_VESTA,
};

/**
 * Each lunar node or apside's Swiss Ephemeris id; lunar perigee has none, so its value is `null`.
 */
export const swissEphemerisConstantByNode: Record<Node, null | number> = {
  "lunar apogee": constants.SE_OSCU_APOG,
  "lunar perigee": null,
  "north lunar node": constants.SE_TRUE_NODE,
  "south lunar node": constants.SE_TRUE_NODE,
};

/**
 * A Swiss Ephemeris result not from the data files. The built-in Moshier
 * ephemeris answers instead, a little less precisely, and has nothing for an
 * asteroid, so the answer is refused.
 */
export class EphemerisUnavailableError extends Error {
  constructor({ body, tool }: SwissEphemerisSubject, detail: string) {
    super(
      `${tool} for ${body} did not use the Swiss Ephemeris files. They are missing (download them with \`${DOWNLOAD_COMMAND}\`), or the date lies outside ${String(EPHEMERIS_FIRST_YEAR)} to ${String(EPHEMERIS_LAST_YEAR)}, the years they cover. ${detail.trim()}`,
    );
    this.name = EphemerisUnavailableError.name;
    this.body = body;
    this.tool = tool;
  }
  readonly body: string;
  readonly tool: string;
}

/**
 * Points the Swiss Ephemeris at its data files at startup. It only sets the
 * path; `EphemerisService.verifyFiles` checks the files exist.
 */
export function initializeSwissEphemeris(): void {
  set_ephe_path(resolveEphemerisDirectory());
}
