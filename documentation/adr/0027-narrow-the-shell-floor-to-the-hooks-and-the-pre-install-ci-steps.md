# 0027: Narrow the Shell Floor to the Hooks and the Pre-Install CI Steps

Supersedes [ADR 0026](0026-keep-a-small-shell-floor-under-the-scripts.md). Its rule stands: a script stays shell when it must work while `node_modules` is missing or broken. Its table does not.

## Context

[ADR 0026](0026-keep-a-small-shell-floor-under-the-scripts.md) listed the scripts that stay shell and said that removing an entry needs a new ADR. Several entries no longer hold. Some scripts have no reason to be in `scripts/`, some bootstrap steps are the same step spread over three files, and the CI steps that run before `pnpm install` were left outside the table with a conditional note.

## Decision

**The rule is unchanged.** A script stays shell when it must work while `node_modules` is missing or broken, or when it only wraps an interactive terminal. This is the target floor, once the three pull requests that implement it have landed: the bootstrap consolidation, the removal of the `scripts/shell/` helpers, and this one.

| Script | Why it stays shell |
| ------ | ------------------ |
| `scripts/git/check-commit-signing-configuration.sh`, `scripts/git/check-push-commit-signatures.sh` | They run from the pre-commit and pre-push hooks. |
| `scripts/git/check-gh-authentication.sh`, `scripts/git/validate-session-commit-signing.sh`, `scripts/git/validate-session-gh-authentication.sh` | They use only `git`, `gpg`, and `gh`, and run from a terminal or a session start. |
| `scripts/git/validate-session-hooks-path.sh` | It reports a `core.hooksPath` that holds no pre-commit hook, which must work when the install is broken. |
| `scripts/git/emit-session-hook-context.sh` | It is the one place the Claude and Copilot hook output formats are defined. |
| `scripts/git/validate-session-skills.sh`, `scripts/git/validate-session-branch-name.sh`, `scripts/git/validate-session-worktree-name.sh` | They are shims that pipe a command's output through the emitter, and emit a "run pnpm install" context when the command cannot boot. |
| `scripts/installation.sh`, sourcing `scripts/utilities.sh` | It is the machine bootstrap. It checks Homebrew, installs nvm, Node, pnpm, and nx inline, then runs `pnpm install` and the `installation` command. It replaces `scripts/local/setup.sh`, `scripts/local/software/brew.sh`, and `scripts/local/software/node.sh`. |
| `scripts/nx/bound-base-to-push.sh`, `scripts/nx/verify-task-database.sh`, `scripts/nx/adopt-task-database.sh`, `scripts/nx/task-database.sh`, `scripts/nx/import-pr-task-cache.sh`, `scripts/nx/merge-task-cache.sh` | They run in `.github/actions/setup-codebase` before `pnpm install`, when no command can boot. |

The Nx steps may move to run after the install once a merge-group measurement shows cache hits are unchanged. That is a separate decision and gets its own ADR if taken.

**Removed from the floor:**

| Script | Where it went |
| ------ | ------------- |
| `scripts/sign-commits.sh` | It moved into its skill, `.agents/skills/sign-commits/scripts/sign-commits.sh`, and finds the repository root with `git rev-parse --show-toplevel`. It is not a repository script any more, so it is not a floor entry. |
| `scripts/git/delete-stale-local-branches.sh` | Deleted. |
| `scripts/shell/*` helpers, except `text-to-port.sh`, and the `processes.sh`, `killport.sh`, `grep.sh`, `sed.sh`, and `netstat.sh` cheat-sheets | Deleted by a separate pull request. |

**Not decided here.** These scripts have not been ported and appear in neither list: `scripts/nx/await-health.sh`, `scripts/nx/stop-port.sh`, `scripts/shell/text-to-port.sh`, and `scripts/update-reui-skill.sh`, which is planned to move into the `installation` project.

## Consequences

- A new script under `scripts/` still needs a reason from this table. Without one, it is a command.
- Removing an entry from the floor needs a new ADR that supersedes this one.
- The shellcheck gate covers `.agents/skills/sign-commits/scripts/*.sh` by name. The other installed skills stay out of it, since they are owned upstream.
- The `validation` project's guidance and `scripts/README.md` link here instead of to ADR 0026.
