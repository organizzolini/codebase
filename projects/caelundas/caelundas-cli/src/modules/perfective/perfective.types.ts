// 🏷️ Types
import type { detectorFamilies } from "./perfective.constants";

/** One family of detectors a sweep can run. */
export type DetectorFamily = (typeof detectorFamilies)[number];

/** How a sweep differs from detecting everything. */
export interface PerfectiveOptions {
  /** The families to run. Defaults to all of them. */
  families?: ReadonlySet<DetectorFamily>;
}
