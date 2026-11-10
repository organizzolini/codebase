// ♟️ Constants

/** The package manager whose answer this check is. */
export const PACKAGE_MANAGER_BINARY = "pnpm";

/**
 * The install that answers the question. `--frozen-lockfile` refuses rather
 * than rewriting; `--lockfile-only` leaves `node_modules` untouched for the
 * parallel hooks.
 */
export const FROZEN_INSTALL_ARGUMENTS = [
  "install",
  "--frozen-lockfile",
  "--lockfile-only",
];

/** Said when the lockfile and the manifests agree. */
export const LOCKFILE_IN_SYNC_MESSAGE = "🔒 pnpm-lock.yaml is in sync";

/** Said, in order, when they do not. */
export const LOCKFILE_OUT_OF_SYNC_MESSAGES = [
  "❌ pnpm-lock.yaml is out of sync with package.json files",
  "💡 Run 'pnpm install' to update the lockfile and try committing again",
  "",
  "pnpm output:",
];

/**
 * Said when there is no pnpm to ask; the check then passes, since refusing
 * would block commits without checking.
 */
export const PACKAGE_MANAGER_MISSING_MESSAGE =
  "⚠️  pnpm not found in PATH; skipping lockfile check";
