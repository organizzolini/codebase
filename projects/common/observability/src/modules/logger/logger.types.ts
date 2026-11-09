// 🏷️ Types

/**
 * Values beside a log line rather than inside it: counts and durations change
 * per occurrence, so they stay queryable fields.
 */
export interface LogData {
  [key: string]: unknown;
  /** How many things the operation handled. */
  count?: number;
  /** Wall-clock milliseconds the operation took. */
  durationMs?: number;
  /** Completion between 0 and 100. */
  percent?: number;
  /** How many things the operation set out to handle. */
  total?: number;
}

/** A message split into the emoji the console shows and the prose telemetry stores. */
export interface ParsedLogMessage {
  emoji: string | undefined;
  text: string;
}
