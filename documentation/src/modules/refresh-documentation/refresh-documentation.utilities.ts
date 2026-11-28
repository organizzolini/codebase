import {
  OPENWIKI_BOOKKEEPING_FILES,
  OPENWIKI_RATE_LIMIT_MARGIN_MS,
  OPENWIKI_RATE_LIMIT_PATIENCE_MS,
  OPENWIKI_RETRY_DELAY_MS,
  PAGE_PROGRESS_PATTERN,
  RATE_LIMIT_RESET_PATTERN,
  SKIPPED_PAGE_PATTERN,
} from "./refresh-documentation.constants";

import type {
  OpenWikiAttempt,
  PageCount,
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

/**
 * How many pages the attempts documented. The first attempt names every page,
 * and a retry resumes only what the last clean attempt skipped.
 */
export function countPages(attempts: readonly OpenWikiAttempt[]): PageCount {
  const total = Math.max(0, ...attempts.map((attempt) => attempt.total));
  const lastClean = attempts.findLast(({ succeeded }) => succeeded);
  const skipped =
    lastClean === undefined ? total : Math.min(lastClean.skipped, total);

  return { refreshed: total - skipped, skipped, total };
}

/** Whether an attempt ended cleanly with every page documented. */
export function isComplete({ skipped, succeeded }: OpenWikiAttempt): boolean {
  return succeeded && skipped === 0;
}

/** Whether the refresh moved the wiki: a clean run that did not skip every page. */
export function madeProgress(attempts: readonly OpenWikiAttempt[]): boolean {
  const { refreshed, total } = countPages(attempts);

  return (
    attempts.some(({ succeeded }) => succeeded) &&
    (total === 0 || refreshed > 0)
  );
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
    (attempt, index) =>
      `| ${String(index + 1)} | ${attemptResult(attempt)} | ${String(attempt.pages)} | ${String(attempt.skipped)} | ${attempt.rateLimitResetAt === undefined ? "—" : new Date(attempt.rateLimitResetAt).toISOString()} |`,
  );
  const { refreshed, skipped, total } = countPages(attempts);
  const changes = {
    bookkeeping:
      "Only the wiki's bookkeeping files changed, so no pull request opens.",
    content: "The wiki's pages changed.",
    none: "Nothing changed.",
  };

  return [
    "## 🧑‍🏫 Refresh Documentation",
    "",
    "| Attempt | Result | Pages | Skipped | Rate limit lifts |",
    "| ------- | ------ | ----- | ------- | ---------------- |",
    ...rows,
    "",
    change === undefined ? "No attempt succeeded." : changes[change],
    ...(total === 0
      ? []
      : [
          "",
          `Refreshed ${String(refreshed)} of ${String(total)} pages.${skipped === 0 ? "" : ` ${String(skipped)} skipped, to be reconsidered on the next run.`}`,
        ]),
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

/** Reads what a run printed: pages reached and skipped, and any reported reset. */
export function scanOutput(
  output: string,
): Pick<OpenWikiAttempt, "pages" | "rateLimitResetAt" | "skipped" | "total"> {
  let pages = 0;
  let total = 0;
  let rateLimitResetAt: number | undefined;

  for (const match of output.matchAll(PAGE_PROGRESS_PATTERN)) {
    pages = Math.max(pages, Number(match.groups?.["position"]));
    total = Math.max(total, Number(match.groups?.["total"]));
  }

  const skipped = new Set(
    [...output.matchAll(SKIPPED_PAGE_PATTERN)].map(
      (match) => match.groups?.["page"],
    ),
  ).size;

  for (const match of output.matchAll(RATE_LIMIT_RESET_PATTERN)) {
    rateLimitResetAt = Math.max(
      rateLimitResetAt ?? 0,
      Number(match.groups?.["resetAt"]),
    );
  }

  return { pages, rateLimitResetAt, skipped, total };
}

/** How one attempt ended, as the job summary words it. */
function attemptResult(attempt: OpenWikiAttempt): string {
  if (!attempt.succeeded) {
    return "❌ Failed";
  }

  return attempt.skipped === 0 ? "✅ Succeeded" : "⚠️ Partial";
}
