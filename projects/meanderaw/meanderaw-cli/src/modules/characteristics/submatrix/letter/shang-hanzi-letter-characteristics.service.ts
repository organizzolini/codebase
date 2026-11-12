import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the 上 glyph: a two-unit base, a stem rising from
 * its middle, and a stroke reaching east. One per corner and clockwise rotation, each counting the
 * base template drawn that way. The base faces Southeast.
 */
@Injectable()
export class ShangHanziLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "上 (hanzi shang)",
      key: (name) => `shang${name}HanziCount`,
      script: "Hanzi",
      shape:
        "a two-unit base with a two-unit stem rising from its middle and a unit stroke reaching east from the stem's middle",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [".4.", ".e1", "2b1"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `shangSoutheastHanziCount` through `shangNorthwestThreeQuarterHanziCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
