// 🏷️ Types

import type { ConsoleLogger } from "@nestjs/common";

/** Values beside the log line, kept as queryable fields. */
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

/** Public logger shape, for test doubles without the service. */
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

/** Message split into emoji and the prose telemetry stores. */
export interface ParsedLogMessage {
  emoji: string | undefined;
  text: string;
}
