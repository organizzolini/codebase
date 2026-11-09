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

/**
 * What delivery does to a destination: `check` compares, `write` updates.
 * Distinct from `RunMode`, which covers the whole run.
 */
export type CodependixRunMode = "check" | "write";

/**
 * One graph-type pass's outcomes, kept apart: projects that finished, and projects that failed before
 * their exports resolved.
 */
export interface GraphRunOutcome {
  failures: ProjectRunFailure[];
  results: ProjectRunResult[];
}

/**
 * Names the section (`## 🕸️ Codependix`) auto-created when an anchored destination is missing.
 * Supplied per call, not configured.
 */
export interface MarkdownSectionArguments {
  introLine: string;
  /**
   * The `### <subheading>` above the anchor block; `undefined` for the
   * workspace README, whose anchor sits directly under its heading.
   */
  subheading: string | undefined;
}

/**
 * One project's failure before its exports could resolve: a missing anchor, or a NestJS container that would not boot.
 */
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

/**
 * What the run does with the graphs it builds. The three flags are independent, so no flag turns another on.
 */
export interface RunMode {
  readonly checksBoundaries: boolean;
  readonly checksReports: boolean;
  readonly writes: boolean;
}

/**
 * What the command line asked the run to do, and the complaints about it. All complaints are collected
 * before any is reported.
 */
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
