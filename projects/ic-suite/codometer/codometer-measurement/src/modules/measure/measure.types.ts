// 🏷️ Types

import type { DiscoveryResult } from "../discovery/discovery.types";
import type { EvaluatedLimit, TargetMetricIndex } from "../limits/limits.types";
import type { SizeResult } from "../size/size.types";
import type {
  ResolvedCodometerConfiguration,
  ResolvedCodometerCustomStatistic,
  ResolvedCodometerInput,
} from "@codometer/configuration";
import type { CodeStatisticsResult, ReportFailure } from "@codometer/core";
import type {
  CommentCounter,
  TypescriptSymbolCounter,
} from "@codometer/languages";

/**
 * Arguments accepted when running every analyzer over one set of files.
 */
export interface AnalyzeFilesArguments {
  commentCounters: CommentCounter[];
  configuration: ResolvedCodometerConfiguration;
  discoveredFiles: DiscoveryResult;
  statistics: ResolvedCodometerCustomStatistic[];
  symbolCounters: TypescriptSymbolCounter[];
  workingDirectory: string;
}

/** One input's analysis results; skipped ones are `undefined`, not zero. */
export interface InputMeasurement {
  /** How many files the input's globs claimed. */
  files: number;
  language: CodeStatisticsResult | undefined;
  name: string;
  size: SizeResult | undefined;
}

/**
 * Arguments accepted by the measurement pipeline.
 */
export interface MeasureArguments {
  configuration: ResolvedCodometerConfiguration;
  /**
   * Files codometer writes itself, relative to the measured directory.
   *
   * Never measured, so flags never change what is measured.
   */
  outputPaths: readonly string[];
  workingDirectory: string;
}

/**
 * Arguments accepted when measuring one declared input.
 */
export interface MeasureInputArguments {
  commentCounters: CommentCounter[];
  configuration: ResolvedCodometerConfiguration;
  input: ResolvedCodometerInput;
  outputPaths: readonly string[];
  statistics: ResolvedCodometerCustomStatistic[];
  symbolCounters: TypescriptSymbolCounter[];
  workingDirectory: string;
}

/** Everything one run measured, input by input; `statistics` stands apart. */
export interface MeasurementResult {
  /**
   * What the run could not do, collected rather than thrown.
   *
   * One run names every failure rather than stopping at the first.
   */
  failures: ReportFailure[];
  /** Every metric each measured input counted, addressable by dotted path. */
  indexes: Map<string, TargetMetricIndex>;
  /** Every input measured, in the order `inputs` declared them. */
  inputs: InputMeasurement[];
  /**
   * What every declared limit found, in declaration order.
   *
   * Empty when none is declared, which is the ordinary case.
   */
  limits: EvaluatedLimit[];
  statistics: CodeStatisticsResult;
}
