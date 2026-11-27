// 🏷️ Types

/** What one OpenWiki run did. */
export interface OpenWikiAttempt {
  /** The furthest page position OpenWiki reported. */
  readonly pages: number;
  /** When OpenRouter said its rate limit lifts, in epoch milliseconds. */
  readonly rateLimitResetAt: number | undefined;
  /** Pages whose worker ended without submitting, left for a later run. */
  readonly skipped: number;
  /** Whether OpenWiki exited cleanly. */
  readonly succeeded: boolean;
  /** How many pages the run set out to document. */
  readonly total: number;
}

/** How many of a refresh's pages were documented, across every attempt. */
export interface PageCount {
  /** Pages documented. */
  readonly refreshed: number;
  /** Pages still skipped after the last clean attempt. */
  readonly skipped: number;
  /** Pages the wiki holds. */
  readonly total: number;
}

/** How far a run moved the wiki: pages, bookkeeping only, or nothing. */
export type WikiChange = "bookkeeping" | "content" | "none";
