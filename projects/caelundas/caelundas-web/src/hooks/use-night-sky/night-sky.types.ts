// 🔖 Catalog

/**
 * One stretch of the color ramp, in B−V color index and RGB.
 */
export interface ColorSegment {
  from: number;
  fromColor: readonly [number, number, number];
  to: number;
  toColor: readonly [number, number, number];
}

// 🔖 Options

/**
 * A field of view after clamping it so the pole stays above the top edge.
 */
export interface FieldOfView {
  clamped: boolean;
  degrees: number;
  limitDegrees: number;
}

/**
 * How fast the sky turns on screen.
 */
export interface Motion {
  periodSeconds: number;
  realTimeMultiple: number;
}

// 🔖 Result

/**
 * A finished backdrop: a standalone animated SVG and what it measured.
 */
export interface NightSky {
  measurements: NightSkyMeasurements;
  svg: string;
}

/**
 * What a build measured, for display and for tuning.
 */
export interface NightSkyMeasurements {
  bottomAltitudeDegrees: number;
  fieldOfViewClamped: boolean;
  fieldOfViewLimitDegrees: number;
  /** Seconds for one full turn at the requested drift speed. */
  periodSeconds: number;
  /** Pixels from the top edge up to the pole, the rotation center. */
  poleDistanceAboveScreen: number;
  /** How many times faster than the real sky the backdrop turns. */
  realTimeMultiple: number;
  starsDrawn: number;
  starsInCatalog: number;
  svgLength: number;
  topAltitudeDegrees: number;
  verticalFieldOfViewDegrees: number;
}

// 🔖 Internals

/**
 * What the builder needs to draw one night sky.
 */
export interface NightSkyOptions {
  /** Altitude at the bottom edge of the window. Defaults to 0. */
  bottomAltitudeDegrees?: number;
  /** Draws the zoomed-out tuning view instead of the backdrop. */
  debug?: boolean;
  /** Faintest star drawn. Defaults to 6.5. */
  faintestMagnitude?: number;
  /** Pixel height of the area the SVG fills. */
  height: number;
  /** Observer latitude, north positive. The view faces north. */
  latitudeDegrees: number;
  /** Local sidereal time in degrees, from `computeLocalSiderealDegrees`. */
  localSiderealDegrees: number;
  /** On-screen drift speed at the window center. Defaults to 12. */
  pixelsPerSecond?: number;
  /** Catalog rows, brightest first. */
  stars: readonly StarRow[];
  /** Multiplier on dot size. Defaults to 1. */
  starScale?: number;
  /** Degrees of altitude shown, top to bottom. Defaults to 20. */
  verticalFieldOfViewDegrees?: number;
  /** Pixel width of the area the SVG fills. */
  width: number;
}

/**
 * One star as SVG markup, with the color bucket it belongs to.
 */
export interface RenderedStar {
  circle: string;
  colorBucket: number;
  glow: string | undefined;
}

/**
 * The options with every default applied.
 */
export type ResolvedNightSkyOptions = Readonly<Required<NightSkyOptions>>;

/**
 * The stars that cross the window, and how many the catalog offered.
 */
export interface SelectedStars {
  inCatalog: number;
  rendered: readonly RenderedStar[];
}

/**
 * Where the pole sits and how far each ring of stars is from it.
 */
export interface SkyGeometry {
  fieldOfView: FieldOfView;
  innerRadius: number;
  outerRadius: number;
  poleX: number;
  poleY: number;
  scale: number;
}

/**
 * One catalog row: right ascension in hours, declination in degrees, apparent
 * magnitude, then the B−V color index.
 */
export type StarRow = readonly [
  rightAscensionHours: number,
  declinationDegrees: number,
  magnitude: number,
  colorIndex: number,
];

/**
 * The SVG frame: its view box, how it fits, the ground and the overlay.
 */
export interface Viewport {
  aspectRatio: string;
  ground: string;
  overlay: string;
  viewBox: string;
}
