// ♟️ Constants

/** Stands in for an empty limit cell, so none is blank. */
export const ABSENT_LABEL = "—";

/** Column headers of the limits table, in the order they are rendered. */
export const LIMIT_TABLE_COLUMNS = [
  "Project",
  "Limit",
  "Value",
  "Declared in",
] as const;

/** Heading the listing is written under. */
export const LIMITS_HEADING = "# 🔭 Callidescope Limits";

/** Says what the table holds, so it needs no second reading. */
export const LIMITS_SUMMARY =
  "Every project in scope, what it is judged against, and the file each number is written in — which is that project's own `callidescope.config.ts`, every traced project declaring a complete one. The `workspace` row is the starting point those files spread, and the numbers the directory holding this configuration is itself judged by.";

/** Shown when nothing declares the limit, since breadth has no default. */
export const NO_LIMIT_LABEL = "none";

/** Names the workspace-root project, whose empty root would print blank. */
export const ROOT_PROJECT_LABEL = ".";

/** Names the row carrying the defaults every project's file spreads. */
export const WORKSPACE_LABEL = "workspace";
