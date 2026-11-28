// ♟️ Constants
import type { Decan, Sign } from "../../../caelundas/caelundas.types";

/** Tag naming each decan, carried by its ingress. */
export const DECAN_TAG_BY_DECAN: Record<Decan, string> = {
  "1": "First Decan",
  "2": "Second Decan",
  "3": "Third Decan",
};

/** Degrees of ecliptic longitude in one decan. */
export const DEGREES_PER_DECAN = 10;

/** Degrees of ecliptic longitude in one half of a sign. */
export const DEGREES_PER_HALF = 15;

/** Degrees of ecliptic longitude in one sign. */
export const DEGREES_PER_SIGN = 30;

/** Tag naming each side of a sign's peak, carried by its stay. */
export const HALF_TAG_BY_HALF = {
  "1": "Before Peak",
  "2": "After Peak",
} as const;

/** Symbol of a sign's peak, shared by its ingress and both halves' stays. */
export const PEAK_SYMBOL = "⛰️";

/** Minutes between one search probe and the next. */
export const SIGN_SEARCH_STEP_MINUTES = 1440;

/** The twelve signs in tropical order, each 30° wide from 0° Aries. */
export const TROPICAL_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const satisfies readonly Sign[];

/** Every decan in order; a 10° slice index finds it. */
export const DECAN_ZONES = TROPICAL_SIGNS.flatMap((sign) =>
  (["1", "2", "3"] as const).map((decan) => ({ decan, sign })),
);

/** Every half sign in order; a 15° slice index finds it. */
export const HALF_ZONES = TROPICAL_SIGNS.flatMap((sign) =>
  (["1", "2"] as const).map((half) => ({ half, sign })),
);

/** The slices stays are tracked in, by width and inner ingress tag. */
export const ZONE_STAY_KINDS = [
  { boundaryTag: "Decan", degrees: DEGREES_PER_DECAN, kind: "decan" },
  { boundaryTag: "Peak", degrees: DEGREES_PER_HALF, kind: "half" },
] as const;
