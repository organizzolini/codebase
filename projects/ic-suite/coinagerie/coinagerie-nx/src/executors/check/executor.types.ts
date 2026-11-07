// 🏷️ Types

/**
 * The four arguments Nx calls a batch executor with, in the order it passes them.
 *
 * A tuple rather than four parameters because Nx fixes that signature and the
 * workspace holds a function to three: the task graph, each task's resolved
 * options by task id, the overrides of the whole run, and the context.
 */
export type CheckBatchExecutorArguments = [
  taskGraph: CheckBatchTaskGraph,
  options: Record<string, CheckExecutorOptions>,
  overrides: CheckExecutorOptions,
  context: CheckBatchExecutorContext,
];

/** What a batch reads of Nx's context: the project graph's roots and the workspace root. */
export interface CheckBatchExecutorContext {
  readonly projectGraph: {
    readonly nodes: Record<
      string,
      { readonly data: { readonly root: string } }
    >;
  };
  readonly root: string;
}

/** What a batch reads of Nx's task graph: each task's id and its project. */
export interface CheckBatchTaskGraph {
  readonly tasks: Record<
    string,
    { readonly target: { readonly project: string } }
  >;
}

/**
 * What one task of a check batch settled on.
 *
 * Nx's own type for a batch executor's result is not exported through
 * `@nx/devkit`, so this states the shape Nx reads back: whether the task
 * passed, and the output to show and to store with it in the cache.
 */
export interface CheckBatchTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}

/** What a single run reads of Nx's context: its project, that project's root, and the workspace root. */
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

/** One task of a group: its id, and the project folder it judges. */
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
