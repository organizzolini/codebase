import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the ㅍ glyph: a unit square whose top and bottom
 * strokes run a unit past both sides. One per corner and clockwise rotation, each counting the base
 * template drawn that way. The base faces Southeast.
 */
@Injectable()
export class PieupHangulLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      aliases: {
        SoutheastQuarter: "the hangul ㅒ (yae)",
      },
      glyph: "ㅍ (hangul pieup)",
      key: (name) => `pieup${name}HangulCount`,
      script: "Hangul",
      shape:
        "a unit square whose top and bottom strokes run a unit past both sides",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = ["2771", "2bb1"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `pieupSoutheastHangulCount` through `pieupNorthwestThreeQuarterHangulCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
