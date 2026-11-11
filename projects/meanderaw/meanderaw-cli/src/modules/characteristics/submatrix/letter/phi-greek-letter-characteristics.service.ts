import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the Φ glyph: a box threaded by a vertical stroke
 * running a unit past top and bottom. One per corner and clockwise rotation, each counting the base
 * template drawn that way. The base faces Southeast.
 */
@Injectable()
export class PhiGreekLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      aliases: {
        Southeast: "the hanzi 中 (zhong)",
      },
      glyph: "Φ (Greek phi)",
      key: (name) => `phi${name}GreekCount`,
      script: "Greek",
      shape:
        "a two-unit-wide, unit-tall box threaded through its middle by a vertical stroke that runs a unit past its top and bottom",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [".4.", "6f5", "af9", ".8."];

  // 🔑 Public Fields

  /** One evaluator per orientation, `phiSoutheastGreekCount` through `phiNorthwestThreeQuarterGreekCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
