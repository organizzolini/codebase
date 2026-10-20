// ♟️ Constants

/** Lowercase kebab-case, which may also hold dots. */
export const WORKTREE_DIRECTORY_NAME_PATTERN = /^[a-z0-9][a-z0-9.-]*$/u;

/** Asks `git` for the superproject; empty unless this is a submodule. */
export const SUPERPROJECT_ARGUMENTS = [
  "rev-parse",
  "--show-superproject-working-tree",
];

/** Asks `git` for this checkout's own git directory. */
export const GIT_DIRECTORY_ARGUMENTS = ["rev-parse", "--git-dir"];

/** Asks `git` for the git directory every worktree of the repository shares. */
export const GIT_COMMON_DIRECTORY_ARGUMENTS = ["rev-parse", "--git-common-dir"];

/** Said for a worktree whose directory name breaks the convention. */
export const describeInvalidName = (name: string): string =>
  [
    `❌ Invalid worktree directory name: "${name}"`,
    "   Worktree directory names must be lowercase kebab-case (letters, numbers, hyphens). Avoid spaces, uppercase characters, and special symbols.",
  ].join("\n");

/** Said for a worktree inside the main checkout that git does not ignore. */
export const describeUnignoredWorktree = (root: string): string =>
  [
    `❌ Worktree directory is not gitignored: "${root}"`,
    "   Project-local worktrees inside the repository root must be ignored by .gitignore to prevent committing worktree contents.",
  ].join("\n");

/** Said after every problem, so the agent fixes the workspace first. */
export const USING_GIT_WORKTREES_DIRECTIVE =
  "🚨 Invoke the using-git-worktrees skill to configure a compliant isolated workspace.";
