import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the 申 glyph: a two-by-two grid of unit squares
 * with a middle stroke a unit past top and bottom. One per corner and clockwise rotation, each
 * counting the base template drawn that way. The base faces Southeast.
 */
@Injectable()
export class ShenHanziLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "申 (hanzi shen)",
      key: (name) => `shen${name}HanziCount`,
      script: "Hanzi",
      shape:
        "a two-by-two grid of unit squares whose middle vertical stroke runs a unit past its top and bottom",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [
    ".4.",
    "6f5",
    "efd",
    "af9",
    ".8.",
  ];

  // 🔑 Public Fields

  /** One evaluator per orientation, `shenSoutheastHanziCount` through `shenNorthwestThreeQuarterHanziCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
