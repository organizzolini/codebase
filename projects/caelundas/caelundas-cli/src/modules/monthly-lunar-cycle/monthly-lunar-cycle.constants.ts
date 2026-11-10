// ♟️ Constants

import type { LunarPhase } from "../caelundas/caelundas.types";

export const LUNAR_APOGEE_TAG = "Apogee";
export const LUNAR_PERIGEE_TAG = "Perigee";

/** Apsis events keep clear of "Monthly Lunar Cycle", whose phase events are paired into spans. */
export const LUNAR_APSIDES_BASE_TAGS = [
  "Astronomy",
  "Astrology",
  "Lunar Apsides",
  "Lunar",
] as const;

/**
 * The Moon's minus the Sun's ecliptic longitude at each phase's start; the four primary phases match USNO's definition.
 */
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
