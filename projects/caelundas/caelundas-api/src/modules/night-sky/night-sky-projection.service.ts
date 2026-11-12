import { Injectable } from "@nestjs/common";

import { DEGREES_PER_HOUR, RADIANS_PER_DEGREE } from "./night-sky.constants";

import type { ProjectedPoint, SkyGeometry, SkyPoint } from "./night-sky.types";

/**
 * Projects points of the sky onto the plane the SVG is drawn on, and cuts
 * lines where they leave the ring the window crosses.
 */
@Injectable()
export class NightSkyProjectionService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Draws one unbroken run of a line as a polyline.
   */
  public formatPolyline(run: readonly ProjectedPoint[]): string {
    const points = run
      .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");

    return `<polyline points="${points}"/>`;
  }

  /**
   * Whether a point this far from the pole is on a ring the window crosses.
   */
  public isOnVisibleRing(geometry: SkyGeometry, radius: number): boolean {
    return radius >= geometry.innerRadius && radius <= geometry.outerRadius;
  }

  /**
   * Projects a point of the sky about the north celestial pole with a
   * stereographic projection. Facing north, right ascension increases
   * clockwise on screen.
   */
  public project(
    geometry: SkyGeometry,
    [rightAscensionHours, declinationDegrees]: SkyPoint,
  ): ProjectedPoint {
    const radius =
      geometry.scale * this.tangentOfHalfAngle(90 - declinationDegrees);
    const angle = rightAscensionHours * DEGREES_PER_HOUR * RADIANS_PER_DEGREE;

    return {
      radius,
      x: radius * Math.sin(angle),
      y: -radius * Math.cos(angle),
    };
  }

  /**
   * Splits a line's points into the runs that stay on the visible ring,
   * leaving out a run too short to draw.
   */
  public splitIntoRuns(
    geometry: SkyGeometry,
    points: readonly SkyPoint[],
  ): ProjectedPoint[][] {
    const runs: ProjectedPoint[][] = [[]];

    for (const point of points) {
      const projected = this.project(geometry, point);

      if (this.isOnVisibleRing(geometry, projected.radius)) {
        runs.at(-1)?.push(projected);
      } else {
        runs.push([]);
      }
    }

    return runs.filter((run) => run.length > 1);
  }

  /**
   * The tangent of half an angle given in degrees, as the projection needs.
   */
  public tangentOfHalfAngle(degrees: number): number {
    return Math.tan((degrees * RADIANS_PER_DEGREE) / 2);
  }
}
