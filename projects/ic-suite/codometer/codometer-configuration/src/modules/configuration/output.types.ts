// 🏷️ Types

import type { CodeStatisticsResult } from "@codometer/core";

/** Anchor helpers a `write` function would otherwise reimplement. */
export interface MarkdownAnchorHelpers {
  endMarker: string;
  startMarker: string;
  /**
   * Splices the anchored block into a file, appending it when absent.
   *
   * In check mode, returns whether the file is current.
   */
  syncAnchoredBlock: (overrides?: {
    content?: string | undefined;
    path?: string | undefined;
  }) => boolean;
  /** The content wrapped in the configured markers, ready to place anywhere. */
  wrapInAnchors: (content?: string) => string;
}

/** Renders the markdown report. Return `false` to mark it stale. */
export type WriteMarkdownOutput = (
  args: WriteMarkdownOutputArguments,
) => boolean;

/** What a `write` function is handed. */
export interface WriteMarkdownOutputArguments {
  anchors: MarkdownAnchorHelpers;
  /** True when nothing may be written and the file is only being inspected. */
  check: boolean;
  /** The configured description, for a writer that wants to place it itself. */
  description: string | undefined;
  /** The configured path, resolved against the measured directory. */
  path: string | undefined;
  /**
   * The built-in badge rendering of these same statistics.
   *
   * Call it to build the default content, or to add to it.
   */
  renderBadges: () => string;
  statistics: CodeStatisticsResult;
}
