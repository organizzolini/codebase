import type { Body } from "../caelundas/caelundas.types";

// 🏷️ Types

/**
 * Time-indexed topocentric horizon positions by ISO timestamp, for rise, set and culmination.
 */
export type AzimuthElevationEphemeris = Record<string, HorizonPosition>;

/**
 * Sun and Moon. Keep the copy in `caelundas.constants.ts` in step.
 */
export type AzimuthElevationEphemerisBody = Extract<Body, "moon" | "sun">;

/** Ecliptic longitude and latitude in degrees, by ISO timestamp. */
export type CoordinateEphemeris = Record<
  string,
  { latitude: number; longitude: number }
>;

/**
 * Bodies with coordinate ephemerides: planets, asteroids, comets, nodes.
 */
export type CoordinateEphemerisBody = Body;

/** [longitude, latitude] in degrees on the celestial sphere. */
export type Coordinates = [Longitude, Latitude];

/** Distance (AU) and radial speed (AU/day); positive while receding. */
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

/** Body's topocentric sky position for one observer at one minute. */
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
 * Illuminated percentage, apparent magnitude (smaller is brighter), phase angle (degrees).
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

/** Ecliptic latitude in degrees: -90° (south) to +90° (north). */
export type Latitude = number;

/** Ecliptic longitude in degrees, 0° to 360° from vernal equinox. */
export type Longitude = number;

/** Swiss Ephemeris call being computed, named in errors. */
export interface SwissEphemerisSubject {
  /** The body or node the call was for. */
  body: string;
  /** The Swiss Ephemeris function that was called. */
  tool: string;
}
