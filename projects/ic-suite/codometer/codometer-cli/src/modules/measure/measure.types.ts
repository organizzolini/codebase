// 🏷️ Types

import type {
  MeasureFormat,
  ResolvedCodometerConfiguration,
  RunMode,
} from "@codometer/configuration";
import type { MeasurementResult } from "@codometer/measurement";
import type {
  ResolvedMarkdownDestination,
  RunDestinations,
} from "@codometer/output";

/** How one directory's run went, and why it failed. */
export interface MeasureOutcome {
  failed: boolean;
  report: string;
}

/** Arguments accepted when weighing what a run found. */
export interface ReportFindingsArguments {
  measurement: MeasurementResult;
  mode: RunMode;
  /** Destinations found not to hold the current output. Only ever non-empty
   * when the run was comparing, since nothing else reads a destination. */
  stalePaths: string[];
}

/** What a run needs after parsing: config, print, outputs, mode. */
export interface RunPlan {
  configuration: ResolvedCodometerConfiguration;
  /** Where the console's own badge block comes from, resolved independently
   * of `destinations.markdown` so it never depends on which `--output-*` flag
   * was passed. */
  consoleMarkdown: ResolvedMarkdownDestination | undefined;
  destinations: RunDestinations;
  format: MeasureFormat | undefined;
  mode: RunMode;
}

/** A run stopped at its command line or configuration, with the reasons. */
export interface RunRejection {
  rejected: string[];
}
