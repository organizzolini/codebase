// ♟️ Constants

/** Metric path counting the files a target's globs claimed. */
export const FILES_METRIC_PATH = "files";

/** Prefix on counter paths, so a `files` counter cannot collide. */
export const CUSTOM_METRIC_PREFIX = "custom";

/** Separator between the parts of a metric's dotted path. */
export const METRIC_PATH_SEPARATOR = ".";

/** Metric path of measured bytes; compression is context, not gated. */
export const SIZE_METRIC_PATH = "size";

// 🚨 Errors

/**
 * Raised when a target carrying a limit matched no files.
 *
 * A limit asserts its files exist, so an empty match means a stale glob or a
 * build that never ran, and a zero would pass every limit.
 *
 * Targets nobody limited are left alone.
 */
export class EmptyTargetError extends Error {
  constructor(target: string, metric: string) {
    super(
      `Input "${target}" matched no files, and a limit is written against its "${metric}" metric. A limit says the files are there, so an empty match is a glob that stopped matching or a build that never ran — not a measurement of zero.`,
    );
    this.name = "EmptyTargetError";
  }
}

/**
 * Raised when a limit's dotted path does not name exactly one metric.
 *
 * A path naming nothing gates nothing while looking like a gate. A path naming
 * several would have to pick one, and a limit quietly holding the wrong metric
 * would never be discovered.
 */
export class UnboundMetricError extends Error {
  constructor(path: string, reason: string) {
    super(`Cannot bind the limit written against "${path}": ${reason}`);
    this.name = "UnboundMetricError";
  }
}
