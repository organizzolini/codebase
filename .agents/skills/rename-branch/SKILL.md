---
name: rename-branch
description: "Rename a git branch. Analyzes changes against the main branch, decides on a conventional name, and executes the rename."
---

# Rename Branch

This skill provides a standardized workflow for renaming a Git branch to comply with the repository's Conventional Commits naming conventions (`<type>/<scope>-<description>`).

## When to Use This Skill

- When the user asks to "rename this branch" or "give this branch a better name".
- When a branch name is rejected by a pre-push hook or CI validation and needs to be fixed.
- When a session hook or `pre-push` reports an invalid branch name. The agent renames without asking, even a branch the platform assigned.
- When the user wants the agent to automatically deduce a conventional branch name based on the current local changes.

## Workflow

When invoked, perform the following steps sequentially:

### 1. Analyze Changes

Use the terminal to understand what the branch is doing:

- Check the current branch: `git branch --show-current`
- Compare with the default branch to see what changed: `git diff --name-status main...HEAD`
- If there are uncommitted changes, check them too: `git status -s`

### 2. Determine the Conventional Name

Using the repository's naming convention (`<type>/<scope>-<description>`):

**Type**: Choose the appropriate type based on the nature of the changes.
See the [commit-code skill](../commit-code/SKILL.md#type) for the allowed types.

**Scope**: Identify the scope based on the directory of the modified files.
See the [commit-code skill](../commit-code/SKILL.md#scope) for the allowed scopes.

**Description**: Formulate a concise, lowercase, kebab-case description (e.g., `add-user-auth`).

_Note: If multiple scopes are touched, list them comma-separated in the title (e.g., `feat(lexico,logger): ...`) rather than reaching for a single umbrella scope._

### 3. Create a Backup (Safety First)

Be very cautious before taking any destructive actions (renaming or deleting remote branches). Always create a temporary backup branch to ensure no work is lost:

Preferred approach: invoke [backup-code](../backup-code/SKILL.md) before renaming so backup creation and recovery commands are documented.

```bash
branch_name="$(git branch --show-current)"
iso_timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
git branch "backup/${branch_name}/${iso_timestamp}"
```

### 4. Execute the Rename

Proceed automatically with the best determined name without asking the user for permission. Run the appropriate Git commands to rename the branch.

```bash
git branch -m <type>/<scope>-<description>
```

### 5. Update Remote (If Applicable)

If the old branch was already pushed to the remote (`git status` shows it tracking an origin branch), you must push the new branch and delete the old one:

```bash
git push origin -u <new-branch-name>
git push origin --delete <old-branch-name>
```

If remote cleanup or rename operations are incorrect, use [restore-code](../restore-code/SKILL.md) with the backup branch to recover safely.

## Example Scenarios

### Scenario 1: Uncommitted feature in lexico

- _Changes_: Modified `projects/lexico/lexico-web/src/components/Button.tsx`
- _Derived Name_: `feat/lexico-button-component`
- _Action_: `git branch backup/old-name/2026-06-22T12-00-00Z`, then `git branch -m feat/lexico-button-component`

### Scenario 2: Pushed bugfix in caelundas

- _Changes_: Modified `projects/caelundas/caelundas-cli/src/utils/time.ts` (already pushed as `fix-time`)
- _Derived Name_: `fix/caelundas-time-calculation`
- _Action_: `git branch backup/fix-time/2026-06-22T12-00-00Z`, then `git branch -m fix/caelundas-time-calculation`, push new, and delete old remote.
