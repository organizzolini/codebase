// 🏷️ Types

import type { CombinedGraphExports } from "../graph-run/graph-run.types";
import type { FORMAT_NAMES } from "./combined-output.constants";
import type { BoundaryReportArguments } from "@codependix/boundaries";

/** What `--format` prints, derived from `FORMAT_NAMES`. */
export type CombinedOutputFormat = (typeof FORMAT_NAMES)[number];

/** Arguments for producing every combined output a run asked for. */
export interface CombinedOutputRunArguments {
  /**
   * The boundary pass's findings, beside the graph types. Absent unless a
   * boundary pass ran and was asked to print.
   */
  boundaries?: BoundaryReportArguments | undefined;
  format: CombinedOutputFormat;
  graphs: CombinedGraphExports;
  jsonOutputPath: string | undefined;
  markdownOutputPath: string | undefined;
  workingDirectory: string;
}
