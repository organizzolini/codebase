import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ں skeleton, final and
 * isolated. One per corner and clockwise rotation, each counting that form's base template, which
 * faces Southwest. Letters sharing a skeleton, differing only by dots, are aliases.
 */
@Injectable()
export class NoonArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ن (noon)",
        },
        glyph: "ں (final Arabic dotless noon)",
        key: (name) => `noonFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a two-unit deep bowl with a two-unit tip rising at its west end, whose east side rises to a unit joining stroke",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ن (noon)",
        },
        glyph: "ں (isolated Arabic dotless noon)",
        key: (name) => `noonIsolated${name}ArabicCount`,
        script: "Arabic",
        shape: "a bowl two units wide and two units deep, open to the north",
        template: this.isolatedTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final ں glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = ["4.61", "c.c.", "a39."];

  /** Upright isolated ں glyph as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = ["4.4", "c.c", "a39"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `noonFinalSoutheastArabicCount` through `noonIsolatedNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
