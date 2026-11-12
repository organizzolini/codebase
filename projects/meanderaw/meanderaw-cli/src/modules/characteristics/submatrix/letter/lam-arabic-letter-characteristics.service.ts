import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ل skeleton: final, initial, isolated, and medial.
 * Each counts that form's base template, drawn facing Southwest.
 *
 * A letter differing from a form only by dots or other marks is an alias of it.
 */
@Injectable()
export class LamArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        glyph: "ل (final Arabic lam)",
        key: (name) => `lamFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a three-unit stem standing one unit short of the east end of a three-unit baseline that joins east, with a unit tip rising at its west end",
        template: this.finalTemplate,
      },
      {
        glyph: "ل (initial Arabic lam)",
        key: (name) => `lamInitial${name}ArabicCount`,
        script: "Arabic",
        shape: "a three-unit stem whose foot joins west",
        template: this.initialTemplate,
      },
      {
        glyph: "ل (isolated Arabic lam)",
        key: (name) => `lamIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a three-unit stem dropping into a two-unit bowl with a unit tip rising at its west end",
        template: this.isolatedTemplate,
      },
      {
        glyph: "ل (medial Arabic lam)",
        key: (name) => `lamMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a three-unit stem standing on a two-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright ل (final form) as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [
    "..4.",
    "..c.",
    "4.c.",
    "a3b1",
  ];

  /** Upright ل (initial form) as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = [
    ".4",
    ".c",
    ".c",
    "29",
  ];

  /** Upright ل (isolated form) as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = [
    "..4",
    "..c",
    "4.c",
    "a39",
  ];

  /** Upright ل (medial form) as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = [
    ".4.",
    ".c.",
    ".c.",
    "2b1",
  ];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `lamFinalSoutheastArabicCount` through `lamMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
