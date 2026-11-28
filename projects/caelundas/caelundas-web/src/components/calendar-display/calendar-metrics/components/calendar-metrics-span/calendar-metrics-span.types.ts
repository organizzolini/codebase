// 🏷️ Types

/**
 * How a duration span is written.
 */
export interface DurationSpanOptions {
  /**
   * Abbreviates the units and, unless maxUnits says otherwise, keeps three.
   */
  compact?: boolean;
  /**
   * How many of the leading non-zero units to write.
   */
  maxUnits?: number;
}

/**
 * A span's unit: minutes and labels by abbreviation and plurality.
 */
export interface SpanUnit {
  labels: Readonly<
    Record<"false" | "true", Readonly<Record<"false" | "true", string>>>
  >;
  minutes: number;
}
