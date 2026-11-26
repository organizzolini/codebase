---
name: agent-session-hooks
description: "Explains the checks that run at the start of every agent session and before each subagent, and how each reports a failure as context. Use when a session hook reports a failure, or when adding a new startup check."
---

# Agent Session Hooks

Startup checks run at the start of every agent session and inject their failure as additional context. **Fix what they report before writing any code** — each one names the problem and the command that repairs it.

## When to Use This Skill

- When an agent session fails at startup due to a hook.
- When you need to understand how the session gets context about branches, worktrees, git signing, GitHub authentication, or missing skills.
- When you need to add a new check that should run for every agent session.

## Standing Permission

Agents repair two startup failures on their own, without asking the human:

- **Commit signing** (`validate-session-commit-signing.sh`, or a commit hook naming `gpg.ssh.allowedSignersFile`): run `bash scripts/installation.sh`, which is idempotent, then retry the commit.
- **Branch name** (`validate-session-branch-name.sh`, or a rejected `pre-push`): rename the branch with the [checkout-branch skill](../checkout-branch/SKILL.md#rename-a-branch) and push the new name, even when the session or platform assigned the old one.

Branch names, commit messages, and pull request titles and descriptions must always be compliant, so neither repair needs approval. Tell the human what was renamed afterwards.

## Architecture

| Script                                  | Checks                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `validate-session-branch-name.sh`       | Shim over `installation`'s `session-branch-name`: branch follows `<type>/<scope>-<description>`                                 |
| `validate-session-worktree-name.sh`     | Shim over `installation`'s `session-worktree-name`: worktree is kebab-case and gitignored                                       |
| `validate-session-commit-signing.sh`    | `commit.gpgsign`, `user.signingkey`, and a GPG signing smoke test                                                               |
| `validate-session-gh-authentication.sh` | The active `gh` account plus Projects access                                                                                    |
| `validate-session-skills.sh`            | Shim over `installation`'s `installed-skills check`: every skill in `skills-lock.json` is present                               |
| `validate-session-hooks-path.sh`        | `core.hooksPath` resolves to a directory holding a pre-commit hook; git runs no hooks, silently, when it does not               |
| `validate-subagent-model.sh`            | `PreToolUse` check on `Agent`/`task`: blocks Opus/Sol or higher on subagents and requires an explicit model on `Explore`/`Plan` |

Each script is registered twice, once per harness, and both registrations point at the same file:

| Harness        | Registration                                                       |
| -------------- | ------------------------------------------------------------------ |
| Claude Code    | `SessionStart` and `PreToolUse` entries in `.claude/settings.json` |
| GitHub Copilot | `sessionStart` and `preToolUse` entries in `.github/hooks/*.json`  |

## Adding a New Check

When adding a check: put the script under `scripts/git/`, emit through `scripts/git/emit-session-hook-context.sh` so both harnesses can read it, and register it in both places.

A check that needs real logic belongs in a NestJS command that only prints the context and sets an exit code, with the hook reduced to a shim over it. `validate-session-skills.sh`, `validate-session-branch-name.sh`, and `validate-session-worktree-name.sh` are the pattern: from the repository root, run the command with standard error discarded, exit when it succeeds, and otherwise pipe whatever it printed into the emitter, naming how a person reruns the check:

```bash
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0
CONTEXT="$(<command> 2>/dev/null)" && exit 0
printf '%s' "${CONTEXT}" | bash scripts/git/emit-session-hook-context.sh "<rerun command>"
```

An empty context is how the emitter learns the command could not run at all. With no finished install (`node_modules/.modules.yaml` absent) it directs the agent to run `pnpm install`; otherwise it directs the agent to the rerun command, whose error the shim discarded. Without `node` it stays silent, since nothing can be emitted.

The command must therefore print nothing to standard output except the context, which is why the `installation` command-line application sends its logs to standard error; a new hook command must do the same. Every such check is an `installation` command (`session-branch-name`, `session-worktree-name`, `installed-skills`), beside the setup it verifies.

The signing and authentication hooks stay pure shell on purpose, since they must still work when `node_modules` is broken; see `installation/AGENTS.md`.

The credential checks resolve the session's own token and signing configuration rather than the hook shell's, and a hook can fail but never hang.
