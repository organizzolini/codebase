---
name: checkout-branch
description: Create and validate Git branch names following this codebase's Conventional Commits naming convention. Use this skill when creating branches, renaming branches, or when asked about branch naming rules and validation.
license: MIT
---

# Branch Naming Conventions

This skill teaches how to name Git branches for this codebase. All branch names **must** follow these rules to pass pre-push hooks and CI validation.

## When to Use This Skill

- Creating a new feature, fix, or other branch
- Renaming an existing branch to comply with conventions
- Understanding why a branch name was rejected
- Validating branch names before pushing

## Format

```text
<type>/<scope>-<description>
```

**All three parts are required.** The description must be kebab-case (lowercase with hyphens).

## Type

**Required.** Must be one of the allowed types defined in [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs).

The allowed types, with what each one means, are the generated table in the [commit-code skill](../commit-code/SKILL.md#type).

## Scope

**Required.** Must be one of the allowed scopes defined in [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs).

The allowed scopes are the generated table in the [commit-code skill](../commit-code/SKILL.md#scope). A scope is not a project: each IC-suite toolchain commits under one scope (`callidescope`, `codependix`, `codometer`, `conformetry`).

## Description

**Required.** The description must be:

- **Lowercase** — No capital letters
- **Kebab-case** — Words separated by hyphens
- **Descriptive** — Clearly indicate the purpose

### Examples

✅ **Good:**

```bash
git checkout -b feat/lexico-user-auth
git checkout -b fix/caelundas-timezone-bug
git checkout -b docs/documentation-architecture
git checkout -b chore/dependencies-update-nx
git checkout -b feat/infrastructure-devcontainer
```

❌ **Bad:**

```bash
git checkout -b feat/lexico                  # Missing description
git checkout -b fix/caelundas                # Missing description
git checkout -b feature/lexico-auth          # Invalid type (use 'feat')
git checkout -b feat/lexicoAuth              # Wrong case (use kebab-case)
git checkout -b feat/deps-update             # Invalid scope (use 'dependencies')
```

## Special Branches

These branches are exempt from the naming convention:

- `main` — Default branch
- `develop` — Development branch
- `renovate/*` — Automated dependency updates
- `dependabot/*` — Automated dependency updates

## Creating Branches

```bash
# Feature branch for lexico project
git checkout -b feat/lexico-dashboard

# Bug fix for caelundas project
git checkout -b fix/caelundas-timezone

# Documentation update for codebase
git checkout -b docs/documentation-architecture

# Infrastructure change
git checkout -b chore/infrastructure-helm-chart
```

## Renaming Branches

If a branch name is rejected, rename it:

```bash
# Rename local branch
git branch -m <type>/<scope>-<description>

# If already pushed, update remote
git push origin -u <new-branch-name>
git push origin --delete <old-branch-name>
```

## Validation

Branch names are validated at multiple stages:

| Stage | Mechanism                                       | Config File                       |
| ----- | ----------------------------------------------- | --------------------------------- |
| Local | `configuration/repository/.husky/pre-push` hook | `validate-branch-name.config.cjs` |
| CI    | `.github/workflows/continuous-compliance.yml`   | Same config                       |

The validation config imports types and scopes from [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs) to ensure consistency with commit message rules.

## Troubleshooting

| Issue                 | Cause                   | Solution                                              |
| --------------------- | ----------------------- | ----------------------------------------------------- |
| "Branch name invalid" | Missing description     | Add `-<description>` after scope                      |
| "Unknown scope"       | Typo or invalid scope   | Check allowed scopes list above                       |
| "Unknown type"        | Typo or invalid type    | Check allowed types list above                        |
| "Invalid format"      | Wrong separator or case | Use `/` after type, `-` in description, all lowercase |

## Quick Reference

```bash
# Format
<type>/<scope>-<description>

# Common patterns
feat/lexico-feature-name        # New feature in lexico
fix/caelundas-bug-name          # Bug fix in caelundas
docs/documentation-topic        # Documentation update
chore/dependencies-update       # Dependency update
refactor/integration-cleanup    # Refactoring

# Rules
- Type: lowercase, from allowed list (feat, fix, docs, etc.)
- Scope: lowercase, from allowed list (project or category)
- Description: required, lowercase, kebab-case
- Separator: / between type and scope, - between scope and description
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [validate-branch-name.config.cjs](../../../validate-branch-name.config.cjs) — Validation config
- [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs) — Types and scopes
