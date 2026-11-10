// 🏷️ Types
import type { DetectedCalendarEvent } from "../src/modules/calendar-events/calendar-events.types";
import type { Input } from "../src/modules/input/input.types";
import type { DetectorFamily } from "../src/modules/perfective/perfective.types";

/** What one sweep of the pipeline detected. */
export interface PipelineWindow {
  /** Perfective then progressive events, sorted by start time. */
  events: DetectedCalendarEvent[];
  /** The validated input the sweep ran with, including the derived timezone. */
  input: Input;
  /** Instantaneous events from the minute-by-minute pass. */
  perfective: DetectedCalendarEvent[];
  /** Span events the progressive pass built from the perfective ones. */
  progressive: DetectedCalendarEvent[];
}

/** How a sweep differs from running every detector. */
export interface PipelineWindowOptions {
  /** The detector families to run. Defaults to all of them. */
  families?: ReadonlySet<DetectorFamily>;
}

/**
 * A place and a short date range to sweep; `endDate` is inclusive, and equal start and end dates are refused.
 */
export interface PipelineWindowRequest {
  /** Last date swept, `YYYY-MM-DD`, in the observer's timezone. */
  endDate: string;
  latitude: number;
  longitude: number;
  /** First date swept, `YYYY-MM-DD`, in the observer's timezone. */
  startDate: string;
}
