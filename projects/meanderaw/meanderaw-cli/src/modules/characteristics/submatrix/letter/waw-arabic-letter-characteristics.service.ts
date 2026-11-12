import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the و skeleton, final and
 * isolated. One per corner and clockwise rotation, each counting that form's base template, which
 * faces Southwest. Letters sharing a skeleton, differing only by dots, are aliases.
 */
@Injectable()
export class WawArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ؤ (waw with hamza above)",
        },
        glyph: "و (final Arabic waw)",
        key: (name) => `wawFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop whose southeast corner joins east, dropping into a one-step staircase that falls west to a unit tail, its curve drawn as an orthogonal zig-zag",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ؤ (waw with hamza above)",
        },
        glyph: "و (isolated Arabic waw)",
        key: (name) => `wawIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop whose southeast corner drops into a one-step staircase that falls west to a unit tail, its curve drawn as an orthogonal zig-zag",
        template: this.isolatedTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final و glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [
    "65.",
    "af1",
    "69.",
    "8..",
  ];

  /** Upright isolated و glyph as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = [
    "65",
    "ad",
    "69",
    "8.",
  ];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `wawFinalSoutheastArabicCount` through `wawIsolatedNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
