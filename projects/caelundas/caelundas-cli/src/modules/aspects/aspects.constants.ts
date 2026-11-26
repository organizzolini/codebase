// ♟️ Constants
import type { Body } from "../caelundas/caelundas.types";

/** Probe step, in minutes, of an aspect search with a fast body. */
export const ASPECT_SEARCH_FAST_STEP_MINUTES = 360;

/** Probe step, in minutes, when both bodies are slow. */
export const ASPECT_SEARCH_SLOW_STEP_MINUTES = 1440;

/** Degrees to shift a longitude out of every orb. */
export const CLIPPED_NEIGHBOR_OFFSETS_DEGREES = [
  20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170,
] as const;

/** Bodies slow enough to probe a day at a time. */
export const SLOW_ASPECT_BODIES: readonly Body[] = [
  "chiron",
  "jupiter",
  "neptune",
  "north lunar node",
  "pluto",
  "saturn",
  "uranus",
];

export const SIMPLE_ASPECT_DETECTORS_TOKEN = "SIMPLE_ASPECT_DETECTORS_TOKEN";
export const COMPOSITE_ASPECT_DETECTORS_TOKEN =
  "COMPOSITE_ASPECT_DETECTORS_TOKEN";
export const PROGRESSIVE_ASPECT_DETECTORS_TOKEN =
  "PROGRESSIVE_ASPECT_DETECTORS_TOKEN";

/** The three minutes a longitudes window samples, in time order. */
export const LONGITUDES_WINDOW_INSTANTS = [
  "previous",
  "current",
  "next",
] as const;

/** Phase word (forming, perfective, dissolving) in an aspect's description. */
export const PHASE_WORD_PATTERN = / (?:forming|perfective|dissolving)(?= |$)/u;
