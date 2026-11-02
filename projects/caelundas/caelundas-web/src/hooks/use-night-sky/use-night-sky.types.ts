// 🏷️ Types

/**
 * The backdrop's settings after the link's `sky.*` keys are applied over the
 * defaults.
 */
export interface NightSkyOverrides {
  backgroundBottomColor: string;
  backgroundTopColor: string;
  bottomAltitudeDegrees: number;
  /**
   * The normalized names `sky.constellations` lists, with `all` and `zodiac`;
   * empty draws no figure.
   */
  constellations: readonly string[];
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
