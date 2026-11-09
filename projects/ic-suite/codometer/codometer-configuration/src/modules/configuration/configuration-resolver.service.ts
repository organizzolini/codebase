import {
  InvalidConfigurationError,
  InvalidLimitValueError,
} from "@codometer/core";
import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { codometerConfigurationSchema } from "./configuration-schema.constants";
import {
  DEFAULT_CODEBASE_INPUT,
  DEFAULT_CUSTOM_STATISTIC_COLORS,
  DEFAULT_CUSTOM_STATISTIC_GROUP,
  DEFAULT_EXCLUDE_GLOBS,
  DEFAULT_INPUT_COMPRESSION,
  DEFAULT_INPUT_DIRECTORY,
  DEFAULT_INPUT_NAME,
  DEFAULT_JSON_INDENTATION,
  DEFAULT_LIMIT_SEVERITY,
  DEFAULT_MARKDOWN_END_MARKER,
  DEFAULT_MARKDOWN_START_MARKER,
  DEFAULT_PYTHON_COMMAND,
  LIMIT_UNIT_MULTIPLIERS,
  LIMIT_VALUE_PATTERN,
  NEGATION_PREFIX,
} from "./configuration.constants";

import type {
  CodometerConfiguration,
  CodometerCustomStatistic,
  CodometerInput,
  CodometerJsonOutput,
  CodometerLimit,
  CodometerMarkdownOutput,
  CodometerOutput,
} from "./configuration.types";
import type {
  ResolvedCodometerConfiguration,
  ResolvedCodometerCustomStatistic,
  ResolvedCodometerInput,
  ResolvedCodometerJsonOutput,
  ResolvedCodometerLimit,
  ResolvedCodometerMarkdownOutput,
  ResolvedCodometerOutput,
} from "./resolved.types";
import type { CodometerStatisticGroup } from "@codometer/core";

/**
 * Fills a validated configuration in, field by field, with what it left out. Not exported; `ConfigurationService` states what the layer answers, and this class holds how each default is arrived at.
 */
@Injectable()
export class ConfigurationResolverService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Validates a configuration object, refusing it in prose. Loaded files and the empty stand-in fail identically.
   */
  private parseConfigurationInternal(
    configuration: unknown,
  ): CodometerConfiguration {
    const parsed = codometerConfigurationSchema.safeParse(configuration);

    if (!parsed.success) {
      throw new InvalidConfigurationError(z.prettifyError(parsed.error));
    }

    return parsed.data;
  }

  /**
   * Reads a limit's value, in decimal units when written as text. Anything unreadable is refused, not coerced to zero.
   */
  private parseLimitValue(limit: CodometerLimit): number {
    if (typeof limit.value !== "number") {
      return this.parseLimitValueText(limit.metric, limit.value);
    }

    if (!Number.isFinite(limit.value) || limit.value < 0) {
      throw new InvalidLimitValueError(limit.metric, String(limit.value));
    }

    return limit.value;
  }

  /**
   * Reads a limit written as text, unit included. The rounding keeps `"0.1 KB"` from arriving as a float artifact.
   */
  private parseLimitValueText(metric: string, text: string): number {
    const [, amount, unit] = LIMIT_VALUE_PATTERN.exec(text.trim()) ?? [];

    if (amount === undefined || unit === undefined) {
      throw new InvalidLimitValueError(metric, text);
    }

    if (unit === "") {
      return Number(amount);
    }

    const multiplier = LIMIT_UNIT_MULTIPLIERS.get(unit.toLowerCase());

    if (multiplier === undefined) {
      throw new InvalidLimitValueError(metric, text);
    }

    return Math.round(Number(amount) * multiplier);
  }

  /**
   * Gives each counter a color and group, and its `comment` selector a severity. Colors follow position within a group, so additions recolor nothing.
   */
  private resolveCustomStatistics(
    statistics: CodometerCustomStatistic[] | undefined,
  ): ResolvedCodometerCustomStatistic[] {
    const positionsByGroup = new Map<CodometerStatisticGroup, number>();

    return (statistics ?? []).map((statistic) => {
      const group = statistic.group ?? DEFAULT_CUSTOM_STATISTIC_GROUP;
      const position = positionsByGroup.get(group) ?? 0;
      positionsByGroup.set(group, position + 1);
      const { comment } = statistic;

      return {
        color:
          statistic.color ??
          DEFAULT_CUSTOM_STATISTIC_COLORS[
            position % DEFAULT_CUSTOM_STATISTIC_COLORS.length
          ] ??
          "7c3aed",
        comment:
          comment === undefined
            ? undefined
            : {
                kind: comment.kind,
                language: comment.language,
                maximumCharacters: comment.maximumCharacters,
                maximumLines: comment.maximumLines,
                maximumWords: comment.maximumWords,
                severity: comment.severity ?? DEFAULT_LIMIT_SEVERITY,
              },
        group,
        label: statistic.label,
        patterns: statistic.patterns ?? [],
        symbols: statistic.symbols,
      };
    });
  }

  /**
   * Fills in an input's compression and directory, and folds `!` include globs into its excludes.
   */
  private resolveInput(input: CodometerInput): ResolvedCodometerInput {
    return {
      analyses: [...input.analyses],
      compression: input.compression ?? DEFAULT_INPUT_COMPRESSION,
      directory: input.directory ?? DEFAULT_INPUT_DIRECTORY,
      exclude: [
        ...new Set([
          ...input.include
            .filter((pattern) => pattern.startsWith(NEGATION_PREFIX))
            .map((pattern) => pattern.slice(NEGATION_PREFIX.length)),
          ...(input.exclude ?? []),
        ]),
      ],
      include: input.include.filter(
        (pattern) => !pattern.startsWith(NEGATION_PREFIX),
      ),
      name: input.name,
    };
  }

  /**
   * Resolves every declared input, prepending the built-in `codebase` one unless a declared input replaces it by that name.
   */
  private resolveInputs(
    inputs: CodometerInput[] | undefined,
  ): ResolvedCodometerInput[] {
    const declared = inputs ?? [];
    const hasCodebaseInput = declared.some(
      (input) => input.name === DEFAULT_INPUT_NAME,
    );
    const effective = hasCodebaseInput
      ? declared
      : [DEFAULT_CODEBASE_INPUT, ...declared];

    return effective.map((input) => this.resolveInput(input));
  }

  /** Applies defaults to one JSON output destination. */
  private resolveJsonOutput(
    output: CodometerJsonOutput,
    customStatistics: readonly ResolvedCodometerCustomStatistic[],
  ): ResolvedCodometerJsonOutput {
    return {
      custom: this.selectCustomStatistics(output.custom, customStatistics),
      indentation: output.indentation ?? DEFAULT_JSON_INDENTATION,
      path: output.path,
      type: "json",
    };
  }

  /**
   * Gives every limit its severity and a numeric value. Which metric it lands on is decided at measurement.
   */
  private resolveLimits(
    limits: CodometerLimit[] | undefined,
  ): ResolvedCodometerLimit[] {
    return (limits ?? []).map((limit) => ({
      label: limit.label,
      metric: limit.metric,
      severity: limit.severity ?? DEFAULT_LIMIT_SEVERITY,
      value: this.parseLimitValue(limit),
    }));
  }

  /** Applies defaults to one markdown output destination. */
  private resolveMarkdownOutput(
    output: CodometerMarkdownOutput,
    customStatistics: readonly ResolvedCodometerCustomStatistic[],
  ): ResolvedCodometerMarkdownOutput {
    return {
      custom: this.selectCustomStatistics(output.custom, customStatistics),
      description: output.description,
      endMarker: output.endMarker ?? DEFAULT_MARKDOWN_END_MARKER,
      path: output.path,
      startMarker: output.startMarker ?? DEFAULT_MARKDOWN_START_MARKER,
      type: "markdown",
      // Left unset rather than defaulted: the built-in rendering and writing
      // live in the CLI that calls it, so "unset" is what selects it.
      write: output.write,
    };
  }

  /** Applies defaults to every declared output destination. */
  private resolveOutputs(
    outputs: CodometerOutput[] | undefined,
    customStatistics: readonly ResolvedCodometerCustomStatistic[],
  ): ResolvedCodometerOutput[] {
    return (outputs ?? []).map((output) =>
      output.type === "json"
        ? this.resolveJsonOutput(output, customStatistics)
        : this.resolveMarkdownOutput(output, customStatistics),
    );
  }

  /**
   * Picks the top-level custom statistics an output's `custom` array selects, by label. The schema already refuses unknown labels.
   */
  private selectCustomStatistics(
    labels: string[] | undefined,
    customStatistics: readonly ResolvedCodometerCustomStatistic[],
  ): ResolvedCodometerCustomStatistic[] {
    const byLabel = new Map(
      customStatistics.map((statistic) => [statistic.label, statistic]),
    );

    return (labels ?? []).flatMap((label) => {
      const statistic = byLabel.get(label);

      return statistic === undefined ? [] : [statistic];
    });
  }

  // 🌎 Public Methods

  /** Validates a configuration object, refusing it in prose rather than in JSON. */
  public parseConfiguration(configuration: unknown): CodometerConfiguration {
    return this.parseConfigurationInternal(configuration);
  }

  /**
   * Fills in every field a configuration file may leave out, so a host's own object takes the same shape.
   */
  public resolveConfiguration(
    configuration: CodometerConfiguration,
  ): ResolvedCodometerConfiguration {
    const custom = this.resolveCustomStatistics(configuration.custom);

    return {
      custom,
      defaultInput: configuration.defaultInput,
      // Additive rather than a replacement: the defaults are directories no
      // repository wants counted, so a configuration naming its own noise
      // should not have to restate them to keep them out.
      exclude: [
        ...new Set([
          ...DEFAULT_EXCLUDE_GLOBS,
          ...(configuration.exclude ?? []),
        ]),
      ],
      excludeFrom: configuration.excludeFrom ?? [],
      format: configuration.format,
      inputs: this.resolveInputs(configuration.inputs),
      limits: this.resolveLimits(configuration.limits),
      outputs: this.resolveOutputs(configuration.outputs, custom),
      python: {
        command: configuration.python?.command ?? DEFAULT_PYTHON_COMMAND,
      },
    };
  }
}
