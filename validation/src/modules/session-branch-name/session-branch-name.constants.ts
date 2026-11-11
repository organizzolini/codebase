import { z } from "zod";

// ♟️ Constants

/** The configuration `validate-branch-name` reads, so the checks cannot disagree. */
export const BRANCH_NAME_CONFIG_PATH = "validate-branch-name.config.cjs";

/** The error text field; `validate-branch-name` names it, so keep the name. */
export const ERROR_MESSAGE_FIELD = "errorMsg";

/** The two fields of that configuration this check needs. */
export const branchNameConfigSchema = z.object({
  [ERROR_MESSAGE_FIELD]: z.string(),
  pattern: z.string(),
});

/** Asks `git` for the checked-out branch; empty on a detached HEAD. */
export const CURRENT_BRANCH_ARGUMENTS = ["branch", "--show-current"];

/** Said after the configured error, so the agent fixes it first. */
export const RENAME_BRANCH_DIRECTIVE =
  "🚨 Invoke the rename-branch skill to rename this branch before doing anything else.";
