// 🏷️ Types

import type { SizeResult } from "../size/size.types";
import type { ResolvedCodometerConfiguration } from "@codometer/configuration";
import type {
  CodeStatisticsResult,
  CodometerSeverity,
  CustomStatisticResultInstance,
} from "@codometer/core";

/** Arguments accepted when recording one metric within one target's index. */
export interface AddMetricArguments {
  index: TargetMetricIndex;
  /** Set only by a per-instance selector — a `comment` selector today. */
  instances?: CustomStatisticResultInstance[] | undefined;
  metricPath: string;
  value: number;
}

/** Arguments accepted when binding one metric path within one target. */
export interface BindMetricArguments {
  index: TargetMetricIndex;
  /** The path with the target's name already taken off it. */
  metricPath: string;
  /** The path as the limit was written, for an error that has to quote it. */
  path: string;
  target: string;
}

/** A target name that answered to more than one measured target. */
export interface DuplicateTargetFinding {
  reason: string;
  target: string;
}

/**
 * What one limit found once it was pointed at its metric. A breach carries `breached`; a held limit is reported alike.
 */
export interface EvaluatedLimit {
  /** Whether the measured value came out above the limit. */
  breached: boolean;
  /** Stays `undefined` when none was written; a report falls back to the path. */
  label: string | undefined;
  limit: number;
  measured: number;
  /** The metric's path within its target, with no target name on the front. */
  metric: string;
  severity: CodometerSeverity;
  target: string;
}

/** Arguments accepted when evaluating every declared limit. */
export interface EvaluateLimitsArguments {
  configuration: ResolvedCodometerConfiguration;
  indexes: ReadonlyMap<string, TargetMetricIndex>;
}

/**
 * One limit that could not be held against anything. Collected rather than thrown, so one run reports every such limit.
 */
export interface LimitFailure {
  /** The dotted path exactly as the limit was written. */
  metric: string;
  reason: string;
}

/**
 * Every declared limit's result, plus those that bound to nothing. A limit that could not bind is neither a breach nor a pass.
 */
export interface LimitsEvaluation {
  failures: LimitFailure[];
  limits: EvaluatedLimit[];
}

/**
 * What one target measured, as the limits layer reads it. Declared here so this layer needs no measurement types.
 */
export interface MeasuredTarget {
  files: number;
  language: CodeStatisticsResult | undefined;
  name: string;
  size: SizeResult | undefined;
}

/** Where a limit's path landed, and what the metric there measured. */
export interface MetricBinding {
  /**
   * How many files the bound target held.
   *
   * Tells a target that matched nothing, an error, from one that measured zero.
   */
  files: number;
  measured: number;
  metric: string;
  target: string;
}

/** Every measured target's metrics, and the names two targets fought over. */
export interface MetricIndexResult {
  /** Collisions found while indexing, in the order they were found. */
  duplicates: DuplicateTargetFinding[];
  indexes: Map<string, TargetMetricIndex>;
}

/** Arguments accepted when resolving one limit's path to a single metric. */
export interface ResolveMetricArguments {
  defaultInput: string | undefined;
  indexes: ReadonlyMap<string, TargetMetricIndex>;
  /** The dotted path exactly as the limit was written. */
  path: string;
}

/** Every metric one target measured, addressable by dotted path. */
export interface TargetMetricIndex {
  /**
   * Paths more than one metric answers to, which no limit may address.
   *
   * Two counters sharing a label cause this.
   */
  ambiguous: Set<string>;
  files: number;
  /**
   * Per-instance measurements of each metric, keyed by its dotted path.
   *
   * Present only for metrics a per-instance selector produced.
   */
  instances: Map<string, CustomStatisticResultInstance[]>;
  metrics: Map<string, number>;
}
