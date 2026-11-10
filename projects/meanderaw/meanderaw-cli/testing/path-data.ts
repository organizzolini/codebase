/**
 * Assertions about generated SVG path data, shared by the motif services'
 * own unit tests. Each reads the rendered path back rather than recomputing
 * the geometry that produced it, so a test cannot drift with the code it is
 * checking.
 */

// 🔧 Configuration

/**
 * How far two coordinates may differ before the difference is real. Rounding to five decimals can leave equal values a few millionths apart.
 */
export const COORDINATE_ROUNDING_TOLERANCE = 0.0001;

// 🌎 Utilities

/**
 * Whether a document lays ink back over ink it already drew: two same-axis commands in a row retrace a segment.
 */
export const retracesItself = (document: string): boolean =>
  [...document.matchAll(/\sd="([^"]*)"/gu)].some((match) =>
    /HH|VV/u.test((match[1] ?? "").replaceAll(/[^HMV]/gu, "")),
  );

/** The rightmost x-coordinate a stretch of path data draws. */
export const rightmostX = (pathData: string): number =>
  Math.max(
    ...[...pathData.matchAll(/[MH]([\d.]+)/g)].map((match) => Number(match[1])),
  );

/**
 * Splits a unit's path into its motif trace and the border appended after it. Trims the border the service draws.
 */
export const splitTrace = (
  fullPath: string,
  borderSegment: string,
): { border: string; trace: string } => ({
  border: borderSegment,
  trace: fullPath.slice(0, fullPath.length - borderSegment.length),
});
