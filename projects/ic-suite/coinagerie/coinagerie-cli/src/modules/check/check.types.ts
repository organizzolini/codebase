// 🏷️ Types

/** Whether a run judges the glossaries against the code or rewrites them. */
export type CheckMode = "check" | "write";

/** One project's verdict: whether it passed, and what to report. */
export interface CheckVerdict {
  readonly ok: boolean;
  readonly report: string;
}

/** One destination's comparison with the code's words. */
export interface Difference {
  readonly missing: readonly string[];
  readonly path: string;
  readonly stale: readonly string[];
}

/** Arguments for running one project's check or write. */
export interface RunCheckArguments {
  /** The project's folder, absolute: the root its run scans. */
  readonly directory: string;
  readonly mode: CheckMode;
  /** The project's configuration, relative to `directory`; never searched for. */
  readonly projectConfigurationPath: string;
  /** The workspace root, which paths in the report are relative to. */
  readonly workspaceRoot: string;
}

/** One destination a write visited, and whether it changed the file. */
export interface Written {
  readonly path: string;
  readonly written: boolean;
}
