// ♟️ Constants

/** The package manager that resolves the OpenWiki binary the workspace pins. */
export const OPENWIKI_EXECUTABLE = "pnpm";

/** Regenerates the wiki from code and prints what changed. */
export const OPENWIKI_ARGUMENTS = [
  "exec",
  "openwiki",
  "code",
  "--update",
  "--print",
] as const;

/** The agent instruction file OpenWiki leaves behind, which is never committed. */
export const OPENWIKI_LEFTOVER_FILE = "CLAUDE.md";

/** Wiki output path, a symlink to the documentation project's pages. */
export const OPENWIKI_LINK = "openwiki";

/** The directory the wiki's pages are committed in. */
export const OPENWIKI_STORAGE = "documentation/openwiki";

/** Maximum OpenWiki runs; a failed run resumes from the wiki. */
export const OPENWIKI_ATTEMPTS = 4;

/** Wait before attempt two; later waits each grow one step. */
export const OPENWIKI_RETRY_DELAY_MS = 120_000;
