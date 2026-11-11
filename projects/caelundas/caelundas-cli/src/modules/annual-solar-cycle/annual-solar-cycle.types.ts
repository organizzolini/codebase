// 🏷️ Types

import type {
  CoordinateEphemeris,
  DistanceEphemeris,
} from "../ephemeris/ephemeris.types";
import type { Moment } from "moment-timezone";

/** Arguments used to build a single annual solar cycle event. */
export interface BuildSolarCycleEventArguments {
  date: Moment;
  description: string;
  summary: string;
  tags: readonly string[];
}

/** Arguments required to detect all annual solar cycle events at a minute. */
export interface DetectAnnualSolarCycleArguments {
  minute: Moment;
  sunCoordinateEphemeris: CoordinateEphemeris;
  sunDistanceEphemeris: DistanceEphemeris;
}

/** Arguments required to detect annual solar cycle marker events. */
export interface DetectAnnualSolarCycleEventsArguments {
  minute: Moment;
  sunCoordinateEphemeris: CoordinateEphemeris;
}

/** Arguments required to detect solar apsis events. */
export interface DetectSolarApsisEventsArguments {
  minute: Moment;
  sunDistanceEphemeris: DistanceEphemeris;
}

/**
 * Represents the Sun's previous and current ecliptic longitudes around a minute boundary.
 */
export interface SolarCycleLongitudes {
  currentLongitude: number;
  previousLongitude: number;
}

/** Sun's radial speed (AU/day) at this and the prior minute. */
export interface SolarDistanceSample {
  current: number;
  previous: number;
}
