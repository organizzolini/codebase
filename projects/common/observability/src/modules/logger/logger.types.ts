// 🏷️ Types

import type { ConsoleLogger } from "@nestjs/common";

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

/** The public logger shape used to type test doubles without importing its service. */
export interface LoggerServiceContract extends ConsoleLogger {
  /** Normalizes unknown errors into a stable message and timestamped log line. */
  buildErrorLogEntry(
    context: string,
    error: unknown,
  ): { errorMessage: string; logLine: string };

  /** Builds a timestamped output log file path and ensures the output directory exists. */
  createTimestampedOutputLogFilePath(filePrefix: string): string;

  /** Logs an informational message at the `info` level. */
  info(message: unknown, context?: string, data?: LogData): void;
}

/** A message split into the emoji the console shows and the prose telemetry stores. */
export interface ParsedLogMessage {
  emoji: string | undefined;
  text: string;
}
