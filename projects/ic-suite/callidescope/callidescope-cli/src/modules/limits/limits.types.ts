// 🏷️ Types

/** Which of the two gated limits a row resolves. */
export type LimitName = "maximumBreadth" | "maximumDepth";

/** Options the `limits` command accepts. */
export interface LimitsCommandOptions {
  readonly config: string;
}

/** One project's resolution of one limit, and the file the number came from. */
export interface ProjectLimitRow {
  readonly limit: LimitName;
  /** Workspace-relative file the number is written in. Absent only on the workspace row when no file wrote it. */
  readonly path: string | undefined;
  /** Workspace-relative project root, absent on the workspace's own row. */
  readonly project: string | undefined;
  /** Absent when the project declared no limit of this name. */
  readonly value: number | undefined;
}
