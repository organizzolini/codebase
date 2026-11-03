import type { ConstellationSegment, StarRow } from "./night-sky.types";
import type {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";

// 🏷️ Types

/**
 * What a sky is built with: the stars and figures from the database, and the
 * generator, loaded together.
 */
export interface NightSkyEngine {
  buildNightSky: typeof buildNightSky;
  computeStartingSiderealDegrees: typeof computeStartingSiderealDegrees;
  segments: readonly ConstellationSegment[];
  stars: readonly StarRow[];
}

/**
 * What useNightSkyEngine returns.
 */
export interface UseNightSkyEngineResult {
  /**
   * The loaded engine, or nothing while it loads, when there is no sky to
   * draw, or after it failed to load.
   */
  engine: NightSkyEngine | undefined;
}
