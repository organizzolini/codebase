// 🏷️ Types

/** Options accepted by the conformetry validate executor. */
export interface ValidateExecutorOptions {
  /**
   * Where the conformetry configuration lives, workspace-root relative.
   *
   * Falls back to the plugin registration in `nx.json`.
   */
  readonly configuration?: string;
  /** Language names to restrict the run to; every language when absent. */
  readonly languages?: string[];
  /**
   * Lowest passing score, 0 to 1. The run-level value is the weakest: a
   * generator's or group's threshold overrides it.
   */
  readonly threshold?: number;
}
