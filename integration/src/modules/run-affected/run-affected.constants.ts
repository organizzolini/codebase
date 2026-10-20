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

/**
 * Which changed files count as conformetry templates.
 *
 * `.nxignore` hides some templates from Nx, so a template edit alone selects
 * none of the instance projects generated from it.
 */
export const DEFAULT_TEMPLATE_PATHS = String.raw`^configuration/conformetry-templates/`;

/**
 * The file added to the change set when a template changed: the conformetry
 * config is an input of every instance project, and the template hash input
 * then busts their caches.
 */
export const TEMPLATE_SELECTOR = "configuration/conformetry.config.ts";

/** The value of `INCLUDE_SPELLING` that keeps spelling files in the change set. */
export const INCLUDE_SPELLING_VALUE = "true";

/** The value of `INCLUDE_TEMPLATES` that selects every instance on a template change. */
export const INCLUDE_TEMPLATES_VALUE = "true";

export const TARGET_UNSET_MESSAGE =
  "❌ TARGET is unset; name the Nx target to run";

export const REVISIONS_UNSET_MESSAGE =
  "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first";

/** Heads the list of spelling files dropped from the change set. */
export const spellingFilesHeading = (target: string): string =>
  `✂️ Not affecting ${target} with spelling files:`;

/** Heads the list of changed templates that select every conformetry instance. */
export const templateFilesHeading = (target: string): string =>
  `🧬 Selecting every conformetry instance for ${target}, templates changed:`;
