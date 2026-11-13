import path from "node:path";

import { ScoringService } from "@conformetry/languages";
import { Injectable } from "@nestjs/common";

import { DEFAULT_THRESHOLD, SCORE_KEY_SEPARATOR } from "./validation.constants";

import type {
  ScoreInstanceArguments,
  ScoreInstancesArguments,
} from "./validation.types";
import type { MatchedInstance } from "@conformetry/configuration";
import type { InstanceScore } from "@conformetry/core";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Scores each matched instance and decides whether it clears its threshold.
 *
 * Scoring stays separate from the report: deduplication picks which template prints a shared finding, but a score measures this instance's own template, taken before collapsing.
 */
@Injectable()
/* v8 ignore stop */
export class ValidationScoringService {
  // 🏗 Dependency Injection

  constructor(private readonly scoringService: ScoringService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The instance's own directory, joining the name onto the shared parent.
   *
   * Without the name, modules collapse onto one score.
   */
  private resolveInstancePath(instance: MatchedInstance): string {
    return path.join(instance.instance.path, instance.instance.name);
  }

  /** Keys a score by the instance and template it describes. */
  private resolveScoreKey(score: InstanceScore): string {
    return [score.instancePath, score.templateName].join(SCORE_KEY_SEPARATOR);
  }

  // 🌎 Public Methods

  /**
   * Resolves which threshold applies, narrowest level first.
   *
   * The built-in default applies only when no level sets one.
   */
  public resolveThreshold(args: ScoreInstanceArguments): number {
    return (
      args.instance.instance.threshold ??
      args.instance.template.threshold ??
      args.runThreshold ??
      DEFAULT_THRESHOLD
    );
  }

  /** Scores one matched instance against the threshold that applies to it. */
  public scoreInstance(args: ScoreInstanceArguments): InstanceScore {
    const failedWeight = args.fileResults.reduce((total, fileResult) => {
      return total + this.scoringService.sumWeights(fileResult.differences);
    }, 0);
    const totalWeight = args.totalWeight;
    const score = this.scoringService.calculateScore({
      failedWeight,
      totalWeight,
    });
    const threshold = this.resolveThreshold(args);

    return {
      failedWeight,
      instancePath: this.resolveInstancePath(args.instance),
      // A placeholder nothing revealed leaves the template unrendered, so no
      // score can vouch for the instance.
      ok:
        score >= threshold &&
        !args.fileResults.some((fileResult) => {
          return fileResult.differences.some((difference) => {
            return difference.differenceType === "placeholder";
          });
        }),
      score,
      templateName: args.instance.template.name,
      threshold,
      totalWeight,
    };
  }

  /**
   * Scores every matched instance, reporting each instance and template pair once.
   *
   * Where two groups claim one instance with different thresholds, the strictest wins.
   */
  public scoreInstances(args: ScoreInstancesArguments): InstanceScore[] {
    const scoresByKey = new Map<string, InstanceScore>();

    for (const group of args.groups) {
      const score = this.scoreInstance({
        fileResults: group.fileResults,
        instance: group.instance,
        runThreshold: args.runThreshold,
        totalWeight: group.totalWeight,
      });
      const key = this.resolveScoreKey(score);
      const existing = scoresByKey.get(key);

      if (existing === undefined || score.threshold > existing.threshold) {
        scoresByKey.set(key, score);
      }
    }

    return [...scoresByKey.values()];
  }
}
