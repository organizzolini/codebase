import { z } from "zod";

// ♟️ Constants

/** Faintest magnitude stored, the naked-eye limit from a dark site. */
export const MAXIMUM_MAGNITUDE = 6.5;

/**
 * Most southern declination stored; -45 keeps southern zodiac figures whole.
 */
export const MINIMUM_DECLINATION_DEGREES = -45;

/** Vertex match tolerance; catalogs agree to 0.01 degree. */
export const MATCH_TOLERANCE_DEGREES = 0.05;

/** The bands, per degree of declination, that the star index groups by. */
export const INDEX_BANDS_PER_DEGREE = 10;

/** Color index for a star lacking one: Sun-like white. */
export const MISSING_COLOR_INDEX = 0.6;

/** HYG columns read, in catalog row order. */
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

/** Constellations d3-celestial draws in two parts under one IAU name. */
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

/** d3-celestial's `constellations.lines.json`: figures as polylines, RA in degrees. */
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
