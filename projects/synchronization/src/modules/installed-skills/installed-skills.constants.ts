// ♟️ Constants

/** The lockfile `skills` maintains, relative to the workspace root. */
export const SKILLS_LOCKFILE = "skills-lock.json";

/** Where every installed skill lives, relative to the workspace root. */
export const SKILLS_DIRECTORY = ".agents/skills";

/** The file whose presence is what makes a skill installed. */
export const SKILL_FILE = "SKILL.md";

/** The Nx target an agent or a person restores skills through. */
export const RESTORE_COMMAND = "pnpm exec nx run codebase:install-skills";

/** The session hook that reports missing skills, for re-running it. */
export const SESSION_HOOK_COMMAND =
  "bash scripts/git/validate-session-skills.sh";

/**
 * What a cloud agent can do about missing skills: it installs dependencies
 * from a setup workflow rather than a terminal.
 */
export const CLOUD_REMEDIATION = [
  `1. Restore them with "${RESTORE_COMMAND}".`,
  '2. If restoration fails, confirm ".github/workflows/copilot-setup-steps.yml" completed its dependency install, which restores skills through postinstall.',
  "3. Start a fresh cloud agent session so the restored skills register.",
  `4. Re-run "${SESSION_HOOK_COMMAND}" to confirm.`,
].join("\n");

/** What a local agent can do about missing skills, from its own terminal. */
export const LOCAL_REMEDIATION = [
  `1. Restore them with "${RESTORE_COMMAND}".`,
  "2. Ask the user to start a new session afterwards. Skills register when a session starts, so restoring them does not add them to this one.",
  `3. Re-run "${SESSION_HOOK_COMMAND}" to confirm.`,
].join("\n");

/** Why missing skills matter, printed under the list of them. */
export const MISSING_SKILLS_CONSEQUENCE =
  '🚨 The agent workflow in AGENTS.md links to these skills. Until they are restored those links dangle, and user-invoked skills such as "/grill-with-docs" are unavailable.';

/** How to try a failed restore again, attached to every warning about one. */
export const RETRY_HINT = `Retry with '${RESTORE_COMMAND}'`;

/** The `skills` subcommand that restores every locked skill from its source. */
export const RESTORE_ARGUMENTS = ["experimental_install"] as const;

/** The skills CLI as linked into the workspace, relative to its root. */
export const LOCAL_SKILLS_BINARY = "node_modules/.bin/skills";
