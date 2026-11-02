import { normalizeHexadecimalColor } from "./night-sky-colors.utilities";
import {
  isOnVisibleRing,
  projectSkyPoint,
} from "./night-sky-projection.utilities";
import {
  CONSTELLATION_LINE_ATTRIBUTES,
  CONSTELLATION_SEGMENT_STEPS,
  DEFAULT_OPTIONS,
  DEGREES_PER_HOUR,
  RADIANS_PER_DEGREE,
} from "./night-sky.constants";

import type {
  ConstellationSegment,
  LineStyle,
  ProjectedPoint,
  SkyGeometry,
  SkyPoint,
  SkyVector,
} from "./night-sky.types";

// 🌎 Public Functions

/**
 * Draws the figures' segments in the style given, as one group of polylines
 * cut where they leave the ring the window crosses, as stars beyond it are
 * left out. Answers nothing when no segment shows.
 */
export function formatConstellationLines(
  geometry: SkyGeometry,
  segments: readonly ConstellationSegment[],
  style: LineStyle,
): { markup: string; segmentsDrawn: number } {
  const drawn = segments
    .map((segment) => splitIntoRuns(geometry, interpolate(segment)))
    .filter((runs) => runs.length > 0);

  return {
    markup:
      drawn.length > 0
        ? `<g ${formatStroke(style)} ${CONSTELLATION_LINE_ATTRIBUTES}>${drawn
            .flat()
            .map((run) => formatPolyline(run))
            .join("")}</g>`
        : "",
    segmentsDrawn: drawn.length,
  };
}

// 🔏 Private Functions

/**
 * Draws one unbroken run of a segment as a polyline.
 */
function formatPolyline(run: readonly ProjectedPoint[]): string {
  const points = run
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  return `<polyline points="${points}"/>`;
}

/**
 * The stroke's color, opacity and width. The color is read as hexadecimal
 * and written as `#rrggbb`, so nothing else can reach the markup.
 */
function formatStroke(style: LineStyle): string {
  const color = normalizeHexadecimalColor(
    style.lineColor,
    DEFAULT_OPTIONS.lineColor,
  );

  return `stroke="${color}" stroke-opacity="${String(style.lineOpacity)}" stroke-width="${String(style.lineWidth)}"`;
}

/**
 * The points along a segment's great circle, both stars included, so a long
 * segment bends with the projection rather than cutting across it.
 */
function interpolate(segment: ConstellationSegment): SkyPoint[] {
  const from = toVector(segment.from);
  const to = toVector(segment.to);

  return Array.from({ length: CONSTELLATION_SEGMENT_STEPS + 1 }, (_, step) => {
    const fraction = step / CONSTELLATION_SEGMENT_STEPS;

    return toSkyPoint([
      from[0] + (to[0] - from[0]) * fraction,
      from[1] + (to[1] - from[1]) * fraction,
      from[2] + (to[2] - from[2]) * fraction,
    ]);
  });
}

/**
 * Splits a segment's points into the runs that stay on the visible ring,
 * leaving out a run too short to draw.
 */
function splitIntoRuns(
  geometry: SkyGeometry,
  points: readonly SkyPoint[],
): ProjectedPoint[][] {
  const runs: ProjectedPoint[][] = [[]];

  for (const point of points) {
    const projected = projectSkyPoint(geometry, point);

    if (isOnVisibleRing(geometry, projected.radius)) {
      runs.at(-1)?.push(projected);
    } else {
      runs.push([]);
    }
  }

  return runs.filter((run) => run.length > 1);
}

/**
 * The direction of a point of the sky as a vector, any length.
 */
function toSkyPoint([x, y, z]: SkyVector): SkyPoint {
  const hours = Math.atan2(y, x) / RADIANS_PER_DEGREE / DEGREES_PER_HOUR + 24;

  return [hours % 24, Math.atan2(z, Math.hypot(x, y)) / RADIANS_PER_DEGREE];
}

/**
 * A point of the sky as a unit vector.
 */
function toVector([
  rightAscensionHours,
  declinationDegrees,
]: SkyPoint): SkyVector {
  const longitude = rightAscensionHours * DEGREES_PER_HOUR * RADIANS_PER_DEGREE;
  const latitude = declinationDegrees * RADIANS_PER_DEGREE;

  return [
    Math.cos(latitude) * Math.cos(longitude),
    Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude),
  ];
}
