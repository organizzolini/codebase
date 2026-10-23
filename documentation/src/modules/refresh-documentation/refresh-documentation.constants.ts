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
