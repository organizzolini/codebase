// ♟️ Constants

/** What `--check breadth` fails on: too many direct callees. */
export const CHECK_BREADTH = "breadth";

/** What `--check depth` fails on: a stack too deep. */
export const CHECK_DEPTH = "depth";

/** What `--check reports` fails on: a stale report. */
export const CHECK_REPORTS = "reports";

/** Everything `--check` accepts, in error order; one list cannot drift. */
export const CHECK_NAMES = [CHECK_BREADTH, CHECK_DEPTH, CHECK_REPORTS];

/** How a `--check` value is written: one comma-separated set, no spaces needed. */
export const CHECK_SEPARATOR = ",";

/** Report-destination flags, so the mode refusal can name each. */
export const DESTINATION_FLAG_NAMES = ["json", "markdown", "mermaid"] as const;
