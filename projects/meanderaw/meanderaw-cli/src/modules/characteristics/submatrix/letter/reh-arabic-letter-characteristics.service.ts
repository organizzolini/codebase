import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ر skeleton, final and
 * isolated. One per corner and clockwise rotation, each counting that form's base template, which
 * faces Southwest. Letters sharing a skeleton, differing only by dots, are aliases.
 */
@Injectable()
export class RehArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ز (zain)",
        },
        glyph: "ر (final Arabic reh)",
        key: (name) => `rehFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit joining stroke running east from a one-step staircase that falls west to a unit tail, its curve drawn as an orthogonal zig-zag",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ز (zain)",
        },
        glyph: "ر (isolated Arabic reh)",
        key: (name) => `rehIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit stroke dropping into a one-step staircase that falls west to a unit tail, its curve drawn as an orthogonal zig-zag",
        template: this.isolatedTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final ر glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [".61", "69.", "8.."];

  /** Upright isolated ر glyph as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = [".4", "69", "8."];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `rehFinalSoutheastArabicCount` through `rehIsolatedNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
