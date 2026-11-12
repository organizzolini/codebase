// 🏷️ Types

/** Issue counts in a knip report, by workspace. */
export interface AttributedIssues {
  readonly byRoot: ReadonlyMap<string, number>;
  /** Issues in a file that sits in none of the workspaces asked about. */
  readonly unattributed: number;
}

/** Arguments for building the command line of one knip run. */
export interface BuildKnipArguments {
  readonly configuration: string;
  readonly directory: string;
  readonly fix: boolean;
  /** `json` for the machine-readable report, `native` for knip's own. */
  readonly format: "json" | "native";
  readonly roots: readonly string[];
}

/** Arguments Nx passes a batch executor, in order. */
export type KnipBatchExecutorArguments = [
  taskGraph: {
    readonly tasks: Readonly<
      Record<string, { readonly target: { readonly project: string } }>
    >;
  },
  options: Readonly<Record<string, KnipExecutorOptions>>,
  overrides: KnipExecutorOptions,
  context: KnipExecutorContext,
];

/** Nx executor context fields read here, without depending on `@nx/devkit`. */
export interface KnipExecutorContext {
  readonly projectGraph: {
    readonly nodes: Readonly<
      Record<string, undefined | { readonly data: { readonly root: string } }>
    >;
  };
  readonly projectName?: string | undefined;
  readonly root: string;
}

/** Options the knip executor accepts — see `schema.json` beside the executor. */
export interface KnipExecutorOptions {
  /** Workspace-relative path of the knip configuration. */
  readonly configuration: string;
  /** Let knip fix what it can, which a batch never does. */
  readonly fix?: boolean | undefined;
}

/** What one task of a knip batch settled on. */
export interface KnipTaskResult {
  readonly success: boolean;
  readonly terminalOutput: string;
}
