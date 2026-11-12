// ♟️ Constants

/** The `gh` binary live reads run, so tests can shadow it. */
export const GITHUB_CLI_BINARY = "gh";

/** The variable GitHub Actions sets to the step summary file. */
export const STEP_SUMMARY_VARIABLE = "GITHUB_STEP_SUMMARY";

/** Said when the mirror fails, so no failure stays silent. */
export const STEP_SUMMARY_FAILURE_MESSAGE =
  "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY";

/** The two labels that may name who opened an issue. */
export const SOURCE_LABELS = ["source:agent", "source:human"];

/** How the three label families are recognized. */
export const SCOPE_LABEL_PREFIX = "scope:";
export const SOURCE_LABEL_PREFIX = "source:";
export const TYPE_LABEL_PREFIX = "type:";

/** Exact `issue.yml` dropdown labels, which GitHub renders as headings. */
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

/** Maximum nesting depth of the issue hierarchy, Spec to Commit. */
export const MAX_HIERARCHY_DEPTH = 3;

/** Issue Types a root issue may carry: spec or report. */
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
