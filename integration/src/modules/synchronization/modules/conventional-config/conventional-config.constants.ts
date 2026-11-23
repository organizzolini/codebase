// ♟️ Constants

/** Real Markdown files holding the generated `types-*` and `scopes-*` tables. */
export const SYNC_CONVENTIONAL_CONFIG_MARKDOWN_FILES = [
  ".github/CONTRIBUTING.md",
  ".agents/skills/checkout-branch/SKILL.md",
  ".agents/skills/commit-code/SKILL.md",
  ".agents/skills/create-pull-request/SKILL.md",
  ".agents/skills/rename-branch/SKILL.md",
  ".agents/skills/triage-integration/SKILL.md",
];

/** Issue template files that contain type and scope dropdowns. */
export const SYNC_CONVENTIONAL_CONFIG_ISSUE_TEMPLATE_FILES = [
  ".github/ISSUE_TEMPLATE/issue.yml",
];

/** Commit types excluded from release rules presence validation. */
export const RELEASE_RULES_SPECIAL_TYPES = new Set(["revert"]);
