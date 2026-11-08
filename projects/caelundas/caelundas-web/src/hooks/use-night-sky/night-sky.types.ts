// 🏷️ Types

/**
 * One constellation the sky has a figure for, as the figure picker lists it.
 */
export interface ConstellationListing {
  /** The Latin name, such as `Ursa Major`. */
  name: string;
  zodiac: boolean;
}

/**
 * What the API measured of a sky it drew that the page may warn of.
 */
export interface FieldOfViewMeasurements {
  fieldOfViewClamped: boolean;
  fieldOfViewLimitDegrees: number;
}
