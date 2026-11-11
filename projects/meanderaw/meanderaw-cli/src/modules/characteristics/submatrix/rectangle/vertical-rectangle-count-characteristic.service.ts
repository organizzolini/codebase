import { Inject, Injectable } from "@nestjs/common";

import { RectangleUtilitiesService } from "./rectangle-utilities.service";

import type {
  CharacteristicContext,
  CharacteristicEvaluator,
  CharacteristicMetadata,
} from "../../characteristics.types";

/**
 * Counts vertical rectangles of a Code: isolated rings of ink taller than wide.
 * A ring is isolated when every point on it carries exactly its ring's arms.
 * Squares count toward neither orientation.
 */
@Injectable()
export class VerticalRectangleCountCharacteristicService implements CharacteristicEvaluator<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(RectangleUtilitiesService)
    private readonly rectangleUtilitiesService: RectangleUtilitiesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** Names and explains `verticalRectangleCount` for catalogs and inspectors. */
  public readonly metadata: CharacteristicMetadata<number> = {
    category: "submatrix",
    description:
      "The number of isolated rectangular rings of ink taller than it is wide, measured in edges.",
    formula: String.raw`\left|\{\, R \subseteq M : R \text{ an isolated rectangular ring},\ w(R) < h(R) \,\}\right|`,
    key: "verticalRectangleCount",
    name: "Vertical Rectangle Count",
    submatrix: { columns: 2, rows: 3, variable: true },
    valueType: "number",
  };

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Counts the isolated rings whose width and height compare as `w < h`. */
  public compute(context: CharacteristicContext): number {
    return this.rectangleUtilitiesService.countIsolatedRectangles(
      context.matrix,
      (width, height) => width < height,
    );
  }
}
