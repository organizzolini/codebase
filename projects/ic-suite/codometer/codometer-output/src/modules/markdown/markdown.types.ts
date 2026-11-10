// 🏷️ Types

import type {
  CodometerCompression,
  ResolvedCodometerMarkdownOutput,
} from "@codometer/configuration";
import type { CodeStatisticsResult } from "@codometer/core";

/** Arguments accepted when building the anchor helpers a writer is handed. */
export interface BuildAnchorHelpersArguments {
  check: boolean;
  content: string;
  destination: ResolvedCodometerMarkdownOutput;
}

/**
 * What a run measured: one project, or the repository holding it.
 *
 * Names the first badge group, so the scope is never misreported.
 */
export type MeasurementScope = "project" | "repository";

/** Arguments accepted when rendering the built-in badge report. */
export interface RenderBadgesArguments {
  destination: ResolvedCodometerMarkdownOutput;
  scope: MeasurementScope;
  statistics: CodeStatisticsResult;
  targets: readonly TargetSize[];
}

/** Arguments accepted when rendering a whole document of badges. */
export interface RenderDocumentArguments {
  /** Placed above the badges, exactly as a spliced block places it. */
  description: string | undefined;
  scope: MeasurementScope;
  statistics: CodeStatisticsResult;
  targets: readonly TargetSize[];
}

/** Arguments accepted when splicing a rendered block into a file. */
export interface SyncAnchoredBlockArguments {
  check: boolean;
  content: string;
  destination: ResolvedCodometerMarkdownOutput;
  path: string | undefined;
}

/** Arguments accepted when syncing a markdown destination with the statistics. */
export interface SyncMarkdownArguments {
  check: boolean;
  destination: ResolvedCodometerMarkdownOutput;
  scope: MeasurementScope;
  statistics: CodeStatisticsResult;
  targets: readonly TargetSize[];
}

/**
 * One declared target's measured size. Only targets a run measured reach the badge block.
 */
export interface TargetSize {
  bytes: number;
  compression: CodometerCompression;
  name: string;
}

/** Arguments accepted when wrapping rendered content in the anchor markers. */
export interface WrapInAnchorsArguments {
  content: string;
  destination: ResolvedCodometerMarkdownOutput;
}
