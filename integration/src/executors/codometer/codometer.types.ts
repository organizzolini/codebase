// 🏷️ Types

/** A task of a batch whose project is known, ready to be measured. */
export interface BatchedTask {
  readonly id: string;
  readonly root: string;
}

/** The arguments Nx calls a batch executor with, in the order it passes them. */
export type CodometerBatchExecutorArguments = [
  taskGraph: {
    readonly tasks: Readonly<
      Record<string, { readonly target: { readonly project: string } }>
    >;
  },
  options: Readonly<Record<string, CodometerExecutorOptions>>,
  overrides: CodometerExecutorOptions,
  context: CodometerExecutorContext,
];

/**
 * The fields of Nx's executor context these executors read, stated here since this project does not depend on `@nx/devkit`.
 */
export interface CodometerExecutorContext {
  readonly projectGraph: {
    readonly nodes: Readonly<
      Record<string, undefined | { readonly data: { readonly root: string } }>
    >;
  };
  readonly projectName?: string | undefined;
  readonly root: string;
}

/** Options the executor accepts — see `schema.json` beside the executor. */
export interface CodometerExecutorOptions {
  /** Fail the task when a limit it declares is breached. */
  readonly check?: boolean | undefined;
  /** The configuration file, relative to the project root. */
  readonly config: string;
  /** Where to write the markdown badge block, relative to the project root. */
  readonly outputMarkdown?: string | undefined;
}

/** What one task of a codometer batch settled on. */
export interface CodometerTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}

/** The tasks of a batch that ask for the same measurement. */
export interface MeasurementGroup {
  readonly options: CodometerExecutorOptions;
  readonly tasks: readonly BatchedTask[];
}

/** Arguments for running codometer on one project. */
export interface RunCodometerArguments {
  readonly options: CodometerExecutorOptions;
  readonly root: string;
  readonly workspaceRoot: string;
}

/** Arguments for running codometer once over several projects. */
export interface RunCodometerBatchArguments {
  readonly options: CodometerExecutorOptions;
  readonly roots: readonly string[];
  readonly workspaceRoot: string;
}
