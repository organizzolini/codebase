// ♟️ Constants

import type { LunarPhase } from "../../../caelundas/caelundas.types";

/** Degrees of the Moon's elongation from one phase to the next. */
export const DEGREES_PER_LUNAR_PHASE = 45;

export const LUNAR_APOGEE_TAG = "Apogee";
export const LUNAR_PERIGEE_TAG = "Perigee";

/** Tag of the span the Moon draws nearer, from apogee to perigee. */
export const LUNAR_ADVANCING_TAG = "Advancing";

/** Tag of the span the Moon draws farther, from perigee to apogee. */
export const LUNAR_RETREATING_TAG = "Retreating";

export const LUNAR_ADVANCING_DESCRIPTION =
  "Lunar Advancing (Apogee to Perigee)";
export const LUNAR_RETREATING_DESCRIPTION =
  "Lunar Retreating (Perigee to Apogee)";

export const LUNAR_ADVANCING_SUMMARY = "🌙🔥 Lunar Advancing";
export const LUNAR_RETREATING_SUMMARY = "🌙❄️ Lunar Retreating";

/** Minutes between apsis search probes, inside the days between apsides. */
export const LUNAR_APSIS_SEARCH_STEP_MINUTES = 360;

/** Minutes between phase search probes, inside a phase's days. */
export const LUNAR_PHASE_SEARCH_STEP_MINUTES = 360;

/** Apsis events stay clear of "Monthly Lunar Cycle" phase spans. */
export const LUNAR_APSIDES_BASE_TAGS = [
  "Astronomy",
  "Astrology",
  "Lunar Apsides",
  "Lunar",
] as const;

/** Moon's minus Sun's ecliptic longitude at each phase's start. */
export const ELONGATION_BY_LUNAR_PHASE: Record<LunarPhase, number> = {
  "first quarter": 90,
  full: 180,
  "last quarter": 270,
  new: 0,
  "waning crescent": 315,
  "waning gibbous": 225,
  "waxing crescent": 45,
  "waxing gibbous": 135,
};
