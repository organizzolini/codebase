// ♟️ Constants

/**
 * What `--check breadth` asks the run to fail on: a callable calling too many
 * other callables directly.
 */
export const CHECK_BREADTH = "breadth";

/** What `--check depth` asks the run to fail on: a call stack that is too deep. */
export const CHECK_DEPTH = "depth";

/** What `--check reports` asks the run to fail on: a stale written report. */
export const CHECK_REPORTS = "reports";

/** Everything `--check` accepts, in error-message order; named once so the accepted and reported lists cannot drift. */
export const CHECK_NAMES = [CHECK_BREADTH, CHECK_DEPTH, CHECK_REPORTS];

/** How a `--check` value is written: one comma-separated set, no spaces needed. */
export const CHECK_SEPARATOR = ",";

/** Flags naming where a report goes. Listing each here lets the mode refusal name every destination supplied. */
export const DESTINATION_FLAG_NAMES = ["json", "markdown", "mermaid"] as const;
