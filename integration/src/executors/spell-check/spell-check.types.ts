// 🏷️ Types

/** A task of a batch whose project is known, ready to be judged. */
export interface BatchedTask {
  readonly id: string;
  readonly root: string;
}

/** Arguments for building the command line of one cspell run. */
export interface BuildCspellArguments {
  readonly configuration: string;
  readonly roots: readonly string[];
}

/** The arguments Nx calls a batch executor with, in the order it passes them. */
export type SpellCheckBatchExecutorArguments = [
  taskGraph: {
    readonly tasks: Readonly<
      Record<string, { readonly target: { readonly project: string } }>
    >;
  },
  options: Readonly<Record<string, SpellCheckExecutorOptions>>,
  overrides: SpellCheckExecutorOptions,
  context: SpellCheckExecutorContext,
];

/**
 * Fields of Nx's executor context that these executors read. Declared
 * here, not imported from `@nx/devkit`, which this project does not depend on.
 */
export interface SpellCheckExecutorContext {
  readonly projectGraph: {
    readonly nodes: Readonly<
      Record<string, undefined | { readonly data: { readonly root: string } }>
    >;
  };
  readonly projectName?: string | undefined;
  readonly root: string;
}

/** Options the executor accepts — see `schema.json` beside the executor. */
export interface SpellCheckExecutorOptions {
  /** Workspace-relative path of the cspell configuration. */
  readonly configuration: string;
}

/** What one task of a spell-check batch settled on. */
export interface SpellCheckTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}
