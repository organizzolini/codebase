import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ك skeleton: final, initial, isolated, and medial.
 * Each counts that form's base template, drawn facing Southwest.
 *
 * A letter differing from a form only by dots or other marks is an alias of it.
 */
@Injectable()
export class KafArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        glyph: "ك (final Arabic kaf)",
        key: (name) => `kafFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a two-unit stem at the west end of a three-unit baseline that joins east, with a unit tip rising one unit short of its east end",
        template: this.finalTemplate,
      },
      {
        glyph: "ك (initial Arabic kaf)",
        key: (name) => `kafInitial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a three-unit top stroke running west from a unit stem whose foot joins west",
        template: this.initialTemplate,
      },
      {
        glyph: "ك (isolated Arabic kaf)",
        key: (name) => `kafIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a two-unit baseline with a two-unit stem rising from its west end and a unit tip rising from its east end",
        template: this.isolatedTemplate,
      },
      {
        glyph: "ك (medial Arabic kaf)",
        key: (name) => `kafMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a three-unit top stroke running west from a unit stem standing on a two-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright ك (final form) as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = ["4...", "c.4.", "a3b1"];

  /** Upright ك (initial form) as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = ["2335", "..29"];

  /** Upright ك (isolated form) as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = ["4..", "c.4", "a39"];

  /** Upright ك (medial form) as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = ["2335.", "..2b1"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `kafFinalSoutheastArabicCount` through `kafMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
