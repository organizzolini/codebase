---
name: create-pull-request
description: Create or update a pull request to this codebase's conventions — the conventional-commit title, the four-section body Comply enforces, the labels, the assignee, and the issue it closes. Use when opening a pull request, rewriting or refreshing a title or description that no longer matches the branch, preparing changes for review, or asked about pull request rules.
license: MIT
---

# Create Pull Request

The single owner of this repository's pull request conventions: what a title, body, label set, and issue link must be, and how to open a pull request or bring an existing one back in line with its branch. [submit-changes](../submit-changes/SKILL.md) runs the whole branch-to-pull-request pipeline and calls this skill for the pull request itself; [ship-changes](../ship-changes/SKILL.md) takes it from open to merged.

## Every PR Closes an Issue

Every pull request must close or reference a GitHub issue through GitHub's own link: a closing keyword in the body or the Development sidebar. Use the [link-issue skill](../link-issue/SKILL.md) to find the planned ticket, file one before starting ad-hoc work, or backfill one for work already done. Put `Closes #N` as the first bullet of 🔗 Related.

| Keyword                                | Effect                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| `Closes #N`, `Fixes #N`, `Resolves #N` | Links the issue and closes it when the PR merges              |
| `Related to #N`                        | Mentions only; GitHub records no link, so it does not suffice |

The issue holds the why, the acceptance criteria, and the discussion; the pull request holds what changed and how it was verified. Do not copy the issue's requirements into the description.

## Title

```text
<type>(<scope>): <gitmoji> <subject>
```

The title follows the commit format in [commit-code](../commit-code/SKILL.md), with a type and scopes from the [tables below](#allowed-types-and-scopes). On top of that:

- **Length**: under 128 characters, and about 115 or less, so a merge-queue suffix does not push the queued commit subject over the limit.
- **At most 3 scopes**, `type(scope-a,scope-b): …`, the ones that carry most of the commits. Comply rejects a fourth even when the header fits. A branch that spans projects takes a multi-scope title; that alone is never a reason to split. See [One Pull Request by Default](../../../AGENTS.md#one-pull-request-by-default).
- **Release significance**: the repository squash-merges with the title as the commit message, so the title is the only thing semantic-release reads. Its type must be at least as significant as the most significant commit on the branch, and it must name at least one scope those commits use ([Release Significance](../commit-code/SKILL.md#release-significance)).

### Allowed Types and Scopes

Generated from [conventional.config.cjs](../../../configuration/repository/conventional.config.cjs) by `nx run integration:conventional-config:write`; edit the config, never the tables.

<!-- types-start -->

| Type | Description |
| ---- | ----------- |
| `feat` | A new feature or capability that adds value for users |
| `fix` | A bug fix that addresses a specific issue or problem |
| `docs` | Documentation, AGENTS.md, SKILL.md, README, and planning files |
| `test` | Adding or correcting unit, integration, or end-to-end tests |
| `refactor` | Code restructuring that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace, or code structure changes with no semantic effect |
| `perf` | A code change that improves performance (caching, query optimization, etc.) |
| `chore` | Housekeeping that doesn't modify src or test files (gitignore, editor config, etc.) |
| `ci` | GitHub Actions workflows, composite actions, and CI/CD scripts |
| `build` | Build system, Vite/Docker/Helm config, or external dependency integration |
| `revert` | Reverts a previous commit |

<!-- types-end -->

<!-- scopes-start -->

| Scope | Description |
| ----- | ----------- |
| `ic-suite` | Code measurement and validation toolchains and their shared conventions |
| `affirmancy` | Python Jupyter notebook application for LangGraph affirmation generation |
| `caelundas` | Node.js CLI for astronomical calendar generation (NASA JPL ephemeris) |
| `configuration` | Workspace root config files (tsconfig, eslint, vitest, nx.json, etc.) |
| `compliance` | GitHub issue and pull request metadata, repository governance, and external resource policies |
| `conformetry` | Code generator templates and validation tests for generated instances |
| `persistence` | Shared Postgres package: environment, TypeORM module, base entities, test harness, and migrations |
| `interface` | Shared GraphQL package: Relay helpers, entity-to-object types, client codegen, and test helpers |
| `dependencies` | Dependency version changes (upgrades, additions, removals via pnpm) |
| `deployment` | Deployment CLI: the CI release steps |
| `deployments` | GitHub Actions workflows and CI/CD pipeline configuration |
| `documentation` | Markdown docs, skills, planning files, and AGENTS.md files |
| `infrastructure` | Helm charts, Terraform configs, and Kubernetes resources |
| `installation` | Developer-machine setup: environment files, dependencies, shell config, software |
| `integration` | CI plumbing: steps around a CI job (affected run, Nx task-cache database) |
| `JimmyPaolini` | Static GitHub profile README project (markdown and assets) |
| `lexico` | TanStack Start SSR Latin dictionary web app |
| `presentation` | Shared React/shadcn component library |
| `lexico-db` | Shared TypeORM entities and GraphQL types |
| `lexico-cli` | Data ingestion scripts for Lexico |
| `meanderaw` | Greek meander (key/fret) SVG generator CLI and the composable motif/modifier library it reads |
| `sempientor` | Lexical gap discovery CLI for English morphological and phonotactic gaps |
| `callidescope` | Call stack tracing and linting CLI and its configuration and rendering packages |
| `codependix` | Dependency graph export CLI and its configuration and boundary-checking packages |
| `codometer` | Code statistics measurement CLI and its configuration, diff, and rendering packages |
| `coinagerie` | Codebase vocabulary CLI that lists the words a codebase uses and keeps a glossary of them in step with the code |
| `no-release` | Escape hatch: suppress semantic-release for any commit type |
| `release` | Version bumps and release commits generated by semantic-release |
| `reporting` | Pull request change report generation and the packages that diff and render it |
| `scripts` | Shell and TypeScript scripts in scripts/ (sync, setup, utilities) |
| `testing` | Vitest configuration, shared test utilities, and coverage setup |

<!-- scopes-end -->

## Description

The [PR template](../../../.github/PULL_REQUEST_TEMPLATE.md) is the structure, mirrored here by the `pull-request-template` synchronizer:

<!-- pr-template-start -->

```markdown
## 🌰 Summary

<!-- One plain paragraph of at most 48 words, readable at a glance: what this PR does and why. Title reminder: the title's scope list must share at least one scope with each commit, so release-significance passes. -->

## 📝 Details

- <!-- A bulleted list of the specific changes made, one marker throughout, at most 512 words in all -->

## 🧪 Testing

1. <!-- An ordered list of steps that verify these changes; a step may hold a code block -->

## 🔗 Related

- <!-- Start with a `-` list linking related issues, pull requests, specs, or documentation; anything may follow it -->
```

<!-- pr-template-end -->

### Description Guidelines

| Section    | Holds only                                                                                   | Word limit |
| ---------- | -------------------------------------------------------------------------------------------- | ---------- |
| 🌰 Summary | One plain paragraph saying what the PR does and why, readable at a glance                    | 48         |
| 📝 Details | A bulleted list of changes using one marker throughout, nested bullets included              | 512        |
| 🧪 Testing | An ordered list of verification steps; a step may hold a code block                          | —          |
| 🔗 Related | A `-` list opening with `Closes #N`, then pull requests, specs, or docs; anything may follow | —          |

> ⚠️ **Strict Validation:** CI validates that all 4 headings (`## 🌰 Summary`, `## 📝 Details`, `## 🧪 Testing`, `## 🔗 Related`) are present and non-empty, that each holds only the shape in the table above and stays within its word limit, and that no HTML template comments (`<!-- ... -->`) remain. Words are counted as `wc -w` would. In Summary, Details, and Testing, a paragraph, heading, or code block sitting beside the list fails the section: indent a code block under its Testing step instead. Details may use `-`, `*`, or `+`, but only one of them, as markdownlint's MD004 requires. Related only has to open with its `-` list; an attribution line or any other closing content may follow. The `compliance pull-request` check also reads GitHub's issue link. A pull request with no tracking issue gets one from the [link-issue skill](../link-issue/SKILL.md), never a documentation link in its place.

Write each section from **facts in the diff** only — no speculation or plans. Summary synthesizes the purpose; Details names each meaningful change, present tense, with file or component names, including any departure from the issue; Testing lists the `nx run <project>:<target>` commands and manual steps that verify it. [examples.md](references/examples.md) has a feature, a fix, a docs change, and a dependency upgrade.

## Labels and Assignee

Comply checks that labels agree with the title: exactly one `type:*` label matching its type, one `scope:*` label per scope it names (no extras), exactly one `source:*` label (`source:agent` when an agent opens it, `source:human` for a person), and no `do-not-merge`. The pull request also needs an assignee. Set all of it at creation rather than leaving the reconciliation step to backfill it; [triage-integration](../triage-integration/SKILL.md) covers the full label vocabulary and each metadata failure.

## Create a Pull Request

1. **Settle the issue** with [link-issue](../link-issue/SKILL.md), and make sure the branch is pushed and named per [checkout-branch](../checkout-branch/SKILL.md).
2. **Validate the work** with [validate-code](../validate-code/SKILL.md) — the five targets and the quality gates.
3. **Draft the body** to a file:

   ```bash
   cat << 'EOF' > /tmp/pr_body.md
   <the four sections>
   EOF
   ```

4. **Open it, then set labels and the assignee.** `gh pr create` runs GraphQL, which Claude Code sessions block, so use [repo-scoped REST](../../../documentation/agents/issue-tracker.md#repo-scoped-rest-instead-of-graphql):

   ```bash
   pr_number="$(gh api repos/{owner}/{repo}/pulls \
     -f title="<type>(<scope>): <gitmoji> <subject>" \
     -F body=@/tmp/pr_body.md -f head=<branch> -f base=main --jq .number)"
   gh api -X POST "repos/{owner}/{repo}/issues/${pr_number}/labels" \
     -f 'labels[]=type:<type>' -f 'labels[]=scope:<scope>' -f 'labels[]=source:agent'
   gh api -X POST "repos/{owner}/{repo}/issues/${pr_number}/assignees" \
     -f "assignees[]=$(gh api user --jq .login)"
   rm /tmp/pr_body.md
   ```

   Repeat `-f 'labels[]=scope:<name>'` for each scope the title names. A cloud session with no `gh` uses the GitHub MCP tools: `create_pull_request`, then `issue_write` (`method: update`, same number) for `assignees` (from `get_me`) and `labels`, since `create_pull_request` takes neither.

5. **Check it.** Run the compliance check (read-only) and fix what it reports, then confirm the issue link and metadata landed — GitHub silently drops a mistyped label:

   ```bash
   NODE_OPTIONS='' node --import @swc-node/register/esm-register compliance/src/compliance.main.ts pull-request "${pr_number}"
   gh api repos/{owner}/{repo}/pulls/"${pr_number}" --jq '{labels: [.labels[].name], assignees: [.assignees[].login]}'
   gh api repos/{owner}/{repo}/pulls/"${pr_number}" --jq .body | grep -oiE '(close[sd]?|fix(e[sd])?|resolve[sd]?):? +#[0-9]+'
   ```

   An empty last result means the link is missing: fix the keyword, or, for a stacked pull request whose base is not `main`, add the issue under Development in the sidebar (see [link-issue](../link-issue/SKILL.md#link-it)).

**Drafts**: add `-F draft=true` to open one. Continuous Integration skips drafts, so mark it ready before expecting checks: `gh api -X POST repos/{owner}/{repo}/pulls/<number>/ccr/ready_for_review` in a Claude Code session, `gh pr ready <number>` elsewhere.

## Update an Existing Pull Request

Use when the title or description no longer matches the branch — after significant changes, a change of scope, or a reviewer asking for clarity.

1. **Find it**: `gh api "repos/{owner}/{repo}/pulls?head={owner}:$(git branch --show-current)&state=open" --jq '.[0] | {number, title, body}'`. No pull request means [Create a Pull Request](#create-a-pull-request) instead.
2. **Read the whole branch**: `git log origin/main..HEAD --oneline` and `git diff origin/main..HEAD --stat`, then the diff itself.
3. **Keep the issue link.** Note the `Closes #N` the body already carries and keep it as the first Related bullet; with none, settle one with [link-issue](../link-issue/SKILL.md).
4. **Rewrite the title and body** to the rules above, from the diff alone. Recheck the title's release significance against every commit and its scopes against the labels.
5. **Apply** with `gh api -X PATCH repos/{owner}/{repo}/pulls/<number> -f title="…" -F body=@/tmp/pr_body.md` (or `update_pull_request` over MCP), and update the `type:*` and `scope:*` labels if the title changed.
6. **Verify** as in step 5 of creating one. A body that no longer prints `Closes #N` lost its link in the rewrite; restore it.

## Keep the Branch Current

Merge `origin/main` into the branch rather than rebasing: a rebase rewrites signed commits and needs a force push. Take a [backup-code](../backup-code/SKILL.md) snapshot first, and follow [ship-changes](../ship-changes/SKILL.md#2-conflicts) for conflicts. A stacked branch is the exception, kept linear with [gh-stack](../gh-stack/SKILL.md).

## Pre-Flight Checklist

- [ ] The branch follows `<type>/<scope>-<description>` and is pushed
- [ ] The title follows `<type>(<scope>): <gitmoji> <subject>`: ≤ 128 characters (target ≤ 115), at most 3 scopes, imperative and lowercase after the gitmoji
- [ ] The title's type is at least as significant as every commit, and names at least one scope they use
- [ ] The body has all four sections in their shapes and limits, with no template comments left
- [ ] Related opens with `Closes #N` for an issue that exists, and GitHub recorded the link
- [ ] One `type:*`, one `scope:*` per title scope, one `source:*` label, and an assignee
- [ ] [validate-code](../validate-code/SKILL.md) passes, and the compliance check reports nothing

## References

- [examples.md](references/examples.md) — Example titles and bodies by kind of change
- [ci-checks.md](references/ci-checks.md) — The checks every pull request must pass, and troubleshooting
- [link-issue](../link-issue/SKILL.md) — Choosing, filing, or backfilling the issue
- [commit-code](../commit-code/SKILL.md) — Title format, types, scopes, and release significance
