---
name: checkout-branch
description: Name, create, validate, and rename Git branches to this codebase's `<type>/<scope>-<description>` convention. Use when creating a branch, when a session hook or pre-push rejects a branch name (rename it without asking, even one the platform assigned), when asked to rename a branch or derive a name from its changes, or when asked about branch naming rules.
license: MIT
---

# Checkout Branch

Every branch except `main` must be named `<type>/<scope>-<description>` to pass the pre-push hook and 🧑‍⚖️ Comply. This skill names a new branch, validates one, and renames one that fails.

## Format

```text
<type>/<scope>-<description>
```

**All three parts are required.**

- **Type** — one of the allowed types in the generated table in the [commit-code skill](../commit-code/SKILL.md#type), from [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs). Pick the type the pull request title will carry, at least as release-significant as its most significant commit.
- **Scope** — one of the allowed scopes in the [commit-code skill](../commit-code/SKILL.md#scope). A scope is not a project: each IC-suite toolchain commits under one scope (`callidescope`, `codependix`, `codometer`, `conformetry`). A branch names one scope even when its pull request title will name several.
- **Description** — lowercase kebab-case, two to four words saying what the branch does.

✅ **Good:**

```bash
git checkout -b feat/lexico-user-auth
git checkout -b fix/caelundas-timezone-bug
git checkout -b docs/documentation-architecture
git checkout -b chore/dependencies-update-nx
git checkout -b refactor/integration-cleanup
```

❌ **Bad:**

```bash
git checkout -b feat/lexico                  # Missing description
git checkout -b feature/lexico-auth          # Invalid type (use 'feat')
git checkout -b feat/lexicoAuth              # Wrong case (use kebab-case)
git checkout -b feat/deps-update             # Invalid scope (use 'dependencies')
```

**Exempt:** only `main`, plus the automated prefixes `copilot/*`, `dependabot/*`, `jimmypaolini/copilot/*`, and `renovate/*`.

## Create a Branch

Settle the issue first with [link-issue](../link-issue/SKILL.md), then branch from an up-to-date `main` (or use [using-git-worktrees](../using-git-worktrees/SKILL.md) for an isolated worktree):

```bash
git fetch origin main
git checkout -b <type>/<scope>-<description> origin/main
pnpm exec validate-branch-name -t "$(git branch --show-current)"
```

## Rename a Branch

Rename whenever a session hook (`validate-session-branch-name.sh`) or the `pre-push` hook rejects the name, or the user asks. **Rename without asking**, even a branch the session or platform assigned: every branch must be compliant. Tell the user the new name afterwards.

1. **Read what the branch does.** `git branch --show-current`, `git diff --name-status origin/main...HEAD`, and `git status -s` for uncommitted work.
2. **Choose the name.** The type from the nature of the change; the scope from the project the changed files belong to (the one carrying most of the work, when several do); a short description.
3. **Back up first.** Run [backup-code](../backup-code/SKILL.md), which records the branch tip without switching branches.
4. **Rename locally.**

   ```bash
   git branch -m <type>/<scope>-<description>
   pnpm exec validate-branch-name -t "$(git branch --show-current)"
   ```

5. **Move the remote, if the old name was pushed.** Rename it on GitHub, which keeps any open pull request attached, then point the local branch at it:

   ```bash
   gh api -X POST repos/{owner}/{repo}/branches/<old-branch-name>/rename -f new_name=<new-branch-name>
   git fetch origin && git branch -u origin/<new-branch-name>
   ```

   Without `gh` (a cloud session), push the new name with `git push -u origin <new-branch-name>`; delete the old remote branch only when no open pull request uses it, since deleting a pull request's head closes it.

If a step goes wrong, recover with the restore half of [backup-code](../backup-code/SKILL.md#restore).

## Validation

| Stage         | Mechanism                                                                      | Config File                       |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| Session start | `validate-session-branch-name.sh`, over `installation`'s `session-branch-name` | `validate-branch-name.config.cjs` |
| Local         | `configuration/repository/.husky/pre-push` hook                                | Same config                       |
| CI            | `.github/workflows/continuous-compliance.yml`                                  | Same config                       |

The validation config imports types and scopes from [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs), so branch and commit rules never drift apart.

## Troubleshooting

| Issue                 | Cause                   | Solution                                                      |
| --------------------- | ----------------------- | ------------------------------------------------------------- |
| "Branch name invalid" | Missing description     | Add `-<description>` after the scope                          |
| "Unknown scope"       | Typo, or a project name | Use a scope from [commit-code](../commit-code/SKILL.md#scope) |
| "Unknown type"        | Typo or invalid type    | Use a type from [commit-code](../commit-code/SKILL.md#type)   |
| "Invalid format"      | Wrong separator or case | Use `/` after type, `-` in description, all lowercase         |

## Resources

- [validate-branch-name.config.cjs](../../../validate-branch-name.config.cjs) — Validation config
- [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs) — Types and scopes
- [commit-code skill](../commit-code/SKILL.md) — The generated types and scopes tables
