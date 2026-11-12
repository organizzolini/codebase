// 🏷️ Types

/** A batch task whose project is known, ready to judge. */
export interface BatchedTask {
  readonly id: string;
  readonly root: string;
}

/** Arguments for building the command line of one cspell run. */
export interface BuildCspellArguments {
  readonly configuration: string;
  readonly roots: readonly string[];
}

/** Arguments Nx passes a batch executor, in order. */
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

/** Nx executor context fields read here, without depending on `@nx/devkit`. */
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
