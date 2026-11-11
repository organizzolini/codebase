import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the ㅛ glyph: two unit strokes rising from the
 * middle two points of a three-unit base. One per corner and clockwise rotation, each counting the
 * base template drawn that way. The base faces Southeast.
 */
@Injectable()
export class YoHangulLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "ㅛ (hangul yo)",
      key: (name) => `yo${name}HangulCount`,
      script: "Hangul",
      shape:
        "two unit strokes rising from the middle two points of a three-unit base",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [".44.", "2bb1"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `yoSoutheastHangulCount` through `yoNorthwestThreeQuarterHangulCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
