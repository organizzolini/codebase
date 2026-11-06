import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

import { normalizeHexadecimalColor } from "./night-sky-colors.utilities";
import {
  COLOR_DIGITS_PATTERN,
  DEFAULT_OPTIONS,
  MAXIMUM_SIZE_PIXELS,
} from "./night-sky.constants";

import type {
  ConstellationSegment,
  ParsedNightSkyInput,
} from "./night-sky.types";

// 🔏 Private Functions

/**
 * A constellation's name as a query writes it: lower case, with spaces and
 * hyphens as underscores, so `Ursa Major` is `ursa_major`.
 */
export function normalizeConstellationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[\s-]+/gu, "_");
}

/**
 * Checks a query's input, fills what it left out, and refuses what the
 * builder cannot draw with a message naming each field at fault.
 */
export function parseNightSkyInput(input: unknown): ParsedNightSkyInput {
  const result = createInputSchema().safeParse(input);

  if (!result.success) {
    throw new BadRequestException(z.prettifyError(result.error));
  }

  return result.data;
}

// 🌎 Public Functions

/**
 * The figure segments the query asks for: every one for `all`, the twelve
 * zodiac constellations' for `zodiac`, and those of each constellation named.
 */
export function selectConstellationSegments(
  segments: readonly ConstellationSegment[],
  names: readonly string[],
): ConstellationSegment[] {
  const wanted = new Set(names);

  return segments.filter(
    (segment) =>
      wanted.has("all") ||
      (segment.zodiac && wanted.has("zodiac")) ||
      wanted.has(normalizeConstellationName(segment.name)),
  );
}

/**
 * A color of three or six hexadecimal digits, read as lowercase `#rrggbb`.
 */
function color(fallback: string): z.ZodType<string, string | undefined> {
  return z
    .string()
    .regex(COLOR_DIGITS_PATTERN)
    .optional()
    .transform((value) => normalizeHexadecimalColor(value, fallback));
}

/**
 * What a `nightSky` query may ask for, each limit the one the web app's link
 * applied, and each default the builder's.
 */
function createInputSchema(): z.ZodType<ParsedNightSkyInput> {
  const opacity = z.number().min(0).max(1);
  const strokeWidth = z.number().min(0).max(10);

  return z.object({
    backgroundBottomColor: color(DEFAULT_OPTIONS.backgroundBottomColor),
    backgroundTopColor: color(DEFAULT_OPTIONS.backgroundTopColor),
    bottomAltitudeDegrees: z
      .number()
      .min(-45)
      .max(89)
      .default(DEFAULT_OPTIONS.bottomAltitudeDegrees),
    constellations: z
      .array(z.string())
      .default(["zodiac"])
      .transform((names) => {
        const normalized = names
          .map((name) => normalizeConstellationName(name))
          .filter((name) => name !== "");

        return normalized.includes("none") ? [] : normalized;
      }),
    debug: z.boolean().default(DEFAULT_OPTIONS.debug),
    ecliptic: z.boolean().default(DEFAULT_OPTIONS.ecliptic),
    eclipticColor: color(DEFAULT_OPTIONS.eclipticColor),
    eclipticOpacity: opacity.default(DEFAULT_OPTIONS.eclipticOpacity),
    eclipticWidth: strokeWidth.default(DEFAULT_OPTIONS.eclipticWidth),
    faintestMagnitude: z
      .number()
      .min(-2)
      .max(12)
      .default(DEFAULT_OPTIONS.faintestMagnitude),
    height: z.number().int().min(1).max(MAXIMUM_SIZE_PIXELS),
    latitudeDegrees: z.number().gt(0).max(90).default(90),
    lineColor: color(DEFAULT_OPTIONS.lineColor),
    lineOpacity: opacity.default(DEFAULT_OPTIONS.lineOpacity),
    lineWidth: strokeWidth.default(DEFAULT_OPTIONS.lineWidth),
    longitudeDegrees: z.number().min(-360).max(360).default(-74),
    pixelsPerSecond: z
      .number()
      .positive()
      .max(1000)
      .default(DEFAULT_OPTIONS.pixelsPerSecond),
    starScale: z.number().positive().max(10).default(DEFAULT_OPTIONS.starScale),
    still: z.boolean().default(DEFAULT_OPTIONS.still),
    time: z.date().default(() => new Date()),
    verticalFieldOfViewDegrees: z
      .number()
      .positive()
      .max(90)
      .default(DEFAULT_OPTIONS.verticalFieldOfViewDegrees),
    width: z.number().int().min(1).max(MAXIMUM_SIZE_PIXELS),
  });
}
