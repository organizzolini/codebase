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

/** Phase word (forming, perfective, dissolving) in an aspect's description. */
export const PHASE_WORD_PATTERN = / (?:forming|perfective|dissolving)(?= |$)/u;
