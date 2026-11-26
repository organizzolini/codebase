// 🏷️ Types
import type { Aspect, Body } from "../../../caelundas/caelundas.types";
import type { Moment } from "moment-timezone";

/** Where a search found a pair's orb to begin or end. */
export interface AspectEdge {
  /** Whether the ephemeris range ended before the orb did. */
  isClipped: boolean;
  /** The last minute in orb, or the range's first or last minute when clipped. */
  minute: Moment;
}

/** One simple aspect between a body pair, with the boundaries seen. */
export interface AspectGroup {
  aspect: Aspect;
  bodies: [Body, Body];
  boundaries: { boundary: Boundary; minute: Moment }[];
}

/** Whether a boundary begins or ends a simple aspect. */
export type Boundary = "dissolving" | "forming";
