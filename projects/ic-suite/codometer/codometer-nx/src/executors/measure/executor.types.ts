// 🏷️ Types

/** A batch task whose project is known, ready to measure. */
export interface BatchedTask {
  readonly id: string;
  readonly root: string;
}

/** Nx's four batch arguments: task graph, options, overrides, context. */
export type MeasureBatchExecutorArguments = [
  taskGraph: MeasureBatchTaskGraph,
  options: Readonly<Record<string, MeasureExecutorOptions>>,
  overrides: MeasureExecutorOptions,
  context: MeasureBatchExecutorContext,
];

/** Nx context fields a batch reads: graph roots, workspace root. */
export interface MeasureBatchExecutorContext {
  readonly projectGraph: {
    readonly nodes: Readonly<
      Record<string, undefined | { readonly data: { readonly root: string } }>
    >;
  };
  readonly root: string;
}

/** Each task's id and project, from Nx's task graph. */
export interface MeasureBatchTaskGraph {
  readonly tasks: Readonly<
    Record<string, { readonly target: { readonly project: string } }>
  >;
}

/** One batch task's result, as Nx reads it back. */
export interface MeasureBatchTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}

/** Project and workspace root for one run. */
export interface MeasureExecutorContext {
  readonly projectName?: string | undefined;
  readonly projectsConfigurations: {
    readonly projects: Record<string, undefined | { readonly root: string }>;
  };
  readonly root: string;
}

/** Options the measure executor accepts, as `schema.json` describes them. */
export interface MeasureExecutorOptions {
  /** Fail the task when a limit it declares is breached. */
  readonly check?: boolean | undefined;
  /** The shell command that starts the `codometer` command line, before `measure`. */
  readonly command: string;
  /** The configuration file, relative to the project root. */
  readonly config: string;
  /** Write the JSON report where the configuration says. */
  readonly outputJson?: boolean | undefined;
  /** Write the markdown badge block where the configuration says. */
  readonly outputMarkdown?: boolean | undefined;
}

/** The tasks of a batch that ask for the same measurement. */
export interface MeasurementGroup {
  readonly options: MeasureExecutorOptions;
  readonly tasks: readonly BatchedTask[];
}

/** One directory's verdict, as `codometer measure` prints it for several. */
export interface MeasureVerdict {
  readonly directory: string;
  readonly ok: boolean;
  /** What failed the directory, as plain lines; empty when it passed. */
  readonly report: string;
}

/** What a finished process printed on each stream, and how it exited. */
export interface ProcessOutput {
  readonly status: null | number;
  readonly stderr: string;
  readonly stdout: string;
}
