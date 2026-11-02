import { normalizeHexadecimalColor } from "./night-sky-colors.utilities";
import {
  formatPolyline,
  splitIntoRuns,
} from "./night-sky-projection.utilities";
import {
  DEFAULT_OPTIONS,
  DEGREES_PER_HOUR,
  ECLIPTIC_ATTRIBUTES,
  ECLIPTIC_STEP_DEGREES,
  OBLIQUITY_DEGREES,
  RADIANS_PER_DEGREE,
} from "./night-sky.constants";

import type { EclipticStyle, SkyGeometry, SkyPoint } from "./night-sky.types";

// 🌎 Public Functions

/**
 * Draws the ecliptic, the Sun's yearly path and the line the zodiac lies
 * along, as a dashed path cut where it leaves the ring the window crosses.
 * Answers nothing when no part of it shows.
 */
export function formatEcliptic(
  geometry: SkyGeometry,
  style: EclipticStyle,
): string {
  const runs = splitIntoRuns(geometry, traceEcliptic());

  if (runs.length === 0) {
    return "";
  }

  const color = normalizeHexadecimalColor(
    style.eclipticColor,
    DEFAULT_OPTIONS.eclipticColor,
  );

  return `<g data-layer="ecliptic" stroke="${color}" stroke-opacity="${String(style.eclipticOpacity)}" stroke-width="${String(style.eclipticWidth)}" ${ECLIPTIC_ATTRIBUTES}>${runs.map((run) => formatPolyline(run)).join("")}</g>`;
}

/**
 * The point of the ecliptic at an ecliptic longitude in degrees, as right
 * ascension in hours from 0 up to 24 and declination in degrees, turned from
 * the ecliptic's frame to the equator's by the obliquity.
 */
export function toEclipticPoint(longitudeDegrees: number): SkyPoint {
  const longitude = longitudeDegrees * RADIANS_PER_DEGREE;
  const obliquity = OBLIQUITY_DEGREES * RADIANS_PER_DEGREE;
  const rightAscension = Math.atan2(
    Math.cos(obliquity) * Math.sin(longitude),
    Math.cos(longitude),
  );
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(longitude));
  const hours = rightAscension / RADIANS_PER_DEGREE / DEGREES_PER_HOUR;

  return [((hours % 24) + 24) % 24, declination / RADIANS_PER_DEGREE];
}

/**
 * The ecliptic's points from longitude 0 round to 360, the last the first.
 */
export function traceEcliptic(): SkyPoint[] {
  return Array.from({ length: 360 / ECLIPTIC_STEP_DEGREES + 1 }, (_, step) =>
    toEclipticPoint(step * ECLIPTIC_STEP_DEGREES),
  );
}
