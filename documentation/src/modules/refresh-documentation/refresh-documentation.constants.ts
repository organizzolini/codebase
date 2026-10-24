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

/**
 * Where the wiki is written, relative to the workspace root. A symlink here
 * points at the directory the documentation project keeps its pages in.
 */
export const OPENWIKI_LINK = "openwiki";

/** The directory the wiki's pages are committed in. */
export const OPENWIKI_STORAGE = "documentation/openwiki";

/**
 * How many times OpenWiki is started before the refresh gives up. The free
 * model's only provider overloads for minutes at a time, and OpenWiki's own
 * retries do not cover every such failure, so a failed run is started again;
 * it picks up the progress it left in the wiki directory.
 */
export const OPENWIKI_ATTEMPTS = 4;

/** The wait before the second attempt; each later wait is one step longer. */
export const OPENWIKI_RETRY_DELAY_MS = 120_000;
