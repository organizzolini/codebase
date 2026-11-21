// 🏷️ Types

/** Arguments for judging every directory of a tree against one ceiling. */
export interface MeasureTreeArguments {
  /** Directory globs exempt from the ceiling, with their descendants. */
  exclude: string[];
  /** Every discovered file, relative to the measured root. */
  files: string[];
  maximum: number;
}

/** One directory that broke a tree ceiling, and what it measured. */
export interface TreeBreach {
  /** The directory, relative to the measured root; `.` is the root itself. */
  directory: string;
  measured: number;
}
