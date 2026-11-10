// 🏷️ Types

/** Options the `depth` and `breadth` executors accept. */
export interface AddressExecutorOptions {
  /** The callables to look up, each `<file>#<qualified-name>`. Plural, so one run answers about a whole rename. */
  readonly addresses?: string[] | undefined;
  readonly configuration: string;
  readonly format?: string | undefined;
  /** Nx project names to resolve against, replacing the target's own project. */
  readonly projects?: string[] | undefined;
  /** Nx project tags to resolve against, matching a project carrying any of them. */
  readonly tags?: string[] | undefined;
  /** Widen the selection along the Nx dependency graph. Defaults to true. */
  readonly withDependencies?: boolean | undefined;
}
