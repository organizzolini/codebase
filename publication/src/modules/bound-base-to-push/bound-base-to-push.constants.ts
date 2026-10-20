// ♟️ Constants

/** A previous tip that names no commit: absent, or all zeros on a new branch. */
export const NO_PREVIOUS_TIP = /^0*$/v;

export const REVISIONS_UNSET_MESSAGE =
  "❌ NX_BASE and NX_HEAD are unset; run nx-set-shas first";

export const GITHUB_ENV_UNSET_MESSAGE =
  "❌ GITHUB_ENV is unset; cannot move NX_BASE";

/** Reports a push with no previous tip to bound the base to. */
export const noPreviousTipMessage = (base: string): string =>
  `🎯 No previous tip for this push; keeping NX_BASE=${base}`;

/** Reports a previous tip the head does not descend from. */
export const notAncestorMessage = (
  before: string,
  head: string,
  base: string,
): string =>
  `🎯 ${before} is not an ancestor of ${head}; keeping NX_BASE=${base}`;

/** Reports the base moving to the push's previous tip. */
export const boundingMessage = (base: string, before: string): string =>
  `🎯 Bounding NX_BASE to the push: ${base} → ${before}`;
