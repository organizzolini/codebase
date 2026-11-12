import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the 井 (hanzi jing) glyph, a unit square whose sides each run past both ends.
 * Each counts the base template, drawn facing Southeast.
 */
@Injectable()
export class JingHanziLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "井 (hanzi jing)",
      key: (name) => `jing${name}HanziCount`,
      script: "Hanzi",
      shape: "a unit square whose four sides each run a unit past both ends",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, `.` outside it. */
  private readonly template: readonly string[] = [
    ".44.",
    "2ff1",
    "2ff1",
    ".88.",
  ];

  // 🔑 Public Fields

  /** One evaluator per orientation, `jingSoutheastHanziCount` through `jingNorthwestThreeQuarterHanziCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
