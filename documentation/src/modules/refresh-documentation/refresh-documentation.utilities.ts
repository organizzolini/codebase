import {
  OPENWIKI_BOOKKEEPING_FILES,
  OPENWIKI_RATE_LIMIT_MARGIN_MS,
  OPENWIKI_RATE_LIMIT_PATIENCE_MS,
  OPENWIKI_RETRY_DELAY_MS,
  PAGE_PROGRESS_PATTERN,
  RATE_LIMIT_RESET_PATTERN,
} from "./refresh-documentation.constants";

import type {
  OpenWikiAttempt,
  WikiChange,
} from "./refresh-documentation.types";

/** Whether changes touch the wiki's pages, only its bookkeeping files, or nothing. */
export function classifyChanges(paths: readonly string[]): WikiChange {
  if (paths.length === 0) {
    return "none";
  }

  return paths.every((path) => OPENWIKI_BOOKKEEPING_FILES.includes(path))
    ? "bookkeeping"
    : "content";
}

/** The paths a `git status --porcelain` listing names, renames by their new name. */
export function parseChangedPaths(status: string): string[] {
  return status
    .split("\n")
    .filter((line) => line.length > 3)
    .map((line) => line.slice(3).replace(/^.* -> /u, ""));
}

/** The job summary: one row per attempt, then what the run changed. */
export function renderSummary(
  attempts: readonly OpenWikiAttempt[],
  change: undefined | WikiChange,
): string {
  const rows = attempts.map(
    ({ pages, rateLimitResetAt, succeeded }, index) =>
      `| ${String(index + 1)} | ${succeeded ? "✅ Succeeded" : "❌ Failed"} | ${String(pages)} | ${rateLimitResetAt === undefined ? "—" : new Date(rateLimitResetAt).toISOString()} |`,
  );
  const changes = {
    bookkeeping:
      "Only the wiki's bookkeeping files changed, so no pull request opens.",
    content: "The wiki's pages changed.",
    none: "Nothing changed.",
  };

  return [
    "## 🧑‍🏫 Refresh Documentation",
    "",
    "| Attempt | Result | Pages | Rate limit lifts |",
    "| ------- | ------ | ----- | ---------------- |",
    ...rows,
    "",
    change === undefined ? "No attempt succeeded." : changes[change],
    "",
  ].join("\n");
}

/**
 * Milliseconds to wait after a failed attempt, never less than the growing wait.
 * A reset later than the patience limit gives `undefined`: stop retrying.
 */
export function retryDelay(
  attempt: number,
  resetAt: number | undefined,
  now: number,
): number | undefined {
  const growing = attempt * OPENWIKI_RETRY_DELAY_MS;

  if (resetAt === undefined) {
    return growing;
  }

  const untilReset = resetAt - now;

  if (untilReset > OPENWIKI_RATE_LIMIT_PATIENCE_MS) {
    return undefined;
  }

  return Math.max(growing, untilReset + OPENWIKI_RATE_LIMIT_MARGIN_MS);
}

/** Reads what a run printed: the furthest page it reached and any reported reset. */
export function scanOutput(
  output: string,
): Pick<OpenWikiAttempt, "pages" | "rateLimitResetAt"> {
  let pages = 0;
  let rateLimitResetAt: number | undefined;

  for (const match of output.matchAll(PAGE_PROGRESS_PATTERN)) {
    pages = Math.max(pages, Number(match.groups?.["position"]));
  }

  for (const match of output.matchAll(RATE_LIMIT_RESET_PATTERN)) {
    rateLimitResetAt = Math.max(
      rateLimitResetAt ?? 0,
      Number(match.groups?.["resetAt"]),
    );
  }

  return { pages, rateLimitResetAt };
}
