// ♟️ Constants

/**
 * Which changed files count as conformetry templates.
 *
 * `.nxignore` hides some templates from Nx, so a template edit alone selects
 * none of the instance projects generated from it.
 */
export const TEMPLATE_PATTERN = /^configuration\/conformetry-templates\//u;

/**
 * The file added to the change set when a template changed: the conformetry
 * config is an input of every instance project, and the template hash input
 * then busts their caches.
 */
export const TEMPLATE_SELECTOR = "configuration/conformetry.config.ts";

/** The value of `INCLUDE_TEMPLATES` that selects every instance on a template change. */
export const INCLUDE_TEMPLATES_VALUE = "true";

export const TARGET_UNSET_MESSAGE =
  "❌ TARGET is unset; name the Nx target to run";

export const REVISIONS_UNSET_MESSAGE =
  "❌ NX_BASE and NX_HEAD are unset; run setup-codebase first";

/** Heads the list of changed templates that select every conformetry instance. */
export const templateFilesHeading = (target: string): string =>
  `🧬 Selecting every conformetry instance for ${target}, templates changed:`;
