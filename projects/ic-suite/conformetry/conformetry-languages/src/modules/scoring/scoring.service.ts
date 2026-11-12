import { Injectable } from "@nestjs/common";

import {
  DEFAULT_ERROR_WEIGHT,
  EMPTY_TEMPLATE_SCORE,
  PERFECT_SCORE,
} from "./scoring.constants";

import type { CalculateScoreArguments, WeightedFinding } from "./scoring.types";

/**
 * Turns weights into conformance scores.
 *
 * The same arithmetic runs in seven places, one per language package, plus the
 * file-existence pass and the run aggregate. Two edge cases matter: a finding
 * with no declared weight, and an empty template whose denominator is zero.
 */
@Injectable()
export class ScoringService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Returns the share of checked requirements the instance honoured, from 0 to 1.
   *
   * Clamped at both ends, so a double-count cannot go negative.
   */
  public calculateScore(args: CalculateScoreArguments): number {
    if (args.totalWeight <= 0) {
      return EMPTY_TEMPLATE_SCORE;
    }

    const score = (args.totalWeight - args.failedWeight) / args.totalWeight;

    return Math.min(PERFECT_SCORE, Math.max(0, score));
  }

  /** Adds up what a set of findings costs, defaulting each to its own weight. */
  public sumWeights(differences: readonly WeightedFinding[]): number {
    return differences.reduce((total, error) => {
      return total + (error.weight ?? DEFAULT_ERROR_WEIGHT);
    }, 0);
  }
}
