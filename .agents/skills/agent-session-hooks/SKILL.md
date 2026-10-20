---
name: agent-session-hooks
description: Explains how startup scripts run at the start of agent sessions and inject context. Use when an agent session reports a failing hook (e.g. validate-session-branch-name.sh, validate-session-worktree-name.sh, validate-session-commit-signing.sh, validate-session-gh-authentication.sh, validate-session-skills.sh), or when adding a new startup check.
---
# Agent Session Hooks

Startup checks run at the start of every agent session and inject their failure as additional context. **Fix what they report before writing any code** — each one names the problem and the command that repairs it.

## When to Use This Skill

- When an agent session fails at startup due to a hook.
- When you need to understand how the session gets context about branches, worktrees, git signing, GitHub authentication, or missing skills.
- When you need to add a new check that should run for every agent session.

## Architecture

| Script                                  | Checks                                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `validate-session-branch-name.sh`       | Shim over `validation`'s `session-branch-name`: branch follows `<type>/<scope>-<description>`                     |
| `validate-session-worktree-name.sh`     | Shim over `validation`'s `session-worktree-name`: worktree is kebab-case and gitignored                           |
| `validate-session-commit-signing.sh`    | `commit.gpgsign`, `user.signingkey`, and a GPG signing smoke test                                                 |
| `validate-session-gh-authentication.sh` | The active `gh` account plus Projects access                                                                      |
| `validate-session-skills.sh`            | Shim over `synchronization`'s `installed-skills check`: every skill in `skills-lock.json` is present              |
| `validate-session-hooks-path.sh`        | `core.hooksPath` resolves to a directory holding a pre-commit hook; git runs no hooks, silently, when it does not |

Each script is registered twice, once per harness, and both registrations point at the same file:

| Harness        | Registration                                      |
| -------------- | ------------------------------------------------- |
| Claude Code    | `SessionStart` entries in `.claude/settings.json` |
| GitHub Copilot | `sessionStart` entries in `.github/hooks/*.json`  |

## Adding a New Check

When adding a check: put the script under `scripts/git/`, emit through `scripts/git/emit-session-hook-context.sh` so both harnesses can read it, and register it in both places.

A check that needs real logic belongs in a NestJS command that only prints the context and sets an exit code, with the hook reduced to a shim over it. `validate-session-skills.sh`, `validate-session-branch-name.sh`, and `validate-session-worktree-name.sh` are the pattern: from the repository root, run the command with standard error discarded, exit when it succeeds, and otherwise pipe whatever it printed into the emitter, naming how a person reruns the check:

```bash
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(<command> 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "<rerun command>"
```

An empty context is how the emitter learns the command could not run at all. With no finished install (`node_modules/.modules.yaml` absent) it directs the agent to run `pnpm install`; otherwise it directs the agent to the rerun command, whose error the shim discarded. Without `node` it stays silent, since nothing can be emitted.

The command must therefore print nothing to standard output except the context, which is why the `synchronization` and `validation` command-line applications send their logs to standard error; a project hosting a new hook command must do the same. Which project a command belongs in follows each project's own rule: a `check` with a `write` belongs in `synchronization`, a one-sided check in `validation`.

The signing and authentication hooks stay pure shell on purpose, since they must still work when `node_modules` is broken; see `validation/AGENTS.md`.

Why the credential checks resolve the session's own token and signing configuration rather than the hook shell's, and why a hook can fail but never hang, is in [ADR 0010](../../documentation/adr/0010-judge-the-credentials-a-session-really-uses.md).
