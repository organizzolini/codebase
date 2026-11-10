import { Inject, Injectable } from "@nestjs/common";

import { PointUtilitiesService } from "./point-utilities.service";

import type {
  CharacteristicContext,
  CharacteristicEvaluator,
  CharacteristicMetadata,
} from "../../characteristics.types";

/**
 * Counts a Code's edges as half the sum of every point's raw arm count, so an edge
 * shared by two points counts once. Border north and south arms still tally, so an
 * odd arm count leaves a half-integer.
 */
@Injectable()
export class EdgeCountCharacteristicService implements CharacteristicEvaluator<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(PointUtilitiesService)
    private readonly pointUtilitiesService: PointUtilitiesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** Names and explains `edgeCount` for catalogs and inspectors. */
  public readonly metadata: CharacteristicMetadata<number> = {
    category: "submatrix",
    description:
      "The number of edges a Code's ink carries, counted as half the sum of every point's own arm count.",
    formula: String.raw`\frac{1}{2} \sum_{p \in M} \left|\text{arms}(p)\right|`,
    key: "edgeCount",
    name: "Edge Count",
    submatrix: { columns: 1, rows: 1 },
    valueType: "number",
  };

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Sums every point's arm count and halves it. */
  public compute(context: CharacteristicContext): number {
    let degreeSum = 0;

    for (const row of context.matrix) {
      for (const point of row) {
        degreeSum += this.pointUtilitiesService.armCount(point);
      }
    }

    return degreeSum / 2;
  }
}
