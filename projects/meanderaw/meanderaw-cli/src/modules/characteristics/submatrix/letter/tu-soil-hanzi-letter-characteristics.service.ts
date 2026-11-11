import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the 土 glyph: two two-unit bars threaded on a
 * stroke rising a unit above the upper bar. One per corner and clockwise rotation, each counting
 * the base template drawn that way. The base faces Southeast.
 */
@Injectable()
export class TuSoilHanziLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      aliases: {
        Southeast: "the hanzi 士 (shi)",
      },
      glyph: "土 (hanzi tu, soil or earth)",
      key: (name) => `tuSoil${name}HanziCount`,
      script: "Hanzi",
      shape:
        "two two-unit bars threaded on a vertical stroke that runs a unit above the upper bar and stops at the lower",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [".4.", "2f1", "2b1"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `tuSoilSoutheastHanziCount` through `tuSoilNorthwestThreeQuarterHanziCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
