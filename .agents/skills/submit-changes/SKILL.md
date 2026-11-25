---
name: submit-changes
description: "Take local changes through branch, commit, push, and pull request in one step, renaming a non-conforming branch on the way. Use when asked to submit or push changes, or to go from local changes to an open pull request. Merging afterwards is ship-changes."
license: MIT
---

# Submit Changes

This skill automates the full pipeline from local changes to an open pull request: **branch → commit → push → PR**. Each phase is idempotent — already-completed steps are skipped automatically.

## When to Use This Skill

- Submitting local changes as a complete workflow in one step
- Automating the branch + commit + PR process without manual intervention
- Opening a pull request for finished work without running each git command by hand

## Safety Rules

These rules are non-negotiable:

- **NEVER** run destructive commands (`git reset`, `git clean`, `git checkout -- .`, `git push --force`, `git rebase`)
- **NEVER** bypass hooks with `--no-verify`
- **NEVER** disable signing with `--no-gpg-sign`
- **NEVER** silence a pre-commit failure with a suppression comment, a loosened compiler option, a lint ignore, a raised limit, or a new dictionary word; fix only [easy failures](#if-pre-commit-hooks-fail) in the files you are submitting
- On any other failure: **report the error and stop immediately**

## Automatic Change Analysis

Before executing any phases, analyze the working tree and staged changes:

```bash
git status --porcelain
git diff HEAD
```

From the diff, automatically determine:

1. **Type** — From the allowed types (see [commit-code skill](../commit-code/SKILL.md))
2. **Scope** — From the allowed scopes (see [commit-code skill](../commit-code/SKILL.md))
3. **Gitmoji** — Best-fit emoji for the type and intent (see [commit-code skill](../commit-code/SKILL.md))
4. **Subject** — Concise imperative phrase, lowercase, no period, under 70 chars

These values drive the branch name, commit message, and PR title throughout all phases.

## Phase 0 — Issue

Every pull request closes an issue. Before branching, settle which one with the [link-issue skill](../link-issue/SKILL.md):

1. **Planned**: the task came from a ticket, so use that parent issue.
2. **Not yet started**: no ticket exists, so file one now.
3. **Already done**: the changes sit in the working tree with no issue, so backfill one from the diff.

Keep the issue number; Phase 3 closes it. **Skip if:** the branch already has an open PR that lists an issue under `closingIssuesReferences`.

## Phase 1 — Branch

1. Check current branch: `git rev-parse --abbrev-ref HEAD`
2. If on `main`, create and switch to a new branch following [checkout-branch conventions](../checkout-branch/SKILL.md):

   ```bash
   git checkout -b <type>/<scope>-<description>
   ```

3. Validate branch-name conformance for the current branch:

   ```bash
   pnpm exec validate-branch-name -t "<branch>"
   ```

4. If validation fails, rename the branch with [checkout-branch](../checkout-branch/SKILL.md#rename-a-branch), then re-run validation.
5. Push to remote and set upstream:

   ```bash
   git push --set-upstream origin <branch>
   ```

Branch name format: `<type>/<scope>-<description>` (kebab-case, 2–4 keyword description)

## Phase 2 — Stage, Commit & Push

**Skip if:** Working tree is clean (`git status --porcelain` returns nothing).

1. Stage the changes this submission makes — read `git status --porcelain` first, and leave out anything the task did not produce:

   ```bash
   git add <paths>
   ```

2. Compose commit message: `<type>(<scope>): <gitmoji> <subject>` — single line, max 128 chars, no body/footer

3. Commit with signing enabled:

   ```bash
   export GPG_TTY="$(tty)"
   git commit -S -m "<type>(<scope>): <gitmoji> <subject>"
   ```

4. Verify the new commit signature:

   ```bash
   git verify-commit HEAD
   ```

> ✅ **Best practice:** Let Husky run signing checks automatically. The pre-commit hook runs `check-commit-signing-configuration.sh`, and the pre-push hook runs `check-push-commit-signatures.sh`.
>
> ⚠️ **Warning:** Do not invoke `scripts/git/check-push-commit-signatures.sh` directly during normal submits. It is designed for hook stdin input and can block or fail when run without ref-update data.

### If pre-commit hooks fail

Read the hook output, then sort the failure:

- **Easy**: a mechanical failure whose root cause sits in a file this submission already changes, fixed by editing that file. Examples: a spell-check unknown word in text you wrote (reword it), a format or lint autofix (`nx run <project>:<target>:write`), a type error in a line you touched, a stale generated report in a touched project. Fix it, re-stage, and commit again. Allow **two** such rounds; a third failure, or one that differs from the last, is not easy.
- **Not easy**: anything else. Examples: a file outside the diff, a dependency, lockfile, tsconfig, or limit change, a failing or weakened test, a failure with no clear root cause, or a failure that predates your change. **Stop immediately.** Report the hook output so the user can see what failed, and do **NOT** proceed to push.

Never revert unrelated changes a hook leaves behind (for example a `pnpm-lock.yaml` rewritten by an auto-install) by guessing: read the diff, and revert only drift the change did not cause. Name every easy fix in the final summary.

### If commit succeeds

Push to remote:

```bash
git push --set-upstream origin <branch>
```

## Phase 3 — Pull Request

**Skip if:** a pull request already exists for the branch (`gh api "repos/{owner}/{repo}/pulls?head={owner}:<branch>&state=open" --jq '.[].number'`); update it instead with [create-pull-request's Update section](../create-pull-request/SKILL.md#update-an-existing-pull-request) when the branch has moved past its description.

Otherwise open one with [create-pull-request](../create-pull-request/SKILL.md#create-a-pull-request), which owns every rule this phase must meet: the title (the commit's format, at most three scopes, at least as release-significant as every commit), the four-section body with `Closes #N` for the Phase 0 issue first under Related, `source:agent` with the matching `type:*` and `scope:*` labels, the assignee, and the compliance check. **The compliance check is a hard gate**: fix what it reports before finishing, and never apply `do-not-merge`.

## Output

After completing all phases, print a summary table:

| Phase    | Result                                                    |
| -------- | --------------------------------------------------------- |
| Issue    | Used `#N` / Filed `#N` / Backfilled `#N`                  |
| Branch   | Created `<branch>` / Already on `<branch>`                |
| Commit   | `<type>(<scope>): <gitmoji> <subject>` / Skipped (clean)  |
| PR       | Created `<url>` / Already exists `<url>`                  |
| Labels   | `type:*`, `scope:*` (one per title scope), `source:agent` |
| Assignee | `@me` — confirmed via the pull request's REST endpoint    |

## Resources

- [link-issue skill](../link-issue/SKILL.md) — Find, file, or backfill the issue the PR closes
- [checkout-branch skill](../checkout-branch/SKILL.md) — Branch naming, validation, and renaming
- [commit-code skill](../commit-code/SKILL.md) — Commit message format, types, scopes, gitmoji
- [create-pull-request skill](../create-pull-request/SKILL.md) — PR conventions and description template, full Labels section
- [triage-integration skill](../triage-integration/SKILL.md) — Label vocabulary, `opened`/`reopened` reconciliation, fixing metadata failures
- [check-commit-signing-configuration.sh](../../../scripts/git/check-commit-signing-configuration.sh) — Pre-commit hook signing prerequisite check
- [check-push-commit-signatures.sh](../../../scripts/git/check-push-commit-signatures.sh) — Pre-push hook commit signature validation
