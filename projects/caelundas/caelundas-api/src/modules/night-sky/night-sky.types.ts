// 🏷️ Types

/**
 * One stretch of the color ramp, in B−V color index and RGB.
 */
export interface ColorSegment {
  from: number;
  fromColor: readonly [number, number, number];
  to: number;
  toColor: readonly [number, number, number];
}

/**
 * One segment of a constellation's figure, between two stars, with the
 * constellation it belongs to.
 */
export interface ConstellationSegment {
  from: SkyPoint;
  /** The constellation's Latin name, such as `Ursa Major`. */
  name: string;
  to: SkyPoint;
  /** Whether the constellation is one of the twelve of the zodiac. */
  zodiac: boolean;
}

/**
 * How the ecliptic is stroked.
 */
export interface EclipticStyle {
  /** Hexadecimal color. Defaults to #ffffff. */
  eclipticColor: string;
  /** From 0 to 1. Defaults to 0.12. */
  eclipticOpacity: number;
  /** In on-screen pixels. Defaults to 1. */
  eclipticWidth: number;
}

/**
 * A field of view after clamping it so the pole stays above the top edge.
 */
export interface FieldOfView {
  clamped: boolean;
  degrees: number;
  limitDegrees: number;
}

/**
 * How the constellation figures are stroked.
 */
export interface LineStyle {
  /** Hexadecimal color. Defaults to #ffffff. */
  lineColor: string;
  /** From 0 to 1. Defaults to 0.24. */
  lineOpacity: number;
  /** In on-screen pixels. Defaults to 0.8. */
  lineWidth: number;
}

/**
 * How fast the sky turns on screen.
 */
export interface Motion {
  periodSeconds: number;
  realTimeMultiple: number;
}

/**
 * A finished backdrop: a standalone animated SVG and what it measured.
 */
export interface NightSky {
  measurements: NightSkyMeasurements;
  svg: string;
}

/**
 * What the database holds for the night sky: its stars, brightest first, and
 * every constellation's figure as segments.
 */
export interface NightSkyCatalog {
  segments: readonly ConstellationSegment[];
  stars: readonly StarRow[];
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
  /** Figure segments with any part drawn. */
  segmentsDrawn: number;
  starsDrawn: number;
  starsInCatalog: number;
  svgLength: number;
  topAltitudeDegrees: number;
  verticalFieldOfViewDegrees: number;
}

/**
 * What the builder needs to draw one night sky.
 */
export interface NightSkyOptions {
  /** Hexadecimal color at the bottom of the background. Defaults to #0d1533. */
  backgroundBottomColor?: string;
  /** Hexadecimal color at the top of the background. Defaults to #04060f. */
  backgroundTopColor?: string;
  /** Altitude at the bottom edge of the window. Defaults to 0. */
  bottomAltitudeDegrees?: number;
  /** Figure segments drawn beneath the stars. Defaults to none. */
  constellationSegments?: readonly ConstellationSegment[];
  /** Draws the zoomed-out tuning view instead of the backdrop. */
  debug?: boolean;
  /** Draws the ecliptic, the Sun's path, beneath the stars. Defaults to false. */
  ecliptic?: boolean;
  /** Hexadecimal color of the ecliptic. Defaults to #ffffff. */
  eclipticColor?: string;
  /** Opacity of the ecliptic, from 0 to 1. Defaults to 0.12. */
  eclipticOpacity?: number;
  /** Width of the ecliptic in on-screen pixels. Defaults to 1. */
  eclipticWidth?: number;
  /** Faintest star drawn. Defaults to 6.5. */
  faintestMagnitude?: number;
  /** Pixel height of the area the SVG fills. */
  height: number;
  /** Observer latitude, north positive. The view faces north. */
  latitudeDegrees: number;
  /** Hexadecimal color of the figures. Defaults to #ffffff. */
  lineColor?: string;
  /** Opacity of the figures, from 0 to 1. Defaults to 0.24. */
  lineOpacity?: number;
  /** Width of the figures in on-screen pixels. Defaults to 0.8. */
  lineWidth?: number;
  /** Local sidereal time in degrees, from `computeLocalSiderealDegrees`. */
  localSiderealDegrees: number;
  /** On-screen drift speed at the window center. Defaults to 12. */
  pixelsPerSecond?: number;
  /** Catalog rows, brightest first. */
  stars: readonly StarRow[];
  /** Multiplier on dot size. Defaults to 1. */
  starScale?: number;
  /**
   * Draws the sky at its starting angle, with no animation, for a reader who
   * asks for reduced motion. Defaults to false.
   */
  still?: boolean;
  /** Degrees of altitude shown, top to bottom. Defaults to 20. */
  verticalFieldOfViewDegrees?: number;
  /** Pixel width of the area the SVG fills. */
  width: number;
}

/**
 * A `nightSky` query's input with every default applied and every value
 * checked: the builder's options, less what the server supplies, plus the
 * observer's longitude and the figures asked for by name.
 */
export type ParsedNightSkyInput = Omit<
  ResolvedNightSkyOptions,
  "constellationSegments" | "localSiderealDegrees" | "stars"
> & {
  constellations: readonly string[];
  longitudeDegrees: number;
};

/**
 * A point of the sky projected about the pole, in the rotating group's frame.
 */
export interface ProjectedPoint {
  /** Distance from the pole, which says whether the window can show it. */
  radius: number;
  x: number;
  y: number;
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
 * A point of the sky: right ascension in hours, then declination in degrees.
 */
export type SkyPoint = readonly [
  rightAscensionHours: number,
  declinationDegrees: number,
];

/**
 * A direction in the sky as a vector from the Earth's center, any length.
 */
export type SkyVector = readonly [x: number, y: number, z: number];

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
