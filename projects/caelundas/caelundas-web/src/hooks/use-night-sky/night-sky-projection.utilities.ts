import { DEGREES_PER_HOUR, RADIANS_PER_DEGREE } from "./night-sky.constants";

import type { ProjectedPoint, SkyGeometry, SkyPoint } from "./night-sky.types";

// 🌎 Public Functions

/**
 * Whether a point this far from the pole is on a ring the window crosses.
 */
export function isOnVisibleRing(
  geometry: SkyGeometry,
  radius: number,
): boolean {
  return radius >= geometry.innerRadius && radius <= geometry.outerRadius;
}

/**
 * Projects a point of the sky about the north celestial pole with a
 * stereographic projection. Facing north, right ascension increases clockwise on screen.
 */
export function projectSkyPoint(
  geometry: SkyGeometry,
  [rightAscensionHours, declinationDegrees]: SkyPoint,
): ProjectedPoint {
  const radius = geometry.scale * tangentOfHalfAngle(90 - declinationDegrees);
  const angle = rightAscensionHours * DEGREES_PER_HOUR * RADIANS_PER_DEGREE;

  return {
    radius,
    x: radius * Math.sin(angle),
    y: -radius * Math.cos(angle),
  };
}

/**
 * The tangent of half an angle given in degrees, as the projection needs.
 */
export function tangentOfHalfAngle(degrees: number): number {
  return Math.tan((degrees * RADIANS_PER_DEGREE) / 2);
}
