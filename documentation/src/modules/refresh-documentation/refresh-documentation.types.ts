// 🏷️ Types

/** What one OpenWiki run did. */
export interface OpenWikiAttempt {
  /** The furthest page position OpenWiki reported. */
  readonly pages: number;
  /** When OpenRouter said its rate limit lifts, in epoch milliseconds. */
  readonly rateLimitResetAt: number | undefined;
  /** Whether OpenWiki exited cleanly. */
  readonly succeeded: boolean;
}

/** How far a run moved the wiki: its pages, only its bookkeeping, or not at all. */
export type WikiChange = "bookkeeping" | "content" | "none";
