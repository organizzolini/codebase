/**
 * Least Moon-Sun separation (degrees) in a local solar eclipse.
 */
export interface ClosestApproach {
  sample: TopocentricSample;
  separation: number;
}

/**
 * Contact geometry; in progress while `separation` is below `contactLimit`.
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
 * Geocentric Sun and Moon per minute: ecliptic longitude, latitude, distance.
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

/** Reference frame: geocentric (Earth's center) or topocentric (observer). */
export type EclipseFrame = "geocentric" | "topocentric";

/**
 * Eclipse in progress, its type, and last epoch-ms minute seen.
 */
export interface EclipseOccurrence<TType extends EclipseType> {
  minute: number;
  type: TType;
}

/** Eclipse kind by deepest shadow, as NASA's catalog names it. */
export type EclipseType = LunarEclipseType | SolarEclipseType;

/** How deep a lunar eclipse goes: see {@link EclipseType}. */
export type LunarEclipseType = "partial" | "penumbral" | "total";

/** How deep a solar eclipse goes: see {@link EclipseType}. */
export type SolarEclipseType = "annular" | "hybrid" | "partial" | "total";

/**
 * Topocentric Sun or Moon: ecliptic position and semidiameter, degrees.
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

/** Observer's view of the Sun and Moon at one minute. */
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
