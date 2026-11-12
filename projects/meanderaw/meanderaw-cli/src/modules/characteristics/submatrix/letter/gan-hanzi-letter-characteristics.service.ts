import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the 干 (hanzi gan) glyph, two bars threaded on a vertical stroke.
 * Each counts the base template, drawn facing Southeast.
 */
@Injectable()
export class GanHanziLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "干 (hanzi gan)",
      key: (name) => `gan${name}HanziCount`,
      script: "Hanzi",
      shape:
        "two two-unit bars threaded on a vertical stroke that starts at the upper bar and runs a unit below the lower",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, `.` outside it. */
  private readonly template: readonly string[] = ["271", "2f1", ".8."];

  // 🔑 Public Fields

  /** One evaluator per orientation, `ganSoutheastHanziCount` through `ganNorthwestThreeQuarterHanziCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
