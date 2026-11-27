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

/** Longest wait for a rate limit; a later reset ends retries. */
export const OPENWIKI_RATE_LIMIT_PATIENCE_MS = 900_000;

/** Slack added to a reported reset so the window has closed. */
export const OPENWIKI_RATE_LIMIT_MARGIN_MS = 5000;

/** The reset time, in epoch milliseconds, a 429 response reports. */
export const RATE_LIMIT_RESET_PATTERN =
  /X-RateLimit-Reset\\?":\\?"(?<resetAt>\d+)/gu;

/** The progress line OpenWiki prints as it reaches each page. */
export const PAGE_PROGRESS_PATTERN =
  /^Documenting (?:page )?(?<position>\d+) of (?<total>\d+)/gmu;

/** The line printed for a page whose worker ended without submitting. */
export const SKIPPED_PAGE_PATTERN =
  /^(?<page>\S+) was restored after its worker exited without submitting/gmu;

/** What a refresh may change that its pull request carries. */
export const OPENWIKI_COMMITTED_PATHS = [
  OPENWIKI_STORAGE,
  "AGENTS.md",
] as const;

/** Wiki files that record when it last ran, never what it says. */
export const OPENWIKI_BOOKKEEPING_FILES: readonly string[] = [
  `${OPENWIKI_STORAGE}/.last-update.json`,
  `${OPENWIKI_STORAGE}/.page-manifest.json`,
];

/** The file GitHub Actions reads a step's job summary from. */
export const STEP_SUMMARY_VARIABLE = "GITHUB_STEP_SUMMARY";

/** The file GitHub Actions reads a step's outputs from. */
export const STEP_OUTPUT_VARIABLE = "GITHUB_OUTPUT";
