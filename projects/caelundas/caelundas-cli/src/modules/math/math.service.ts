import { Injectable } from "@nestjs/common";

import type { Coordinates, Longitude } from "../ephemeris/ephemeris.types";
import type { NeighborValues } from "./math.types";

/**
 * NestJS provider for astronomical math: angle normalization, angular distance, extremum detection and combinatorics. Arc constants are `static readonly` so consumers can use them in static fields without DI.
 */
@Injectable()
export class MathService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /**
   * Number of arcminutes in one degree (60).
   */
  static readonly arcminutesPerDegree = 60;

  /**
   * Number of arcseconds in one arcminute (60).
   */
  static readonly arcsecondsPerArcminute = 60;

  /**
   * Number of arcseconds in one degree (3600).
   */
  static readonly arcsecondsPerDegree = 3600;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Whether a value crosses zero upward nearest the current minute: a crossing
   * belongs to its nearer minute, so each lands on one minute.
   */
  crossesUpwardNearCurrent(args: NeighborValues): boolean {
    const { current, next, previous } = args;
    if (previous < 0 && current >= 0) {
      return previous / (previous - current) >= 0.5;
    }
    if (current < 0 && next >= 0) {
      return current / (current - next) < 0.5;
    }
    return false;
  }

  /**
   * Shortest angular distance between two longitudes, in [0, 180]; wraps around
   * 0°/360°.
   */
  getAngle(longitude1: Longitude, longitude2: Longitude): number {
    const normalizedLongitude1 = this.normalizeDegrees(longitude1);
    const normalizedLongitude2 = this.normalizeDegrees(longitude2);

    let angle = Math.abs(normalizedLongitude1 - normalizedLongitude2);
    if (angle > 180) {
      angle = 360 - angle;
    }
    return angle;
  }

  /**
   * True angular separation between two ecliptic positions, latitude included;
   * the arctangent form stays exact near 0° and 180°.
   */
  getAngularSeparation(first: Coordinates, second: Coordinates): number {
    const toRadians = Math.PI / 180;
    const [firstLongitude, firstLatitude] = first;
    const [secondLongitude, secondLatitude] = second;
    const latitude1 = firstLatitude * toRadians;
    const latitude2 = secondLatitude * toRadians;
    const longitudeGap = (secondLongitude - firstLongitude) * toRadians;
    const across = Math.hypot(
      Math.cos(latitude2) * Math.sin(longitudeGap),
      Math.cos(latitude1) * Math.sin(latitude2) -
        Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeGap),
    );
    const along =
      Math.sin(latitude1) * Math.sin(latitude2) +
      Math.cos(latitude1) * Math.cos(latitude2) * Math.cos(longitudeGap);
    return Math.atan2(across, along) / toRadians;
  }

  /**
   * All k-element combinations of an array, by recursive backtracking.
   */
  getCombinations<T>(array: T[], combinationSize: number): T[][] {
    const result: T[][] = [];

    /** Recursively builds fixed-size combinations by extending the current selection in order. */
    function combine(start: number, chosen: T[]): void {
      if (chosen.length === combinationSize) {
        result.push([...chosen]);
        return;
      }

      for (let position = start; position < array.length; position++) {
        const element = array[position];
        if (element) {
          chosen.push(element);
          combine(position + 1, chosen);
          chosen.pop();
        }
      }
    }

    combine(0, []);
    return result;
  }

  /**
   * Whether a value is a local maximum: greater than both its previous and next
   * neighbors.
   */
  isMaximum(args: NeighborValues): boolean {
    const { current, next, previous } = args;
    return previous < current && current > next;
  }

  /**
   * Whether a value is a local minimum: less than both its previous and next
   * neighbors.
   */
  isMinimum(args: NeighborValues): boolean {
    const { current, next, previous } = args;
    return previous > current && current < next;
  }

  /**
   * Normalizes an angle in degrees to [0, 360).
   */
  normalizeDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
  }

  /**
   * Adjusts a longitude to the reference's side of the 0°/360° boundary, so
   * differences are continuous; may fall outside [0, 360).
   */
  normalizeForComparison(current: Longitude, reference: Longitude): number {
    if (Math.abs(current - reference) > 180) {
      return current < reference ? current + 360 : current - 360;
    }
    return current;
  }
}
