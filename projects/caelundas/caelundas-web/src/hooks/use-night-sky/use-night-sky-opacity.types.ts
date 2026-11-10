// 🏷️ Types

/**
 * What useNightSkyOpacity returns.
 */
export interface UseNightSkyOpacityResult {
  /**
   * How opaque the night sky is drawn, from 0 to 1.
   */
  skyOpacity: number;
  /**
   * How opaque the calendar's surfaces are drawn over the sky, from 0 to 1.
   */
  surfaceOpacity: number;
}
