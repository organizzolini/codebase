import { z } from "zod";

// ♟️ Constants

/**
 * The configuration `validate-branch-name` reads, relative to the workspace
 * root. Read here too rather than restated, so the session check and the
 * pre-push hook can never disagree about what a valid branch is.
 */
export const BRANCH_NAME_CONFIG_PATH = "validate-branch-name.config.cjs";

/**
 * The field holding the error text. `validate-branch-name` names it, not this
 * repository, so the abbreviation is kept rather than renamed.
 */
export const ERROR_MESSAGE_FIELD = "errorMsg";

/** The two fields of that configuration this check needs. */
export const branchNameConfigSchema = z.object({
  [ERROR_MESSAGE_FIELD]: z.string(),
  pattern: z.string(),
});

/** Asks `git` for the checked-out branch; empty on a detached HEAD. */
export const CURRENT_BRANCH_ARGUMENTS = ["branch", "--show-current"];

/** Said after the configured error, so the agent fixes it before anything else. */
export const RENAME_BRANCH_DIRECTIVE =
  "🚨 Invoke the rename-branch skill to rename this branch before doing anything else.";
