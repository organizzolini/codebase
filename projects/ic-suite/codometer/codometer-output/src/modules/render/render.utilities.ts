import type { MetricRow } from "../changes/changes.types";
import type { MetricUnit } from "@codometer/core";

/**
 * Formats a byte count in decimal megabytes or kilobytes, matching the decimal units limits are written in.
 */
export function formatBytes(bytes: number): string {
  if (Math.abs(bytes) >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  return `${(bytes / 1000).toFixed(2)} kB`;
}

/** Formats a plain count, grouped with the reader's locale separators. */
export function formatCount(value: number): string {
  return value.toLocaleString();
}

/** Formats a signed delta, or an em dash when there is nothing to compare. */
export function formatDelta(
  delta: number | undefined,
  unit: MetricUnit,
): string {
  if (delta === undefined) return "—";
  const formatted = formatValue(delta, unit);
  return delta >= 0 ? `+${formatted}` : formatted;
}

/** Formats a value the way its unit calls for. */
export function formatValue(value: number, unit: MetricUnit): string {
  return unit === "bytes" ? formatBytes(value) : formatCount(value);
}

/**
 * Whether a metric changed since the baseline, or breaches a limit. A zero-valued metric appearing for the first time is not a change.
 */
export function hasChanged(row: MetricRow): boolean {
  if (row.breach !== undefined) return true;
  if (row.baseValue === undefined) return row.value !== 0 || row.empty;
  return row.value !== row.baseValue;
}

/**
 * Whether a row has nothing to compare with: no value on `main`, and nothing else that makes it worth showing. A breach, an empty target or a removal still shows.
 */
export function lacksBaseline(row: MetricRow): boolean {
  return (
    row.baseValue === undefined &&
    row.breach === undefined &&
    !row.empty &&
    !row.removed
  );
}

/** Names up to ten projects, then how many more there are. */
export function listProjects(projects: readonly string[]): string {
  const shown = projects.slice(0, 10).map((project) => `\`${project}\``);
  const more = projects.length - shown.length;

  return more > 0
    ? `${shown.join(", ")} and ${more} more`
    : `${projects.length} ${projects.length === 1 ? "project" : "projects"}: ${shown.join(", ")}`;
}
