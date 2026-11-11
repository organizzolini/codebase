import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ص skeleton, final,
 * initial, isolated, and medial. One per corner and clockwise rotation, each counting that form's
 * base template, which faces Southwest. Letters sharing a skeleton, differing only by dots, are
 * aliases.
 */
@Injectable()
export class SadArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ض (dad)",
        },
        glyph: "ص (final Arabic sad)",
        key: (name) => `sadFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop east of a unit tooth on a four-unit baseline that joins east and whose west end drops into a two-unit bowl with a unit tip rising at its west end",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the initial Arabic ض (dad)",
        },
        glyph: "ص (initial Arabic sad)",
        key: (name) => `sadInitial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop east of a unit tooth on a three-unit baseline whose west end joins west",
        template: this.initialTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ض (dad)",
        },
        glyph: "ص (isolated Arabic sad)",
        key: (name) => `sadIsolated${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop with a unit tooth west of it on a three-unit baseline whose west end drops into a two-unit bowl with a unit tip rising at its west end",
        template: this.isolatedTemplate,
      },
      {
        aliases: {
          Southwest: "the medial Arabic ض (dad)",
        },
        glyph: "ص (medial Arabic sad)",
        key: (name) => `sadMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit loop east of a unit tooth on a four-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final ص glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = [
    "...465.",
    "4.6bbb1",
    "a39....",
  ];

  /** Upright initial ص glyph as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = [".465", "2bb9"];

  /** Upright isolated ص glyph as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = [
    "...465",
    "4.6bb9",
    "a39...",
  ];

  /** Upright medial ص glyph as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = [".465.", "2bbb1"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `sadFinalSoutheastArabicCount` through `sadMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
