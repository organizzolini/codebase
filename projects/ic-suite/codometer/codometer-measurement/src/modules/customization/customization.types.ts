// 🏷️ Types

import type { ResolvedCodometerCustomStatistic } from "@codometer/configuration";
import type { CommentMeasurement } from "@codometer/languages";

/** Input to the custom statistics step. */
export interface CustomizationInput {
  /**
   * Each `comment` counter's measurements, keyed by its statistic's label.
   *
   * Merged by label from both measurers, since a label names exactly one statistic.
   */
  commentCounts: Record<string, CommentMeasurement[]>;
  /** Every file of the target being counted over. */
  files: string[];
  statistics: ResolvedCodometerCustomStatistic[];
  /** What the TypeScript analyzer tallied, keyed by counter label. */
  symbolCounts: Record<string, number>;
}
