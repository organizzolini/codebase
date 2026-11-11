// 🏷️ Types

/** Result of comparing a Markdown file's anchor against freshly built content. */
export interface AnchorCheckResult {
  /** The content the anchor currently holds. */
  readonly currentContent: string;
  /** The content a fresh run would produce. */
  readonly freshContent: string;
  /** Whether the anchor already holds the fresh content. */
  readonly isCurrent: boolean;
}

/** What delivery does to a destination: `check` or `write`. */
export type CodependixRunMode = "check" | "write";

/** One graph pass's outcomes: finished projects, and early failures. */
export interface GraphRunOutcome {
  failures: ProjectRunFailure[];
  results: ProjectRunResult[];
}

/** Section heading auto-created when an anchored destination is missing. */
export interface MarkdownSectionArguments {
  introLine: string;
  /**
   * The `### <subheading>` above the anchor block; `undefined` for the
   * workspace README, whose anchor sits directly under its heading.
   */
  subheading: string | undefined;
}

/** Missing anchor, or a NestJS container that will not boot. */
export interface ProjectRunFailure {
  error: string;
  projectName: string;
}
// 🏷️ Types

/** One project's outcome after its configured destinations were resolved. */
export interface ProjectRunResult {
  isCurrent: boolean;
  projectName: string;
  staleExports: StaleExport[];
  stalePaths: string[];
}

/** What the run does with built graphs; flags are independent. */
export interface RunMode {
  readonly checksBoundaries: boolean;
  readonly checksReports: boolean;
  readonly writes: boolean;
}

/** Requested run settings, and every complaint about them. */
export interface RunModeSelection {
  readonly errors: readonly string[];
  readonly mode: RunMode;
}

/** One destination that no longer holds what a fresh export would produce. */
export interface StaleExport {
  /** The anchor name if the destination is an anchored Markdown block, or undefined. */
  readonly anchor?: string | undefined;
  /** What differs between the current destination and the fresh export: "graph" or "formatting". */
  readonly difference: StaleExportDifference;
  /** The relative destination path (e.g. "README.md", "codependix-nx-graph.json"). */
  readonly path: string;
}

/** What differs between the current destination and the fresh export. */
export type StaleExportDifference = "formatting" | "graph";
