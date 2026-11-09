// 🏷️ Types

/** Options accepted by the validate command. */
export interface ValidateCommandOptions {
  config: string;
  instances?: string[];
  languages?: string[];
  /**
   * Templates to narrow the run to, or `["all"]` for every one. Absent means
   * undecided, so the picker asks.
   */
  templates?: string[];
  threshold?: number;
}
