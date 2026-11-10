// 🏷️ Types

import type { CombinedGraphEntry } from "../graph-run/graph-run.types";
import type { ProjectRunResult } from "@codependix/core";

/** One whole-workspace graph pass's outcome. */
export interface WorkspaceGraphRunOutcome {
  /**
   * The graph's own data for combined output. Populated whenever the workspace
   * target is not `"none"`, even if no destination was written.
   */
  entry: CombinedGraphEntry | undefined;
  /** The delivery outcome, or `undefined` when nothing was configured to deliver. */
  result: ProjectRunResult | undefined;
}
