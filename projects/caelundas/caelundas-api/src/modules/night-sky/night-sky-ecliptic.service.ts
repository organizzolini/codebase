import { Injectable } from "@nestjs/common";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyProjectionService } from "./night-sky-projection.service";
import {
  DEFAULT_OPTIONS,
  DEGREES_PER_HOUR,
  ECLIPTIC_ATTRIBUTES,
  ECLIPTIC_STEP_DEGREES,
  OBLIQUITY_DEGREES,
  RADIANS_PER_DEGREE,
} from "./night-sky.constants";

import type { EclipticStyle, SkyGeometry, SkyPoint } from "./night-sky.types";

/**
 * Draws the ecliptic, the Sun's yearly path and the line the zodiac lies
 * along.
 */
@Injectable()
export class NightSkyEclipticService {
  // 🏗 Dependency Injection

  constructor(
    private readonly colors: NightSkyColorsService,
    private readonly projection: NightSkyProjectionService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Draws the ecliptic as a dashed path cut where it leaves the ring the
   * window crosses. Answers nothing when no part of it shows.
   */
  public formatEcliptic(geometry: SkyGeometry, style: EclipticStyle): string {
    const runs = this.projection.splitIntoRuns(geometry, this.trace());

    if (runs.length === 0) {
      return "";
    }

    const color = this.colors.readColor(
      style.eclipticColor,
      DEFAULT_OPTIONS.eclipticColor,
    );

    return `<g data-layer="ecliptic" stroke="${color}" stroke-opacity="${String(style.eclipticOpacity)}" stroke-width="${String(style.eclipticWidth)}" ${ECLIPTIC_ATTRIBUTES}>${runs.map((run) => this.projection.formatPolyline(run)).join("")}</g>`;
  }

  /**
   * The ecliptic point at a longitude, as right ascension hours and
   * declination, via obliquity.
   */
  public toPoint(longitudeDegrees: number): SkyPoint {
    const longitude = longitudeDegrees * RADIANS_PER_DEGREE;
    const obliquity = OBLIQUITY_DEGREES * RADIANS_PER_DEGREE;
    const rightAscension = Math.atan2(
      Math.cos(obliquity) * Math.sin(longitude),
      Math.cos(longitude),
    );
    const declination = Math.asin(Math.sin(obliquity) * Math.sin(longitude));
    const hours = rightAscension / RADIANS_PER_DEGREE / DEGREES_PER_HOUR;

    return [((hours % 24) + 24) % 24, declination / RADIANS_PER_DEGREE];
  }

  /**
   * The ecliptic's points from longitude 0 round to 360, the last the first.
   */
  public trace(): SkyPoint[] {
    return Array.from({ length: 360 / ECLIPTIC_STEP_DEGREES + 1 }, (_, step) =>
      this.toPoint(step * ECLIPTIC_STEP_DEGREES),
    );
  }
}
