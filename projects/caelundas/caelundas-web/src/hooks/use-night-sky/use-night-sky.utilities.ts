import { z } from "zod";

import { normalizeHexadecimalColor } from "./night-sky-colors.utilities";
import {
  COLOR_DIGITS_PATTERN,
  CONSTELLATION_WORDS,
  DEFAULT_CONSTELLATIONS,
  DEFAULT_OBSERVER,
  DEFAULT_OPTIONS,
  LINE_OPACITY_RANGE,
  LINE_WIDTH_RANGE,
  MINIMUM_BOTTOM_ALTITUDE_DEGREES,
  REDUCED_MOTION_QUERY,
} from "./night-sky.constants";

import type { ConstellationSegment } from "./night-sky.types";
import type { NightSkyOverrides } from "./use-night-sky.types";

// 🔏 Private Functions

/**
 * What to warn of once about a link: each `sky.line*` key it ignored, then
 * each constellation it names that has no figure.
 */
export function describeNightSkyProblems(
  rejectedKeys: readonly string[],
  unknownNames: readonly string[],
): string[] {
  return [
    ...rejectedKeys.map(
      (key) => `The night sky ignored ${key}, whose value does not parse`,
    ),
    ...unknownNames.map(
      (name) => `The night sky has no constellation named ${name}`,
    ),
  ];
}

/**
 * The names a link asks for that are neither `all`, `zodiac`, nor the name of
 * a constellation with a figure.
 */
export function findUnknownConstellationNames(
  segments: readonly ConstellationSegment[],
  names: readonly string[],
): string[] {
  const known = new Set([
    ...CONSTELLATION_WORDS,
    ...segments.map((segment) => normalizeConstellationName(segment.name)),
  ]);

  return names.filter((name) => !known.has(name));
}

/**
 * Whether the page asks for reduced motion.
 */
export function isReducedMotion(): boolean {
  return globalThis.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// 🌎 Public Functions

/**
 * A constellation's name as a link writes it: lower case, with spaces and
 * hyphens as underscores, so `Ursa Major` is `ursa_major`.
 */
export function normalizeConstellationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[\s-]+/gu, "_");
}

/**
 * Reads the backdrop's settings from the link. A key that does not parse
 * falls back to its default, so a stale or hand-edited link still opens.
 */
export function readNightSkyOverrides(
  search: Readonly<Record<string, unknown>>,
): NightSkyOverrides {
  return {
    backgroundBottomColor: normalizeHexadecimalColor(
      search["sky.bottom"],
      DEFAULT_OPTIONS.backgroundBottomColor,
    ),
    backgroundTopColor: normalizeHexadecimalColor(
      search["sky.top"],
      DEFAULT_OPTIONS.backgroundTopColor,
    ),
    bottomAltitudeDegrees: readNumber(
      search["sky.altBottom"],
      z.number().min(MINIMUM_BOTTOM_ALTITUDE_DEGREES).max(89),
      DEFAULT_OPTIONS.bottomAltitudeDegrees,
    ),
    constellations: readConstellationNames(search["sky.constellations"]),
    debug: z.boolean().catch(DEFAULT_OPTIONS.debug).parse(search["sky.debug"]),
    ecliptic: z
      .boolean()
      .catch(DEFAULT_OPTIONS.ecliptic)
      .parse(search["sky.ecliptic"]),
    faintestMagnitude: readNumber(
      search["sky.maxMag"],
      z.number().min(-2).max(12),
      DEFAULT_OPTIONS.faintestMagnitude,
    ),
    ...readStrokes(search),
    latitudeDegrees: readNumber(
      search["sky.lat"],
      z.number().min(-90).max(90),
      DEFAULT_OBSERVER.latitudeDegrees,
    ),
    longitudeDegrees: readNumber(
      search["sky.lon"],
      z.number().min(-360).max(360),
      DEFAULT_OBSERVER.longitudeDegrees,
    ),
    off: search["sky"] === "off",
    pixelsPerSecond: readNumber(
      search["sky.pixelsPerSecond"],
      z.number().positive().max(1000),
      DEFAULT_OPTIONS.pixelsPerSecond,
    ),
    starScale: readNumber(
      search["sky.starScale"],
      z.number().positive().max(10),
      DEFAULT_OPTIONS.starScale,
    ),
    verticalFieldOfViewDegrees: readNumber(
      search["sky.vFov"],
      z.number().positive().max(90),
      DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
    ),
  };
}

/**
 * The figure segments the link asks for: every one for `all`, the twelve
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
 * Calls back when the preference changes, in the shape
 * `useSyncExternalStore` subscribes with, returning how to stop.
 */
export function subscribeToReducedMotion(onChange: () => void): () => void {
  const list = globalThis.matchMedia(REDUCED_MOTION_QUERY);

  list.addEventListener("change", onChange);

  return () => {
    list.removeEventListener("change", onChange);
  };
}

/**
 * Reads a number clamped to a range, or the fallback for anything else.
 */
function clampNumber(
  value: unknown,
  range: { maximum: number; minimum: number },
  fallback: number,
): number {
  return isFiniteNumber(value)
    ? Math.min(range.maximum, Math.max(range.minimum, value))
    : fallback;
}

/**
 * Whether a value is a finite number, as the router reads `0.5` or `2`.
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Whether a value is text of three or six hexadecimal digits, with or
 * without the `#`, as `sky.top` and `sky.bottom` take.
 */
function isHexadecimalColor(value: unknown): boolean {
  return typeof value === "string" && COLOR_DIGITS_PATTERN.test(value);
}

/**
 * Reads `sky.constellations`, a comma-separated list of names and the words
 * `all`, `zodiac` and `none`, each normalized. Absent, or anything but text,
 * is the zodiac; empty, or `none`, is no figure.
 */
function readConstellationNames(value: unknown): readonly string[] {
  if (typeof value !== "string") {
    return DEFAULT_CONSTELLATIONS;
  }

  const names = value
    .split(",")
    .map((name) => normalizeConstellationName(name))
    .filter((name) => name !== "");

  return names.includes("none") ? [] : names;
}

/**
 * Reads a number the schema accepts, or the fallback.
 */
function readNumber(
  value: unknown,
  schema: z.ZodNumber,
  fallback: number,
): number {
  return schema.catch(fallback).parse(value);
}

/**
 * Reads one stroke from the link: `<prefix>Color` like the background's
 * colors, and `<prefix>Opacity` and `<prefix>Width` clamped to their ranges.
 * A key given a value it cannot read falls back, and is named as rejected.
 */
function readStroke(
  search: Readonly<Record<string, unknown>>,
  prefix: "sky.ecliptic" | "sky.line",
  fallback: { color: string; opacity: number; width: number },
): { color: string; opacity: number; rejected: string[]; width: number } {
  const [colorKey, opacityKey, widthKey] = [
    `${prefix}Color`,
    `${prefix}Opacity`,
    `${prefix}Width`,
  ];
  const checks = [
    [colorKey, isHexadecimalColor(search[colorKey])],
    [opacityKey, isFiniteNumber(search[opacityKey])],
    [widthKey, isFiniteNumber(search[widthKey])],
  ] as const;

  return {
    color: normalizeHexadecimalColor(search[colorKey], fallback.color),
    opacity: clampNumber(
      search[opacityKey],
      LINE_OPACITY_RANGE,
      fallback.opacity,
    ),
    rejected: checks
      .filter(([key, read]) => search[key] !== undefined && !read)
      .map(([key]) => key),
    width: clampNumber(search[widthKey], LINE_WIDTH_RANGE, fallback.width),
  };
}

/**
 * Reads how the figures and the ecliptic are stroked, naming every key the
 * link gives a value it cannot read.
 */
function readStrokes(
  search: Readonly<Record<string, unknown>>,
): Pick<
  NightSkyOverrides,
  | "eclipticColor"
  | "eclipticOpacity"
  | "eclipticWidth"
  | "lineColor"
  | "lineOpacity"
  | "lineWidth"
  | "rejectedKeys"
> {
  const line = readStroke(search, "sky.line", {
    color: DEFAULT_OPTIONS.lineColor,
    opacity: DEFAULT_OPTIONS.lineOpacity,
    width: DEFAULT_OPTIONS.lineWidth,
  });
  const ecliptic = readStroke(search, "sky.ecliptic", {
    color: DEFAULT_OPTIONS.eclipticColor,
    opacity: DEFAULT_OPTIONS.eclipticOpacity,
    width: DEFAULT_OPTIONS.eclipticWidth,
  });

  return {
    eclipticColor: ecliptic.color,
    eclipticOpacity: ecliptic.opacity,
    eclipticWidth: ecliptic.width,
    lineColor: line.color,
    lineOpacity: line.opacity,
    lineWidth: line.width,
    rejectedKeys: [...line.rejected, ...ecliptic.rejected],
  };
}
