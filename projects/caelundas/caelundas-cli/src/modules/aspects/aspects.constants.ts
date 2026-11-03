// ♟️ Constants

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

/**
 * Matches the phase word (forming, perfective, or dissolving) wherever it sits
 * in an aspect description, so a boundary title can be the description minus
 * it. The title of a boundary event and of its span then read the same.
 */
export const PHASE_WORD_PATTERN = / (?:forming|perfective|dissolving)(?= |$)/u;
