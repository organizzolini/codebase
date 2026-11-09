/**
 * The Moon's least separation from the Sun over a local solar eclipse, in
 * degrees, with the observer's Sun and Moon at that minute.
 */
export interface ClosestApproach {
  sample: TopocentricSample;
  separation: number;
}

/**
 * One eclipse's contact geometry at a minute, seen from Earth's center; in
 * progress while `separation` is below `contactLimit`.
 */
export interface EclipseContactGeometry {
  /** Separation at external contact, degrees: P1/P4 for both kinds of eclipse. */
  contactLimit: number;
  /**
   * Angular separation, degrees: Moon from the shadow axis (the antisolar
   * point) for a lunar eclipse, Moon from Sun for a solar one.
   */
  separation: number;
}

/** Previous, current and next minute of one eclipse's contact geometry. */
export interface EclipseContactWindow {
  current: EclipseContactGeometry;
  next: EclipseContactGeometry;
  previous: EclipseContactGeometry;
}

// 🏷️ Types
/**
 * Geocentric Sun and Moon geometry per minute: apparent ecliptic longitudes and
 * latitudes in degrees, distances in AU.
 */
export interface EclipseCoordinates {
  distanceMoon: number;
  distanceSun: number;
  latitudeMoon: number;
  latitudeSun: number;
  longitudeMoon: number;
  longitudeSun: number;
}

/** Previous, current and next minute of geocentric eclipse coordinates. */
export interface EclipseCoordinatesWindow {
  current: EclipseCoordinates;
  next: EclipseCoordinates;
  previous: EclipseCoordinates;
}

/**
 * Reference frame for eclipse visibility: geocentric from Earth's centre, or topocentric from the observer.
 */
export type EclipseFrame = "geocentric" | "topocentric";

/**
 * The eclipse in progress and its type, plus the last minute (epoch
 * milliseconds) it was seen, so later minutes reuse that type.
 */
export interface EclipseOccurrence<TType extends EclipseType> {
  minute: number;
  type: TType;
}

/**
 * Kind of eclipse by the deepest shadow reached, as NASA's catalog names it.
 */
export type EclipseType = LunarEclipseType | SolarEclipseType;

/** How deep a lunar eclipse goes: see {@link EclipseType}. */
export type LunarEclipseType = "partial" | "penumbral" | "total";

/** How deep a solar eclipse goes: see {@link EclipseType}. */
export type SolarEclipseType = "annular" | "hybrid" | "partial" | "total";

/**
 * The Sun or the Moon as the observer sees it at one minute: topocentric
 * apparent ecliptic position of date and semidiameter, in degrees.
 */
export interface TopocentricDisc {
  /**
   * How far the upper limb stands above the horizon in degrees, with refraction and semidiameter. Positive while up.
   */
  clearance: number;
  latitude: number;
  longitude: number;
  semidiameter: number;
}

/** The Sun and the Moon as the observer sees them at one minute. */
export interface TopocentricSample {
  moon: TopocentricDisc;
  sun: TopocentricDisc;
}

/** Previous, current and next minute of the observer's Sun and Moon. */
export interface TopocentricWindow {
  current: TopocentricSample;
  next: TopocentricSample;
  previous: TopocentricSample;
}
