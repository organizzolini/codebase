import path from "node:path";

import { Injectable } from "@nestjs/common";

import { TreeService } from "../tree/tree.service";

import type { CustomizationInput } from "./customization.types";
import type { ResolvedCodometerCustomStatistic } from "@codometer/configuration";
import type { CustomStatisticResult } from "@codometer/core";
import type {
  CommentCounter,
  CommentMeasurement,
  TypescriptSymbolCounter,
} from "@codometer/languages";

/**
 * Counts the conventions a repository holds itself to. Which counters apply comes from configuration, not this package.
 *
 * Files and directories are measured here; declaration and comment counts arrive from `@codometer/languages`.
 */
@Injectable()
export class CustomizationService {
  // 🏗 Dependency Injection

  constructor(private readonly treeService: TreeService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Turn a `comment`-selector statistic's own breaches into its result. */
  private buildCommentResult(
    statistic: ResolvedCodometerCustomStatistic,
    commentCounts: Record<string, CommentMeasurement[]>,
  ): CustomStatisticResult {
    const breaches = (commentCounts[statistic.label] ?? []).filter(
      (measurement) => measurement.breached,
    );

    return {
      color: statistic.color,
      count: breaches.length,
      group: statistic.group,
      instances: breaches.map((measurement) => ({
        file: measurement.file,
        line: measurement.line,
        measured: measurement.measured,
      })),
      label: statistic.label,
    };
  }

  /** Turn a `tree`-selector statistic's breaching directories into its result. */
  private buildTreeResult(
    statistic: ResolvedCodometerCustomStatistic,
    files: string[],
  ): CustomStatisticResult {
    const { tree } = statistic;
    const judged =
      statistic.patterns.length === 0
        ? files
        : files.filter((filePath) =>
            statistic.patterns.some((pattern) =>
              path.matchesGlob(filePath, pattern),
            ),
          );
    const breaches =
      tree?.maximumBreadth === undefined
        ? this.treeService.measureDepth({
            exclude: tree?.exclude ?? [],
            files: judged,
            maximum: tree?.maximumDepth ?? 0,
          })
        : this.treeService.measureBreadth({
            exclude: tree.exclude,
            files: judged,
            maximum: tree.maximumBreadth,
          });

    return {
      color: statistic.color,
      count: breaches.length,
      group: statistic.group,
      instances: breaches.map((breach) => ({
        file: breach.directory,
        measured: breach.measured,
      })),
      label: statistic.label,
    };
  }

  /**
   * Counts the files claimed by at least one glob; a file matching several globs counts once.
   */
  private countMatches(files: string[], patterns: string[]): number {
    return files.filter((filePath) =>
      patterns.some((pattern) => path.matchesGlob(filePath, pattern)),
    ).length;
  }

  // 🌎 Public Methods

  /** Count every configured statistic over the discovered files. */
  analyze({
    commentCounts,
    files,
    statistics,
    symbolCounts,
  }: CustomizationInput): CustomStatisticResult[] {
    return statistics.map((statistic) => {
      if (statistic.comment !== undefined) {
        return this.buildCommentResult(statistic, commentCounts);
      }

      if (statistic.tree !== undefined) {
        return this.buildTreeResult(statistic, files);
      }

      return {
        color: statistic.color,
        count:
          statistic.symbols === undefined
            ? this.countMatches(files, statistic.patterns)
            : (symbolCounts[statistic.label] ?? 0),
        group: statistic.group,
        label: statistic.label,
      };
    });
  }

  /**
   * Picks the counters `@codometer/languages`' comment services measure. Each measurer selects its own by `kind`.
   */
  buildCommentCounters(
    statistics: CustomizationInput["statistics"],
  ): CommentCounter[] {
    const counters: CommentCounter[] = [];

    for (const statistic of statistics) {
      const { comment, label } = statistic;

      if (comment === undefined) {
        continue;
      }

      counters.push({
        budget: {
          maximumCharacters: comment.maximumCharacters,
          maximumLines: comment.maximumLines,
          maximumWords: comment.maximumWords,
          severity: comment.severity,
        },
        kind: comment.kind,
        label,
        language: comment.language,
      });
    }

    return counters;
  }

  /**
   * Picks the counters the TypeScript analyzer tallies during its existing walk, rather than walking files again.
   */
  buildSymbolCounters(
    statistics: CustomizationInput["statistics"],
  ): TypescriptSymbolCounter[] {
    return statistics.flatMap((statistic) =>
      statistic.symbols === undefined
        ? []
        : [
            {
              kinds: statistic.symbols.kinds,
              label: statistic.label,
              modifiers: statistic.symbols.modifiers ?? [],
              patterns: statistic.patterns,
            },
          ],
    );
  }
}
