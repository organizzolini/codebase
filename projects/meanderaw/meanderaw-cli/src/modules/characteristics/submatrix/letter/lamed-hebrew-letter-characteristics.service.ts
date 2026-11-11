import { Inject, Injectable } from "@nestjs/common";

import { LetterUtilitiesService } from "./letter-utilities.service";

import type {
  CharacteristicEvaluator,
  CharacteristicEvaluatorGroup,
} from "../../characteristics.types";

/**
 * Provides the sixteen orientation evaluators of the ל (Hebrew lamed) glyph, a unit step with strokes rising and dropping at its ends.
 * Each counts the base template, drawn facing Southwest.
 */
@Injectable()
export class LamedHebrewLetterCharacteristicsService implements CharacteristicEvaluatorGroup<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(LetterUtilitiesService)
    private readonly letterUtilitiesService: LetterUtilitiesService,
  ) {
    this.evaluators = this.letterUtilitiesService.evaluators({
      glyph: "ל (Hebrew lamed)",
      key: (name) => `lamed${name}HebrewCount`,
      script: "Hebrew",
      shape:
        "a unit step, a unit stroke rising from the west end of a unit stroke and another dropping from its east end",
      template: this.template,
    });
  }

  // 🔐 Private Fields

  /** Upright glyph as hexadecimal Code digits, `.` outside it. */
  private readonly template: readonly string[] = ["4.", "a5", ".8"];

  // 🔑 Public Fields

  /** One evaluator per orientation, `lamedSoutheastHebrewCount` through `lamedNorthwestThreeQuarterHebrewCount`. */
  public readonly evaluators: readonly CharacteristicEvaluator<number>[];

  // 🔏 Private Methods

  // 🌎 Public Methods
}
