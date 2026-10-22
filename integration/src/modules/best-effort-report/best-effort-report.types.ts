// 🏷️ Types

/** What the pull request says about the steps that were skipped. */
export interface BestEffortReport {
  /** How many steps were skipped. */
  count: number;
  /** One bullet a skipped step, for the pull request's details; empty for none. */
  details: string;
  /** The section that quotes each failure; empty for none. */
  section: string;
}
