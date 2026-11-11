/**
 * Assertions about generated SVG path data, shared by the motif services'
 * own unit tests. Each reads the rendered path back rather than recomputing
 * the geometry that produced it, so a test cannot drift with the code it is
 * checking.
 */

// 🔧 Configuration

/** Coordinate tolerance; rounded values can differ by millionths. */
export const COORDINATE_ROUNDING_TOLERANCE = 0.0001;

// 🌎 Utilities

/** Whether two same-axis commands in a row retrace a segment. */
export const retracesItself = (document: string): boolean =>
  [...document.matchAll(/\sd="([^"]*)"/gu)].some((match) =>
    /HH|VV/u.test((match[1] ?? "").replaceAll(/[^HMV]/gu, "")),
  );

/** The rightmost x-coordinate a stretch of path data draws. */
export const rightmostX = (pathData: string): number =>
  Math.max(
    ...[...pathData.matchAll(/[MH]([\d.]+)/g)].map((match) => Number(match[1])),
  );

/** A unit's motif trace, without its trailing border. */
export const splitTrace = (
  fullPath: string,
  borderSegment: string,
): { border: string; trace: string } => ({
  border: borderSegment,
  trace: fullPath.slice(0, fullPath.length - borderSegment.length),
});
