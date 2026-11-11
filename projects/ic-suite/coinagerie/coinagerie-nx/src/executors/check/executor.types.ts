// 🏷️ Types

/** Nx's four batch arguments: task graph, options, overrides, context. */
export type CheckBatchExecutorArguments = [
  taskGraph: CheckBatchTaskGraph,
  options: Record<string, CheckExecutorOptions>,
  overrides: CheckExecutorOptions,
  context: CheckBatchExecutorContext,
];

/** Nx context fields a batch reads: graph roots, workspace root. */
export interface CheckBatchExecutorContext {
  readonly projectGraph: {
    readonly nodes: Record<
      string,
      { readonly data: { readonly root: string } }
    >;
  };
  readonly root: string;
}

/** Each task's id and project, from Nx's task graph. */
export interface CheckBatchTaskGraph {
  readonly tasks: Record<
    string,
    { readonly target: { readonly project: string } }
  >;
}

/** One batch task's result, as Nx reads it back. */
export interface CheckBatchTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}

/** Project, its root, and workspace root for one run. */
export interface CheckExecutorContext {
  readonly projectName?: string | undefined;
  readonly projectsConfigurations: {
    readonly projects: Record<string, undefined | { readonly root: string }>;
  };
  readonly root: string;
}

/** Options the check executor accepts. */
export interface CheckExecutorOptions {
  /** The shell command that starts the `coinagerie` command line. */
  readonly command: string;
  /** Rewrite each glossary to hold the code's words instead of judging it. */
  readonly write?: boolean | undefined;
}

/** One task of a group: its id and project folder. */
export interface CheckTask {
  readonly directory: string;
  readonly id: string;
}

/** The tasks that can share one command-line process: same command, same mode. */
export interface CheckTaskGroup {
  readonly command: string;
  readonly mode: "check" | "write";
  readonly tasks: CheckTask[];
}

/** One project's verdict, as the `batch` command prints it. */
export interface CheckVerdictRecord {
  readonly directory: string;
  readonly ok: boolean;
  readonly report: string;
}

/** What a finished process printed on each stream, and how it exited. */
export interface ProcessOutput {
  readonly status: null | number;
  readonly stderr: string;
  readonly stdout: string;
}
