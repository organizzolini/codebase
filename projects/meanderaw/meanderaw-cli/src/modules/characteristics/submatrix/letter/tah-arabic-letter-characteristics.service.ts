import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of each positional form of the ط skeleton, final,
 * initial, isolated, and medial. One per corner and clockwise rotation, each counting that form's
 * base template, which faces Southwest. Letters sharing a skeleton, differing only by dots, are
 * aliases.
 */
@Injectable()
export class TahArabicLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.formEvaluators([
      {
        aliases: {
          Southwest: "the final Arabic ظ (zah)",
        },
        glyph: "ط (final Arabic tah)",
        key: (name) => `tahFinal${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit stem rising from the west side of a unit loop whose east corner joins east",
        template: this.finalTemplate,
      },
      {
        aliases: {
          Southwest: "the initial Arabic ظ (zah)",
        },
        glyph: "ط (initial Arabic tah)",
        key: (name) => `tahInitial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit stem rising from the west side of a unit loop whose west corner joins west",
        template: this.initialTemplate,
      },
      {
        aliases: {
          Southwest: "the isolated Arabic ظ (zah)",
        },
        glyph: "ط (isolated Arabic tah)",
        key: (name) => `tahIsolated${name}ArabicCount`,
        script: "Arabic",
        shape: "a unit loop with a unit stem rising from its northwest corner",
        template: this.isolatedTemplate,
      },
      {
        aliases: {
          Southwest: "the medial Arabic ظ (zah)",
        },
        glyph: "ط (medial Arabic tah)",
        key: (name) => `tahMedial${name}ArabicCount`,
        script: "Arabic",
        shape:
          "a unit stem rising from the west side of a unit loop on a three-unit baseline that joins east and west",
        template: this.medialTemplate,
      },
    ]);
  }

  // 🔐 Private Fields

  /** Upright final ط glyph as hexadecimal Code digits, facing Southwest. */
  private readonly finalTemplate: readonly string[] = ["4..", "e5.", "ab1"];

  /** Upright initial ط glyph as hexadecimal Code digits, facing Southwest. */
  private readonly initialTemplate: readonly string[] = [".4.", ".e5", "2b9"];

  /** Upright isolated ط glyph as hexadecimal Code digits, facing Southwest. */
  private readonly isolatedTemplate: readonly string[] = ["4.", "e5", "a9"];

  /** Upright medial ط glyph as hexadecimal Code digits, facing Southwest. */
  private readonly medialTemplate: readonly string[] = [".4..", ".e5.", "2bb1"];

  // 🔑 Public Fields

  /** One evaluator per form and orientation, `tahFinalSoutheastArabicCount` through `tahMedialNorthwestThreeQuarterArabicCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
