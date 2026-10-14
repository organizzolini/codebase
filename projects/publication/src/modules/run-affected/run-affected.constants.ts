// ♟️ Constants

/**
 * Which changed files count as spelling files: the shared dictionaries and
 * every `cspell.config.yaml`.
 *
 * `spell-check` lists them among its `{workspaceRoot}` inputs, and Nx decides
 * affected per project, not per target, so one new word in a dictionary marks
 * every project affected for every target. Only the target that runs
 * `spell-check` should see those files.
 */
export const DEFAULT_SPELLING_PATHS = String.raw`^configuration/\.cspell/|(^|/)cspell\.config\.yaml$`;

/** The value of `INCLUDE_SPELLING` that keeps spelling files in the change set. */
export const INCLUDE_SPELLING_VALUE = "true";

export const TARGET_UNSET_MESSAGE =
  "❌ TARGET is unset; name the Nx target to run";

export const REVISIONS_UNSET_MESSAGE =
  "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first";

/** Heads the list of spelling files dropped from the change set. */
export const spellingFilesHeading = (target: string): string =>
  `✂️ Not affecting ${target} with spelling files:`;
