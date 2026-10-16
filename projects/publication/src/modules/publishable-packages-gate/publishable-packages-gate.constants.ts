// ♟️ Constants

/**
 * The projects whose change makes the publishable-packages check worth
 * running: every ic-suite package, and `validation`, which owns the check.
 */
export const GATED_PROJECTS = "projects/ic-suite/**,validation";

/** What `nx show projects` prints when none of them is affected. */
export const NONE_AFFECTED = "[]";

export const REVISIONS_UNSET_MESSAGE =
  "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first";

export const NONE_AFFECTED_MESSAGE =
  "⏭️ No ic-suite package or the check itself is affected.";

/** Reports the affected projects the check is about to run for. */
export const affectedMessage = (affected: string): string =>
  `📦 Affected: ${affected}`;
