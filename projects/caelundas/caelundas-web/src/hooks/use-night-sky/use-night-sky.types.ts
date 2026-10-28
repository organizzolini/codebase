import type { StarRow } from "./night-sky.types";
import type {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";

// 🏷️ Types

/**
 * What a sky is built with: the catalog and the generator, loaded together.
 */
export interface NightSkyEngine {
  buildNightSky: typeof buildNightSky;
  computeStartingSiderealDegrees: typeof computeStartingSiderealDegrees;
  stars: readonly StarRow[];
}

/**
 * The backdrop's settings after the link's `sky.*` keys are applied over the
 * defaults.
 */
export interface NightSkyOverrides {
  backgroundBottomColor: string;
  backgroundTopColor: string;
  bottomAltitudeDegrees: number;
  debug: boolean;
  faintestMagnitude: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  /** `sky=off` removes the backdrop. */
  off: boolean;
  pixelsPerSecond: number;
  starScale: number;
  verticalFieldOfViewDegrees: number;
}

/**
 * The night sky the hook built: its SVG markup, or nothing while the star
 * catalog loads, when the link turns it off, and where the view cannot draw.
 */
export interface UseNightSkyResult {
  /**
   * The sky's SVG markup, or nothing while there is no sky to draw.
   */
  sky: string | undefined;
}

/**
 * The window's size in pixels.
 */
export interface WindowSize {
  height: number;
  width: number;
}
