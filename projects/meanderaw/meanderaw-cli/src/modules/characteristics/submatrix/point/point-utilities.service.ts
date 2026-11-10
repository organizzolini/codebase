import { Injectable } from "@nestjs/common";

import type { MatrixPoint } from "../../../matrix/matrix.types";

/**
 * Shared reading of a single point's raw arm count, injected by every
 * `submatrix/point` evaluator that needs it rather than read off the grid
 * independently.
 */
@Injectable()
export class PointUtilitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * How many of a point's four arms carry ink, read off its digit. Border north and south arms count, matching the legacy histogram.
   */
  public armCount(point: MatrixPoint): number {
    return [point.east, point.north, point.south, point.west].filter(Boolean)
      .length;
  }
}
