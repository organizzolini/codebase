import { z } from "zod";

import { normalizeHexadecimalColor } from "./night-sky-colors.utilities";
import {
  CONSTELLATION_WORDS,
  DEFAULT_OBSERVER,
  DEFAULT_OPTIONS,
  REDUCED_MOTION_QUERY,
} from "./night-sky.constants";

import type { ConstellationSegment } from "./night-sky.types";
import type { NightSkyOverrides } from "./use-night-sky.types";

// 🔏 Private Functions

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
      z.number().min(0).max(89),
      DEFAULT_OPTIONS.bottomAltitudeDegrees,
    ),
    constellations: readConstellationNames(search["sky.constellations"]),
    debug: z.boolean().catch(DEFAULT_OPTIONS.debug).parse(search["sky.debug"]),
    faintestMagnitude: readNumber(
      search["sky.maxMag"],
      z.number().min(-2).max(12),
      DEFAULT_OPTIONS.faintestMagnitude,
    ),
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
 * Reads `sky.constellations`, a comma-separated list of names and the words
 * `all` and `zodiac`, each normalized. Anything but text is no list.
 */
function readConstellationNames(value: unknown): string[] {
  return typeof value === "string"
    ? value
        .split(",")
        .map((name) => normalizeConstellationName(name))
        .filter((name) => name !== "")
    : [];
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
