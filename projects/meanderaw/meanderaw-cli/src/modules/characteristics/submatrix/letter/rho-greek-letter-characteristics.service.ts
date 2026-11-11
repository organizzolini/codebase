import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the Ρ glyph: a closed unit square whose west side
 * runs on a unit below it as a stem. One per corner and clockwise rotation, each counting the base
 * template drawn that way. The base faces Southeast.
 */
@Injectable()
export class RhoGreekLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      aliases: {
        Southeast: "the Latin P and the isolated Arabic م (meem)",
        SoutheastHalf: "the Latin d",
      },
      glyph: "Ρ (Greek rho)",
      key: (name) => `rho${name}GreekCount`,
      script: "Greek",
      shape:
        "a closed unit square whose west side runs on a unit below it as a stem",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = ["65", "e9", "8."];

  // 🔑 Public Fields

  /** One evaluator per orientation, `rhoSoutheastGreekCount` through `rhoNorthwestThreeQuarterGreekCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
