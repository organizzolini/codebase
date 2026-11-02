import { z } from "zod";

import type {
  ConstellationListing,
  ConstellationSegment,
  StarRow,
} from "./night-sky.types";

// 🔖 Schemas

/**
 * A right ascension in hours and a declination in degrees, as stored.
 */
const rightAscensionSchema = z.number().min(0).max(24);
const declinationSchema = z.number().min(-90).max(90);

/**
 * One row of the `star` table, read as the generator's catalog row, so a
 * malformed table fails loudly and not as a blank sky.
 */
export const starRecordSchema = z
  .object({
    color_index: z.number(),
    declination_degrees: declinationSchema,
    magnitude: z.number(),
    right_ascension_hours: rightAscensionSchema,
  })
  .transform((record): StarRow => [
    record.right_ascension_hours,
    record.declination_degrees,
    record.magnitude,
    record.color_index,
  ]);

/**
 * SQLite's boolean, 0 or 1, or a boolean where a driver gives one.
 */
const zodiacSchema = z.union([z.boolean(), z.literal(0), z.literal(1)]);

/**
 * One row of the `constellation` table, as the figure picker lists it.
 */
export const constellationRecordSchema = z
  .object({ name: z.string().min(1), zodiac: zodiacSchema })
  .transform((record): ConstellationListing => ({
    name: record.name,
    zodiac: record.zodiac === true || record.zodiac === 1,
  }));

/**
 * One figure segment with both its stars' positions, read as the generator
 * draws it. SQLite answers a boolean as 0 or 1.
 */
export const segmentRecordSchema = z
  .object({
    from_declination_degrees: declinationSchema,
    from_right_ascension_hours: rightAscensionSchema,
    name: z.string().min(1),
    to_declination_degrees: declinationSchema,
    to_right_ascension_hours: rightAscensionSchema,
    zodiac: zodiacSchema,
  })
  .transform((record): ConstellationSegment => ({
    from: [record.from_right_ascension_hours, record.from_declination_degrees],
    name: record.name,
    to: [record.to_right_ascension_hours, record.to_declination_degrees],
    zodiac: record.zodiac === true || record.zodiac === 1,
  }));
