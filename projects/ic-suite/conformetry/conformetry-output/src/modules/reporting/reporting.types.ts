// 🏷️ Types

import type { InstanceScore, ValidationFileResult } from "@conformetry/core";

/** Arguments for rendering one instance/template location line. */
export interface FormatLocationArguments {
  readonly column: number | undefined;
  readonly jsonPath: string | undefined;
  readonly line: number | undefined;
  readonly prefix: string;
}

/** Arguments for rendering a full validation report. */
export interface FormatReportArguments {
  /** Failing files, already grouped by `PluginService` or `FilesService`. */
  readonly fileResults: ValidationFileResult[];
  /**
   * Per-instance scores to summarize above the findings. Perfect scores are left
   * out, so the imperfect ones stay visible.
   */
  readonly scores?: InstanceScore[];
  /**
   * Directory absolute paths are made relative to, keeping reports readable and
   * machine-independent. Passed in, as this package has no workspace awareness.
   */
  readonly workingDirectory: string;
}
