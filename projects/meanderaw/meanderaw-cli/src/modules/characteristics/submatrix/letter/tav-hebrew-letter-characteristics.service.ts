import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the ת glyph: a unit roof on two unit legs, the
 * west leg kicking a unit foot out to the west. One per corner and clockwise rotation, each
 * counting the base template drawn that way. The base faces Southwest.
 */
@Injectable()
export class TavHebrewLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "ת (Hebrew tav)",
      key: (name) => `tav${name}HebrewCount`,
      script: "Hebrew",
      shape:
        "a unit roof on two unit legs, the west leg kicking a unit foot out to the west",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, one string per row. */
  private readonly template: readonly string[] = [".65", "298"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `tavSoutheastHebrewCount` through `tavNorthwestThreeQuarterHebrewCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
