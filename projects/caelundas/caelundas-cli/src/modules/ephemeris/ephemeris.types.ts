import type { Body } from "../caelundas/caelundas.types";

// 🏷️ Types

/**
 * Time-indexed topocentric horizon positions by ISO timestamp, for rise, set and culmination.
 */
export type AzimuthElevationEphemeris = Record<string, HorizonPosition>;

/**
 * Sun and Moon, the bodies with horizon ephemerides. A copy lives in `caelundas.constants.ts`; keep both in step.
 */
export type AzimuthElevationEphemerisBody = Extract<Body, "moon" | "sun">;

/**
 * Time-indexed ecliptic longitude and latitude in degrees for a celestial body, by ISO timestamp.
 */
export type CoordinateEphemeris = Record<
  string,
  { latitude: number; longitude: number }
>;

/**
 * Bodies for which coordinate ephemerides are generated.
 * Includes all tracked planets, asteroids, comets, and lunar nodes.
 */
export type CoordinateEphemerisBody = Body;

/**
 * Coordinate pair representing a position on the celestial sphere.
 * Format: [longitude, latitude] in degrees.
 */
export type Coordinates = [Longitude, Latitude];

/**
 * Time-indexed distance in AU and radial speed in AU per day, positive while receding. Apsides come from the speed's sign.
 */
export type DistanceEphemeris = Record<
  string,
  { distance: number; distanceSpeed: number }
>;

/**
 * Sun for apsides, Moon for parallax and semidiameter, and the inner planets.
 */
export type DistanceEphemerisBody = Extract<
  Body,
  "mars" | "mercury" | "moon" | "sun" | "venus"
>;

/**
 * Aggregated ephemeris data for all tracked bodies.
 */
export interface Ephemerides {
  azimuthElevationEphemerisByBody: Record<Body, AzimuthElevationEphemeris>;
  coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
  distanceEphemerisByBody: Record<Body, DistanceEphemeris>;
  illuminationEphemerisByBody: Record<Body, IlluminationEphemeris>;
}

/**
 * Where a body sits in one observer's sky at one minute, from its topocentric position.
 */
export interface HorizonPosition {
  /** Degrees from North, clockwise through East (0° North, 90° East, 180° South, 270° West). */
  azimuth: number;
  /** Topocentric apparent ecliptic latitude of date, degrees. */
  eclipticLatitude: number;
  /** Topocentric apparent ecliptic longitude of date, degrees. */
  eclipticLongitude: number;
  /** Apparent (refracted) elevation of the center, degrees; refraction is dropped below the horizon. */
  elevation: number;
  /** Topocentric angular radius, degrees: half the disc the observer sees. */
  semidiameter: number;
  /** True (airless, unrefracted) elevation of the center, degrees. */
  trueElevation: number;
}

/**
 * Time-indexed illuminated percentage, apparent magnitude (smaller is brighter), and phase angle in degrees.
 */
export type IlluminationEphemeris = Record<
  string,
  { illumination: number; magnitude: number; phaseAngle: number }
>;

/**
 * Bodies with visible phases: the Sun, the Moon, and the inner planets.
 */
export type IlluminationEphemerisBody = Extract<
  Body,
  "mars" | "mercury" | "moon" | "sun" | "venus"
>;

/**
 * Ecliptic latitude in degrees.
 * Range: -90° (south) to +90° (north) from the ecliptic plane.
 */
export type Latitude = number;

/**
 * Ecliptic longitude in degrees.
 * Range: 0° to 360° along the ecliptic, starting from the vernal equinox.
 */
export type Longitude = number;

/** What a Swiss Ephemeris call was computing, for an error that names it. */
export interface SwissEphemerisSubject {
  /** The body or node the call was for. */
  body: string;
  /** The Swiss Ephemeris function that was called. */
  tool: string;
}
