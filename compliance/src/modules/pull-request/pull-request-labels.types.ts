// 🏷️ Types

/** One label the conventional vocabulary says this repository must carry. */
export interface ConventionalLabel {
  /** Six hexadecimal digits, no leading `#`, as `gh label` writes them. */
  readonly color: string;
  readonly description: string;
  readonly name: string;
}

/**
 * What one reconciliation would do. Stale labels are reported, never deleted.
 */
export interface LabelReconciliationPlan {
  readonly creations: readonly ConventionalLabel[];
  /**
   * Existing `type:`, `scope:`, or `source:` labels the configuration no
   * longer names, so the repository owner can review them by hand.
   */
  readonly staleNames: readonly string[];
  readonly updates: readonly ConventionalLabel[];
}
