import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the د skeleton: final and isolated.
 * Each counts that form's base template, drawn facing Southwest.
 *
 * A letter differing from a form only by dots or other marks is an alias of it.
 */
@Injectable()
export class DalArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ذ (thal)",
        },
        glyph: "د (final Arabic dal)",
        key: (name) => `dalFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit head stroke above a three-unit baseline, joined to it by a unit stroke one unit short of its east end, where it joins east",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ذ (thal)",
        },
        glyph: "د (isolated Arabic dal)",
        key: (name) => `dalIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit head stroke above a two-unit base stroke, their east ends joined by a unit stroke",
        template: this.isolatedTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright د (final form) as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [".25.", "23b1"];

  /** Upright د (isolated form) as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = [".25", "239"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `dalFinalSoutheastArabicCount` through `dalIsolatedNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
