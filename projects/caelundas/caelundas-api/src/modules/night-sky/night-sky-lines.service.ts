import { Injectable } from "@nestjs/common";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyProjectionService } from "./night-sky-projection.service";
import {
  CONSTELLATION_LINE_ATTRIBUTES,
  CONSTELLATION_SEGMENT_STEPS,
  DEFAULT_OPTIONS,
  DEGREES_PER_HOUR,
  RADIANS_PER_DEGREE,
} from "./night-sky.constants";

import type {
  ConstellationSegment,
  LineStyle,
  SkyGeometry,
  SkyPoint,
  SkyVector,
} from "./night-sky.types";

/**
 * Draws the constellation figures as lines along the sky's great circles.
 */
@Injectable()
export class NightSkyLinesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly colors: NightSkyColorsService,
    private readonly projection: NightSkyProjectionService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The stroke's color, opacity and width. The color is read as hexadecimal
   * and written as `#rrggbb`, so nothing else can reach the markup.
   */
  private formatStroke(style: LineStyle): string {
    const color = this.colors.readColor(
      style.lineColor,
      DEFAULT_OPTIONS.lineColor,
    );

    return `stroke="${color}" stroke-opacity="${String(style.lineOpacity)}" stroke-width="${String(style.lineWidth)}"`;
  }

  /**
   * The points along a segment's great circle, both stars included, so a
   * long segment bends with the projection rather than cutting across it.
   */
  private interpolate(segment: ConstellationSegment): SkyPoint[] {
    const from = this.toVector(segment.from);
    const to = this.toVector(segment.to);

    return Array.from(
      { length: CONSTELLATION_SEGMENT_STEPS + 1 },
      (_, step) => {
        const fraction = step / CONSTELLATION_SEGMENT_STEPS;

        return this.toSkyPoint([
          from[0] + (to[0] - from[0]) * fraction,
          from[1] + (to[1] - from[1]) * fraction,
          from[2] + (to[2] - from[2]) * fraction,
        ]);
      },
    );
  }

  /**
   * The direction of a point of the sky as a vector, any length.
   */
  private toSkyPoint([x, y, z]: SkyVector): SkyPoint {
    const hours = Math.atan2(y, x) / RADIANS_PER_DEGREE / DEGREES_PER_HOUR + 24;

    return [hours % 24, Math.atan2(z, Math.hypot(x, y)) / RADIANS_PER_DEGREE];
  }

  /**
   * A point of the sky as a unit vector.
   */
  private toVector([
    rightAscensionHours,
    declinationDegrees,
  ]: SkyPoint): SkyVector {
    const longitude =
      rightAscensionHours * DEGREES_PER_HOUR * RADIANS_PER_DEGREE;
    const latitude = declinationDegrees * RADIANS_PER_DEGREE;

    return [
      Math.cos(latitude) * Math.cos(longitude),
      Math.cos(latitude) * Math.sin(longitude),
      Math.sin(latitude),
    ];
  }

  // 🌎 Public Methods

  /**
   * Draws the figures' segments in the style given, as one group of polylines
   * cut where they leave the ring the window crosses, as stars beyond it are
   * left out. Answers nothing when no segment shows.
   */
  public formatConstellationLines(
    geometry: SkyGeometry,
    segments: readonly ConstellationSegment[],
    style: LineStyle,
  ): { markup: string; segmentsDrawn: number } {
    const drawn = segments
      .map((segment) =>
        this.projection.splitIntoRuns(geometry, this.interpolate(segment)),
      )
      .filter((runs) => runs.length > 0);

    return {
      markup:
        drawn.length > 0
          ? `<g ${this.formatStroke(style)} ${CONSTELLATION_LINE_ATTRIBUTES}>${drawn
              .flat()
              .map((run) => this.projection.formatPolyline(run))
              .join("")}</g>`
          : "",
      segmentsDrawn: drawn.length,
    };
  }
}
