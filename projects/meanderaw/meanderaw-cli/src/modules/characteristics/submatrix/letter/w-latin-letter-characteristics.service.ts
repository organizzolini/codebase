import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the W glyph: three legs rising from a bar, the
 * middle one half as long, legs pointing north. One per corner and clockwise rotation, each
 * counting the base template drawn that way. The base faces Southeast.
 */
@Injectable()
export class WLatinLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "W",
      key: (name) => `w${name}LatinCount`,
      script: "Latin",
      shape:
        "three legs rising from a bar, the middle one half as long, legs pointing north",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = ["4.4", "c4c", "ab9"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `wSoutheastLatinCount` through `wNorthwestThreeQuarterLatinCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
