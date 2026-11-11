// 🏷️ Types

/**
 * A constellation the sky draws a figure for.
 */
export interface ConstellationListing {
  /** The Latin name, such as `Ursa Major`. */
  name: string;
  zodiac: boolean;
}

/**
 * The API's field-of-view measurements, for a warning.
 */
export interface FieldOfViewMeasurements {
  fieldOfViewClamped: boolean;
  fieldOfViewLimitDegrees: number;
}
