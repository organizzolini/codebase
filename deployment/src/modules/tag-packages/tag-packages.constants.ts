// ♟️ Constants

/** The most refs GitHub accepts in one push to this repository. */
export const REFS_PER_PUSH = 6;

/** How many times a rejected batch of tags is pushed in all. */
export const PUSH_ATTEMPTS = 4;

/** Seconds between push attempts, unless `PUSH_RETRY_DELAY` says otherwise. */
export const DEFAULT_PUSH_RETRY_DELAY = 20;

/**
 * Every file `version-packages` may have written. Globs rather than git path
 * patterns, which fail the whole `git add` when one matches nothing, as the
 * changelog one does until a package's first changelog entry.
 */
export const VERSIONED_FILE_PATTERNS = [
  "projects/ic-suite/*/*/CHANGELOG.md",
  "projects/ic-suite/*/*/package.json",
  "pnpm-lock.yaml",
];

/** The version a new package is written with before its first release. */
export const UNRELEASED_VERSION = "0.0.0";

export const LEFTOVER_COMMIT_MESSAGE = "chore(release): 🔖 tag packages";

export const LEFTOVER_VERSIONS_MESSAGE =
  "🏷️ No codebase release committed the package versions; committing them";

/** Reports how many tags are about to be pushed. */
export const pushingMessage = (count: number): string =>
  `🏷️ Pushing ${String(count)} package tags, ${String(REFS_PER_PUSH)} at a time`;

/** Reports a rejected push that is about to be tried again. */
export const retryingMessage = (delay: number): string =>
  `🔁 Push rejected; trying again in ${String(delay)}s`;

/** Reports a package whose baseline cannot be placed. */
export const noBaselineMessage = (project: string): string =>
  `❌ Cannot find the commit before ${project} was added`;
