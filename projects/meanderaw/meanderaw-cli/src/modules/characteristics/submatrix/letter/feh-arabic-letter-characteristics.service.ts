import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ڡ skeleton: final, initial, isolated, and medial.
 * Each counts that form's base template, drawn facing Southwest.
 *
 * A letter differing from a form only by dots or other marks is an alias of it.
 */
@Injectable()
export class FehArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ف (feh)",
        },
        glyph: "ڡ (final Arabic dotless feh)",
        key: (name) => `fehFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop on a four-unit baseline that joins east, with a unit tip rising at its west end",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the initial Arabic ف (feh), ٯ (dotless qaf), and ق (qaf)",
        },
        glyph: "ڡ (initial Arabic dotless feh)",
        key: (name) => `fehInitial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop raised on a unit neck at its east side, whose foot runs two units west to join",
        template: this.initialTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ف (feh)",
        },
        glyph: "ڡ (isolated Arabic dotless feh)",
        key: (name) => `fehIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop at the east end of a three-unit baseline with a unit tip rising at its west end",
        template: this.isolatedTemplate,
      },
      {
        aliases: {
          Southwest: "the medial Arabic ف (feh), ٯ (dotless qaf), and ق (qaf)",
        },
        glyph: "ڡ (medial Arabic dotless feh)",
        key: (name) => `fehMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop raised on a unit neck at its east side, standing on a three-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright ڡ (final form) as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = ["4.65.", "a3bb1"];

  /** Upright ڡ (initial form) as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = [".65", ".ad", "239"];

  /** Upright ڡ (isolated form) as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = ["4.65", "a3b9"];

  /** Upright ڡ (medial form) as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = [".65.", ".ad.", "23b1"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `fehFinalSoutheastArabicCount` through `fehMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
