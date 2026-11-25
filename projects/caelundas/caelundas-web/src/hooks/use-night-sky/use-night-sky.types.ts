// 🏷️ Types

/**
 * Settings the API draws from: the link's, minus opacities.
 */
export type NightSkyDrawing = Omit<NightSkyOverrides, "skyOpacity">;

/**
 * The backdrop's settings, with the link's `skyfield.*` keys applied.
 */
export interface NightSkyOverrides {
  backgroundBottomColor: string;
  backgroundTopColor: string;
  bottomAltitudeDegrees: number;
  /**
   * The normalized names `skyfield.constellations` lists, with `all` and `zodiac`;
   * empty draws no figure.
   */
  constellations: readonly string[];
  debug: boolean;
  /** `skyfield.ecliptic=true` draws the ecliptic. */
  ecliptic: boolean;
  eclipticColor: string;
  eclipticOpacity: number;
  eclipticWidth: number;
  faintestMagnitude: number;
  latitudeDegrees: number;
  lineColor: string;
  lineOpacity: number;
  lineWidth: number;
  longitudeDegrees: number;
  /** `skyfield=off` removes the backdrop. */
  off: boolean;
  pixelsPerSecond: number;
  /**
   * The `skyfield.line*` keys whose values could not be read, so they fell back
   * to their defaults.
   */
  rejectedKeys: readonly string[];
  /** `skyfield.opacity`: how opaque the whole sky is drawn, from 0 to 1. */
  skyOpacity: number;
  starScale: number;
  verticalFieldOfViewDegrees: number;
}

/**
 * The hook's sky: SVG markup, or nothing when there is none.
 */
export interface UseNightSkyResult {
  /**
   * The sky's SVG markup, or nothing while there is no sky to draw.
   */
  sky: string | undefined;
}
