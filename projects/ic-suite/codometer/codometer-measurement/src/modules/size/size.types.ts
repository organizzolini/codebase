// 🏷️ Types

import type { CodometerCompression } from "@codometer/configuration";

/** Arguments accepted when measuring the size of a target's files. */
export interface AnalyzeSizeArguments {
  compression: CodometerCompression;
  /** Paths relative to the working directory, as the target matched them. */
  files: string[];
  workingDirectory: string;
}

/** What size analysis reported over one target. */
export interface SizeResult {
  /**
   * Total bytes the target's files occupy under the chosen compression.
   *
   * A sum of separately compressed files, as browsers fetch them.
   */
  bytes: number;
  compression: CodometerCompression;
  files: number;
}
