// ♟️ Constants

/** The `gh` binary a live read runs through, named so a test can shadow it on PATH. */
export const GITHUB_CLI_BINARY = "gh";

/** The variable GitHub Actions sets to the file a step's summary is read from. */
export const STEP_SUMMARY_VARIABLE = "GITHUB_STEP_SUMMARY";

/** Said when the mirror fails, so a silent summary is never a silent bug. */
export const STEP_SUMMARY_FAILURE_MESSAGE =
  "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY";

/** The two labels that may declare who opened an issue, and nothing else. */
export const SOURCE_LABELS = ["source:agent", "source:human"];

/** How the three label families are recognized. */
export const SCOPE_LABEL_PREFIX = "scope:";
export const SOURCE_LABEL_PREFIX = "source:";
export const TYPE_LABEL_PREFIX = "type:";

/**
 * Exact labels of the `issue.yml` Type and Scope dropdowns. GitHub renders
 * them as `### <label>`, so these must match that file exactly.
 */
export const TYPE_FIELD_LABEL = "Type";
export const SCOPE_FIELD_LABEL = "Scope";

/** An issue number, as an argument may spell one. */
export const ISSUE_NUMBER_PATTERN = /^\d+$/u;

/** Flag to sweep all open issues. */
export const ALL_ISSUES_FLAG = "--all";
export const ALL_ISSUES_SHORT_FLAG = "-a";

/** Pattern to identify parent issue references in issue bodies. */
export const PARENT_ISSUE_PATTERN =
  /(?:Part of\s+|Parent(?: issue)?:\s*|### Parent\s+)#(?<parentNumber>\d+)/iu;

/** Pattern to parse conventional commit-styled issue titles. */
export const CONVENTIONAL_ISSUE_TITLE_PATTERN =
  /^([a-z][a-z-]*)(?:\(([^()]+)\))?(?<breaking>!)?:\s+(?<subject>\S.*)$/u;

/** Maximum allowed nesting depth in the issue hierarchy (Spec -\> PR -\> Commit). */
export const MAX_HIERARCHY_DEPTH = 3;

/** Issue Types a root issue (one with no parent) may carry: a spec or standalone report. */
export const ROOT_ISSUE_TYPES = ["Bug", "Feature"];

/** The GitHub Issue Type every sub-issue carries, at any depth. */
export const SUB_ISSUE_TYPE = "Task";

/** Relative rank of release levels. */
export const RELEASE_LEVEL_RANK: Record<string, number> = {
  major: 3,
  minor: 2,
  none: 0,
  patch: 1,
};

/** Release levels associated with conventional commit types. */
export const TYPE_RELEASE_LEVEL: Record<string, string> = {
  build: "patch",
  chore: "none",
  ci: "none",
  ["docs"]: "none",
  feat: "minor",
  fix: "patch",
  perf: "patch",
  refactor: "patch",
  revert: "patch",
  style: "none",
  test: "none",
};
