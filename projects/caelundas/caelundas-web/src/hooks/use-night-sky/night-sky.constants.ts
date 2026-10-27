import type { ColorSegment } from "./night-sky.types";

// 🌍 Astronomy

/**
 * Earth's sidereal rotation rate, in radians per second.
 */
export const EARTH_ROTATION_RADIANS_PER_SECOND = 7.2921159e-5;

/**
 * Seconds in one sidereal day.
 */
export const SIDEREAL_DAY_SECONDS = 86_164.0905;

export const DEGREES_PER_HOUR = 15;

export const RADIANS_PER_DEGREE = Math.PI / 180;

export const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * Julian day of the Unix epoch, and of the J2000 epoch the star catalog uses.
 */
export const UNIX_EPOCH_JULIAN_DAY = 2_440_587.5;

export const J2000_JULIAN_DAY = 2_451_545;

// 🔭 Defaults

export const DEFAULT_OPTIONS = {
  bottomAltitudeDegrees: 0,
  debug: false,
  faintestMagnitude: 6.5,
  pixelsPerSecond: 12,
  starScale: 1,
  verticalFieldOfViewDegrees: 20,
} as const;

/**
 * The default observer, New York, whose sky the backdrop shows unless a link
 * names another place.
 */
export const DEFAULT_OBSERVER = {
  latitudeDegrees: 40.73,
  longitudeDegrees: -74,
} as const;

// ⏱ Page

/**
 * How long the window must stay the same size before the sky is rebuilt to
 * fit it.
 */
export const RESIZE_DEBOUNCE_MILLISECONDS = 250;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// 📐 Geometry

/**
 * Extra pixels kept on either side of the ring of visible stars, so a dot
 * near the edge is not dropped.
 */
export const RING_MARGIN = 24;

/**
 * The pole stays at least this many degrees beyond the top edge.
 */
export const POLE_MARGIN_DEGREES = 1;

export const MINIMUM_FIELD_OF_VIEW_DEGREES = 2;

// ✨ Stars

export const STAR_RADIUS_BASE = 2.9;

export const STAR_RADIUS_PER_MAGNITUDE = 0.34;

export const STAR_RADIUS_FLOOR = 0.55;

/**
 * Stars brighter than this get a soft glow behind them.
 */
export const GLOW_MAGNITUDE_LIMIT = 2.8;

export const GLOW_RADIUS_FACTOR = 4.2;

/**
 * Dots are drawn this much larger in the zoomed-out tuning view.
 */
export const DEBUG_STAR_FACTOR = 2.4;

export const DEBUG_MARGIN = 30;

// 🎨 Color

export const COLOR_BUCKETS_PER_UNIT = 10;

export const COLOR_BUCKET_LOWEST = -4;

export const COLOR_BUCKET_HIGHEST = 20;

/**
 * The orange end of the color ramp, also the fallback for any color index the
 * lookup does not place.
 */
export const LAST_COLOR_SEGMENT: ColorSegment = {
  from: 1.5,
  fromColor: [255, 184, 119],
  to: 2,
  toColor: [255, 154, 85],
};

/**
 * B−V color index to display color, from blue-white to orange, as a blackbody
 * ramp.
 */
export const COLOR_SEGMENTS: readonly ColorSegment[] = [
  { from: -0.4, fromColor: [155, 176, 255], to: 0, toColor: [202, 215, 255] },
  { from: 0, fromColor: [202, 215, 255], to: 0.4, toColor: [248, 247, 255] },
  { from: 0.4, fromColor: [248, 247, 255], to: 0.7, toColor: [255, 244, 234] },
  { from: 0.7, fromColor: [255, 244, 234], to: 1, toColor: [255, 217, 176] },
  { from: 1, fromColor: [255, 217, 176], to: 1.5, toColor: [255, 184, 119] },
  LAST_COLOR_SEGMENT,
];

export const COLOR_INDEX_LOWEST = -0.4;

export const COLOR_INDEX_HIGHEST = 2;

// 🖼 Markup

export const SKY_DEFINITIONS =
  '<defs><linearGradient id="sky-background" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#04060f"/>' +
  '<stop offset="1" stop-color="#0d1533"/>' +
  "</linearGradient>" +
  '<radialGradient id="star-glow">' +
  '<stop offset="0" stop-color="#cfd9ff" stop-opacity=".42"/>' +
  '<stop offset="1" stop-color="#cfd9ff" stop-opacity="0"/>' +
  "</radialGradient></defs>";

export const DEBUG_LINE_ATTRIBUTES =
  'fill="none" stroke="#ffb877" vector-effect="non-scaling-stroke"';

export const DEBUG_LABEL_ATTRIBUTES =
  'fill="#ffb877" font-family="IBM Plex Mono, ui-monospace, monospace" ' +
  'font-size="64"';
