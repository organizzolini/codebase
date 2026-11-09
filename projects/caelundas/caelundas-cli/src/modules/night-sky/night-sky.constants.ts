import { z } from "zod";

// ♟️ Constants

/**
 * The faintest magnitude stored: as faint as the eye sees from a dark site, unless a figure needs more.
 */
export const MAXIMUM_MAGNITUDE = 6.5;

/**
 * The most southern declination stored. The view faces north, and -45
 * degrees keeps the southern zodiac figures, Scorpius, Sagittarius and
 * Capricornus, whole.
 */
export const MINIMUM_DECLINATION_DEGREES = -45;

/**
 * How far a figure's vertex may lie from a catalog star and still match it; the catalogs agree to 0.01 degree.
 */
export const MATCH_TOLERANCE_DEGREES = 0.05;

/** The bands, per degree of declination, that the star index groups by. */
export const INDEX_BANDS_PER_DEGREE = 10;

/** The color index of a star the catalog gives none, a Sun-like white. */
export const MISSING_COLOR_INDEX = 0.6;

/** The HYG columns read, in the order a catalog row is built from. */
export const CATALOG_COLUMNS = ["id", "hip", "ra", "dec", "mag", "ci"] as const;

/** The IAU designations of the twelve zodiac constellations. */
export const ZODIAC_DESIGNATIONS: ReadonlySet<string> = new Set([
  "Aqr",
  "Ari",
  "Cap",
  "Cnc",
  "Gem",
  "Leo",
  "Lib",
  "Psc",
  "Sco",
  "Sgr",
  "Tau",
  "Vir",
]);

/**
 * The constellations d3-celestial draws in two parts, each part under the
 * same designation, by the one name the IAU gives the whole.
 */
export const SPLIT_CONSTELLATION_NAMES: ReadonlyMap<string, string> = new Map([
  ["Ser", "Serpens"],
]);

/** d3-celestial's `constellations.json`: a name for each designation. */
export const constellationsFileSchema = z.object({
  features: z.array(
    z.object({
      id: z.string().min(1),
      properties: z.object({ name: z.string().min(1) }),
    }),
  ),
});

/**
 * d3-celestial's `constellations.lines.json`: each figure as polylines of
 * [longitude, latitude] vertices, right ascension in degrees from -180 to 180.
 */
export const linesFileSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.object({
        coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
      }),
      id: z.string().min(1),
    }),
  ),
});

/**
 * Thrown when the command is not given a file it reads, or the HYG CSV lacks
 * a column it reads.
 */
export class NightSkySourceError extends Error {
  override name = "NightSkySourceError";
}
