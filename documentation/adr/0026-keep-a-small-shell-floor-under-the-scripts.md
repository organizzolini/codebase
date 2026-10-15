# 0026: Keep a Small Shell Floor Under the Scripts

## Context

The repository's logic had spread into shell scripts under `scripts/` and `.github/`. Shell has no unit tests, no dependency injection, and no typed contracts, so the scripts that ship the IC suite and gate the session hooks were the least-tested code in the repository. NestJS commands in `synchronization`, `validation`, and two new projects, `publication` and `installation`, now take that logic over.

Some scripts must not move. The validation project's guidance already held the rule for five of them: a check that must work when the install is broken stays shell. Committing and pushing the fix for a broken `node_modules` cannot depend on a working `node_modules`. The rule was written down in one project and never extended, so the next person to find a shell script would have had to rediscover it.

## Decision

**A script stays shell when it must work while `node_modules` is missing or broken, or when it only wraps an interactive terminal.** Everything else moves into a command. The discriminator is not startup cost: the CLI boots in about 0.83s and the shell session hook takes about 0.77s, because it shells out to Node anyway. It is whether the script still works when the install is broken.

The surviving floor is:

| Script | Why it stays shell |
| ------ | ------------------ |
| `scripts/git/check-commit-signing-configuration.sh`, `scripts/git/check-push-commit-signatures.sh` | They run from the pre-commit and pre-push hooks. |
| `scripts/git/check-gh-authentication.sh`, `scripts/git/validate-session-commit-signing.sh`, `scripts/git/validate-session-gh-authentication.sh` | They use only `git`, `gpg`, and `gh`, and run from a terminal or a session start. |
| `scripts/git/emit-session-hook-context.sh` | It is the one place the Claude and Copilot hook output formats are defined. The commands that replace the other session hooks only print text and set an exit code. |
| `scripts/nx/bound-base-to-push.sh` | It runs before `pnpm install` in `setup-codebase`, so it cannot depend on a working install. |
| `scripts/utilities.sh`, sourced by setup | The setup stub needs it before any dependency exists. |
| The Node and pnpm step, `scripts/local/software/node.sh` | It installs the runtime every command needs, so it cannot be a command. A thin stub keeps that step, then calls the `installation` command. |
| `scripts/shell/*.sh` | They are command references and helper functions sourced into a terminal. |
| `scripts/sign-commits.sh` | It is the re-signing wrapper, and a broken install is when someone needs it. |
| `scripts/git/delete-stale-local-branches.sh` | It is a git-only cleanup with no logic worth testing. |

The devcontainer lifecycle scripts are not part of this floor. They belong to the devcontainer, not to `scripts/`.

**A moved script leaves nothing or a thin shim.** A hook that moves becomes a shim that pipes its command's output through the shell emitter. When the command cannot boot because dependencies are missing, the shim emits a "run pnpm install" context rather than staying silent.

## Consequences

- A new script under `scripts/` needs a reason from this table. Without one, it is a command.
- Removing an entry from the floor needs a new ADR that supersedes this one.
- The task-database steps in `scripts/nx/` are not on the floor. They stay shell only until a CI run shows that moving them after `pnpm install` loses no cache hits.
- The `validation` project's guidance links here instead of restating the rule.
