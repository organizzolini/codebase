import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the م
 * (Arabic meem) skeleton: final, initial, and medial. A letter differing from a
 * form's skeleton only by dots or marks is an alias of that form. The isolated
 * form is an alias of the Greek Ρ (rho).
 */
@Injectable()
export class MeemArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        glyph: "م (final Arabic meem)",
        key: (name) => `meemFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop whose northeast corner joins east, with a two-unit tail hanging from its southwest corner",
        template: this.finalTemplate,
      },
      {
        glyph: "م (initial Arabic meem)",
        key: (name) => `meemInitial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop hanging below a joining stroke that runs west from its northwest corner",
        template: this.initialTemplate,
      },
      {
        glyph: "م (medial Arabic meem)",
        key: (name) => `meemMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop hanging below a three-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final م glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [
    "671",
    "e9.",
    "c..",
    "8..",
  ];

  /** Upright initial م glyph as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = ["275", ".a9"];

  /** Upright medial م glyph as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = ["2771", ".a9."];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `meemFinalSoutheastArabicCount` through `meemMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
