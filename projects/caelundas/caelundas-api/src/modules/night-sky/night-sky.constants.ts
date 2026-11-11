// ♟️ Constants

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

/** Julian days of the Unix and J2000 epochs. */
export const UNIX_EPOCH_JULIAN_DAY = 2_440_587.5;

export const J2000_JULIAN_DAY = 2_451_545;

// 🔭 Defaults

export const DEFAULT_OPTIONS = {
  backgroundBottomColor: "#0d1533",
  backgroundTopColor: "#04060f",
  bottomAltitudeDegrees: 0,
  debug: false,
  ecliptic: true,
  eclipticColor: "#ffffff",
  eclipticOpacity: 0.12,
  eclipticWidth: 1,
  faintestMagnitude: 6.5,
  lineColor: "#ffffff",
  lineOpacity: 0.24,
  lineWidth: 0.8,
  pixelsPerSecond: 3,
  starScale: 1,
  still: false,
  verticalFieldOfViewDegrees: 90,
} as const;

// 📏 Input

/** Most pixels a query may ask the sky to span. */
export const MAXIMUM_SIZE_PIXELS = 8192;

/** Pixel sizes to build for; nearby sizes share one sky. */
export const SIZE_BUCKET_PIXELS = 64;

/** Built skies cached before evicting the least recently used. */
export const NIGHT_SKY_CACHE_SIZE = 64;

/** Milliseconds a time snaps down to; a quarter degree of turn. */
export const MILLISECONDS_PER_MINUTE = 60_000;

// 📐 Geometry

/** Extra pixels beyond the star ring, so edge dots survive. */
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

// Three or six hexadecimal digits, with or without the leading `#`, which a
// link can only carry as `%23`.
export const COLOR_DIGITS_PATTERN = /^#?(?:[\da-f]{3}|[\da-f]{6})$/iu;

export const COLOR_BUCKETS_PER_UNIT = 10;

export const COLOR_BUCKET_LOWEST = -4;

export const COLOR_BUCKET_HIGHEST = 20;

/** Orange end of the color ramp; the fallback for unplaced indexes. */
export const LAST_COLOR_SEGMENT: ColorSegment = {
  from: 1.5,
  fromColor: [255, 184, 119],
  to: 2,
  toColor: [255, 154, 85],
};

/** B−V color index to display color, a blackbody ramp. */
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

/** Steps per figure segment, enough to bend smoothly. */
export const CONSTELLATION_SEGMENT_STEPS = 8;

/** Unfilled, round-ended figure lines, constant width when zoomed out. */
export const CONSTELLATION_LINE_ATTRIBUTES =
  'fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';

// ☀️ Ecliptic

/** Earth's axial tilt at J2000: the ecliptic against the equator. */
export const OBLIQUITY_DEGREES = 23.44;

/** Ecliptic longitude degrees between drawn points, fine enough to curve smoothly. */
export const ECLIPTIC_STEP_DEGREES = 5;

/** Dashed, so the ecliptic reads as a path, not a figure. */
export const ECLIPTIC_ATTRIBUTES =
  'fill="none" stroke-dasharray="6 4" stroke-linecap="round" vector-effect="non-scaling-stroke"';

// 🖼 Markup

export const STAR_GLOW_DEFINITION =
  '<radialGradient id="star-glow">' +
  '<stop offset="0" stop-color="#cfd9ff" stop-opacity=".42"/>' +
  '<stop offset="1" stop-color="#cfd9ff" stop-opacity="0"/>' +
  "</radialGradient>";

export const DEBUG_LINE_ATTRIBUTES =
  'fill="none" stroke="#ffb877" vector-effect="non-scaling-stroke"';

export const DEBUG_LABEL_ATTRIBUTES =
  'fill="#ffb877" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="64"';
