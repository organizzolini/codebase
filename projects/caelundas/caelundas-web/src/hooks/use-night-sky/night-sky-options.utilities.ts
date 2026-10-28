import { DEFAULT_OPTIONS } from "./night-sky.constants";

import type {
  NightSkyOptions,
  ResolvedNightSkyOptions,
} from "./night-sky.types";

// 🔏 Private Functions

/**
 * Fills every option the caller left out with its default.
 */
export function resolveOptions(
  options: NightSkyOptions,
): ResolvedNightSkyOptions {
  return {
    ...resolveAppearance(options),
    ...resolveView(options),
    height: options.height,
    latitudeDegrees: options.latitudeDegrees,
    localSiderealDegrees: options.localSiderealDegrees,
    stars: options.stars,
    width: options.width,
  };
}

/**
 * Fills the options that set how the sky looks with their defaults.
 */
function resolveAppearance(
  options: NightSkyOptions,
): Pick<
  ResolvedNightSkyOptions,
  | "backgroundBottomColor"
  | "backgroundTopColor"
  | "debug"
  | "faintestMagnitude"
  | "starScale"
> {
  return {
    backgroundBottomColor:
      options.backgroundBottomColor ?? DEFAULT_OPTIONS.backgroundBottomColor,
    backgroundTopColor:
      options.backgroundTopColor ?? DEFAULT_OPTIONS.backgroundTopColor,
    debug: options.debug ?? DEFAULT_OPTIONS.debug,
    faintestMagnitude:
      options.faintestMagnitude ?? DEFAULT_OPTIONS.faintestMagnitude,
    starScale: options.starScale ?? DEFAULT_OPTIONS.starScale,
  };
}

// 🌎 Public Functions

/**
 * Fills the options that set what part of the sky shows, and how it moves,
 * with their defaults.
 */
function resolveView(
  options: NightSkyOptions,
): Pick<
  ResolvedNightSkyOptions,
  | "bottomAltitudeDegrees"
  | "pixelsPerSecond"
  | "still"
  | "verticalFieldOfViewDegrees"
> {
  return {
    bottomAltitudeDegrees:
      options.bottomAltitudeDegrees ?? DEFAULT_OPTIONS.bottomAltitudeDegrees,
    pixelsPerSecond: options.pixelsPerSecond ?? DEFAULT_OPTIONS.pixelsPerSecond,
    still: options.still ?? DEFAULT_OPTIONS.still,
    verticalFieldOfViewDegrees:
      options.verticalFieldOfViewDegrees ??
      DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
  };
}
