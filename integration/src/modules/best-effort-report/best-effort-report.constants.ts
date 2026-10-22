// ♟️ Constants

/** The heading of the section the pull request gets, when a step was skipped. */
export const SECTION_HEADING = "## ⚠️ Skipped Upgrades";

/** Says why the pull request is missing something, so no one hunts for it. */
export const SECTION_INTRODUCTION =
  "These steps failed and were skipped, so what they upgrade is missing from this pull request. Each restored its files and the run carried on without it.";

/** The bullet a skipped step adds to the pull request's details. */
export const detailBullet = (label: string, exitCode: number): string =>
  `- ⚠️ Skipped **${label}** (exit ${String(exitCode)}); its files were left as they were. See Skipped Upgrades below.`;
