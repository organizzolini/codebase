---
type: Reference
title: Development Workflow
description: End-to-end development workflow covering the 8-step agent process, project-scoped work rules, Nx commands, code validation gates, pull request compliance, and integration procedures.
tags: [workflow, agent, nx, validation, pull-request, testing, ci-cd]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-22T17:40:37.367Z
sources:
  - id: openwiki-source-328f959db511ad93fac4d300
    resource: repo://.agents/skills/brainstorming/SKILL.md
  - id: openwiki-source-fab39b38cc4a467604c546aa
    resource: repo://.agents/skills/finishing-a-development-branch/SKILL.md
  - id: openwiki-source-da457ede71f7f44bbcac86cc
    resource: repo://.agents/skills/requesting-code-review/SKILL.md
  - id: openwiki-source-254dca60aab9850bcd870948
    resource: repo://.agents/skills/subagent-driven-development/SKILL.md
  - id: openwiki-source-ab09db9d0408f67f5441bda9
    resource: repo://.agents/skills/test-driven-development/SKILL.md
  - id: openwiki-source-dbd25ad441b2f5c4f5cd1ba8
    resource: repo://.agents/skills/validate-code/SKILL.md
  - id: openwiki-source-487acb7108f73b00cacb8292
    resource: repo://.agents/skills/verification-before-completion/SKILL.md
  - id: openwiki-source-57b81e54d1113287ebfdf6f8
    resource: repo://.github/CONTRIBUTING.md
  - id: openwiki-source-9374765e313f5ca22dd8afab
    resource: repo://.github/workflows/continuous-compliance.yml
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-cbd6c49eeb76f47b10c7a008
    resource: repo://compliance/src/modules/pull-request/pull-request-validation.service.ts
generated: { by: "openwiki/0.9.0", at: "2026-11-22T17:40:37.367Z" }
---

# Development Workflow

This page documents the complete agent development workflow as defined in `AGENTS.md` and `.github/CONTRIBUTING.md`. The workflow follows an 8-step process with explicit human-gated planning phases and continuous implementation phases, all executed through Nx targets and specialized agent skills.

## Workflow Overview

**Planning is human-gated; implementation is continuous.** During planning (steps 1–4), never chain skills automatically — stop after each step and wait for explicit invocation. During implementation (steps 5–8), subagents execute autonomously and may create sub-issues without asking.

**Match the model tier to the role.** Planning (steps 1–4) runs on an Opus/Sol-level model; implementation is orchestrated (coordinating tickets or tasks across steps 5–8) by a Sonnet/Terra-level model; implementation tasks and subagents run on a Haiku/Luna-level model, escalating to Sonnet/Terra only when really necessary. Opus/Sol-level models are reserved for human-selected main sessions, and a subagent's model is always passed explicitly so it does not inherit a larger session model.

| Step | Phase | Skills | Gate |
|------|-------|--------|------|
| 1 | Clarify | `brainstorming` (and `grill-me` for a harder interview) | Human approval of the design |
| 2 | Specify | Manual: publish the approved design as a spec issue | Spec issue linked, Priority set |
| 3 | Decompose | Manual: `writing-plans` against the spec issue | Human approval of the ticket breakdown |
| 4 | Handoff | Manual: the `# Handoff` comment on the spec issue, for multi-session work | Posted |
| 5 | Build | `link-issue`, `ponytail`, `test-driven-development`, `systematic-debugging` (`subagent-driven-development` beyond a couple of commits) | Tests pass |
| 6 | Review | `requesting-code-review`, `ponytail-review`, `receiving-code-review` | Reviewer feedback applied |
| 7 | Validate | `validate-code`, `verification-before-completion`, `ponytail-debt` | All checks pass with evidence |
| 8 | Integrate | `finishing-a-development-branch`, `submit-changes`, `commit-code`, `create-pull-request` | PR open |

Steps 5 through 8 run **once per pull request**. For the usual one-pull-request spec the session runs them for the whole spec; for a split spec each dispatched parent subagent runs them for its own pull request.

### One Pull Request by Default

A spec lands as **one pull request** unless something mechanical forces a split: one review, one manual test of the change as a whole. Do not split for size, for several projects or scopes (list them in the title, e.g. `feat(lexico,lexico-db): …`), or for mixed significance (title it at the most significant commit; `feat` outranks `fix`). Split only for deployment order (a Terraform change applied first, a database migration the next code relies on, a package version that must be on a registry first), when the title cannot hold the scopes within commitlint's 128-character header, or when the user asked for separate pull requests. A split spec is done when every parent issue is merged or open as a pull request; independent parents run in parallel worktrees, and dependent parents stack with `gh-stack`.

## Step 1: Clarify

Run `brainstorming`, and `grill-me` when the plan needs a harder interview. Explore the code through OpenWiki and the source itself. When the design is approved, summarize it and **stop** instead of writing the spec file brainstorming would write next. The `brainstorming` skill classifies a request as a spike (an answer, not code), a bounded change (a short design in chat), or an architectural change (a written spec).

## Step 2: Specify

Only on manual request, publish the approved design as the spec issue — a Feature (or Bug) with `--type` — in place of a `docs/superpowers/specs/` file. Scope the spec to land as one pull request, name any mechanical reason for a split, set its Priority with `manage-project` (never change one already set), link it, and stop.

## Step 3: Decompose

Only on manual request, run `writing-plans` against the spec issue and publish its plan as tickets instead of a plan file: by default **one parent issue** (the pull request) with **one sub-issue per planned commit**, each with `--type Task`. Add a second parent issue only for a reason listed under One Pull Request by Default. Confirm the breakdown, publish, and stop; reach for `wayfinder` if the work exceeds one session.

## Step 4: Handoff

Only on manual request for multi-session work, post the `# Handoff` comment on the spec issue (never a temporary file) and stop. Follow the five repository rules in `documentation/agents/handoffs.md`: prescribe the workflow skills in call order, answer the plan-file and test-seam questions, state that the session owns every pull request, and assign a model and thinking level per role.

## Step 5: Build

Every pull request closes an issue, so use `link-issue` first. Set each ticket's board Status to In Progress, and its Effort, before testing, with `manage-project`.

- **One branch, many tasks** — build the whole pull request on one branch. When it carries more than a couple of commits, dispatch each commit sub-issue to a fresh subagent (`subagent-driven-development`) on a Haiku/Luna-level model, one after another on that branch, keeping the main session to orchestrating and reviewing.
- **Smallest change** — before writing code, run `ponytail` (full level): skip, reuse, standard library, installed dependency, then minimum new code. It never outranks tests, coverage, the folder structure, `conformetry-generate` output, strict typing, or Zod validation at boundaries.
- **TDD loop** — `test-driven-development` (strict red-green cycle through public interfaces; refactoring belongs to step 6).
- **Debugging** — `systematic-debugging` (root-cause gate).

**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. The cycle is RED (one minimal failing test), verify RED, GREEN (the simplest code that passes), verify GREEN (the project's full suite), REFACTOR.

Test via Nx:
```bash
nx run <project>:vitest:unit        # Unit tests
nx run <project>:vitest:integration # Integration tests
nx run <project>:vitest:end-to-end  # End-to-end tests
```

## Step 6: Review

Request review via `requesting-code-review` (a fresh subagent handed base and head commits), review with `ponytail-review`, and apply feedback via `receiving-code-review`: fix Critical immediately, fix Important before proceeding, note Minor, and push back with reasoning if the reviewer is wrong.

## Step 7: Validate

Run `validate-code` gated by `verification-before-completion`, then run `ponytail-debt` and list each debt item. All automated checks must pass with evidence before claiming completion.

```bash
# Auto-fix all format, lint, and unused-code issues
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main

# Verify no issues remain — all checks must pass
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main
```

For new/untracked files not yet picked up by `nx affected`:
```bash
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check
```

**Do not commit until both commands pass cleanly.** If they fail, use the `triage-integration` skill to diagnose and fix the errors.

## Step 8: Integrate

Use `finishing-a-development-branch` for the merge/PR decision, executing via `submit-changes`, `commit-code`, and `create-pull-request`. Read its test step as `nx affected --target=vitest --base=main`.

## Project-Scoped Work

Project-scoped work is mandatory: focus on one project at a time, complete it end-to-end before starting the next (as commits on the same branch), keep each commit to one project or module, and avoid mixing unrelated project changes in one context.

- When coding or refactoring, focus on one project at a time, or for sufficiently large requests only one module/folder at a time.
- If a request spans multiple projects or scopes, complete the first project end-to-end before starting the next one — as commits on the same branch, not as separate pull requests (see [One Pull Request by Default](#one-pull-request-by-default)).
- If the work is truly independent across projects, split it into separate subagents (using a Haiku/Luna-level model, or a Sonnet/Terra-level model only when really necessary) or separate passes so each agent stays project-scoped.
- Avoid mixing unrelated project changes in one context unless the task is explicitly orchestrating them.
- Keep each commit to one project or module even when its pull request spans several, so the title can name at most three scopes and carry the type of the most significant one — see [Release Significance](#release-significance).

## Release Significance

The PR title determines the semantic-release bump. Ensure the PR title's type is at least as significant as the highest commit on the branch.

| Type | Codebase | IC-suite package |
|------|----------|------------------|
| Breaking change (`!` after scope, or `BREAKING CHANGE:` footer) | Major | Minor while `0.x`, then major |
| `feat` | Minor | Patch while `0.x`, then minor |
| `fix`, `perf`, `refactor`, `build` | Patch | Patch |
| `ci`, `revert` | Patch | None |
| `docs`, `style`, `test`, `chore` | None | None |
| Any type with `no-release` scope | None | As its type |

## Pull Request Compliance

Every pull request must include four mandatory sections with specific shapes and limits:

1. **🌰 Summary** — one paragraph, at most 48 words
2. **📝 Details** — bulleted list, one marker throughout, at most 512 words
3. **🧪 Testing** — ordered list (a step may hold a code block)
4. **🔗 Related** — leading-dash list (items start with `-`); the first bullet must be `Closes #N` (GitHub's own link) to satisfy the issue-link requirement

A PR is validated once it exists with:
```bash
node --import @swc-node/register/esm-register compliance/src/compliance.main.ts pull-request <number>
```

Metadata requirements:
- Title follows `<type>(<scope>): <gitmoji> <subject>` (Conventional Commits)
- Exactly one `type:*` label matching the title's type
- Exactly the `scope:*` labels the title names (at least one, at most three) and no extras
- At least one assignee
- Exactly one `source:*` label (`source:agent` or `source:human`)
- The `do-not-merge` label blocks the pull request while present

## Nx Commands Reference

### Validation Gates
```bash
# Auto-fix (write mode)
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main

# Verify (check mode) — all must pass
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main

# Per-project (for new/untracked files)
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check
```

### Testing
```bash
nx run <project>:vitest:unit        # Unit tests
nx run <project>:vitest:integration # Integration tests
nx run <project>:vitest:end-to-end  # End-to-end tests
nx run <project>:vitest --configuration=coverage  # Coverage gate
```

### Affected Commands
```bash
# Run tests on affected projects
nx affected --target=vitest --base=main

# Run static checks on affected projects
nx affected --target=static-code --base=main
```

### Build & Integration
```bash
pnpm exec nx run <project>:build
pnpm exec nx run <project>:typecheck
pnpm exec nx run <project>:type-coverage  # Type coverage gate (when target exists)
```

## Continuous Integration Gates

The CI workflow runs these independent legs in parallel:

| Target | Name | Emoji | Description |
|--------|------|-------|-------------|
| `static-code` | Static | 🧑‍⚕️ | typecheck-code, format-code, lint-code, deprecate-code |
| `guard-code` | Guard | 💂 | catalog-manifests, coinagerie-check, lockfile, project-ports, readme-projects, vscode-extensions |
| `callidescope-restrict` | Callidescope Restrict | 🔭 | Call-stack depth/breadth limits |
| `codependix-bound` | Codependix Bound | 🕸️ | Dependency-graph boundary rules |
| `conformetry-validate` | Conformetry Validate | 👔 | Generated code against templates |
| `test-code` (sharded) | Test Codebase / Test Common / Test Affirmancy / Test Caelundas / Test IC Suite / Test Lexico / Test Meanderaw | 🧑‍🔬 | Vitest with coverage gates |
| `secure-code` | Secure | 🕵️ | gitleaks + trivy security scans |
| `build-projects` | Build | 👷 | Build all projects |
| `end-to-end` | End to End IC Suite | 🤵 | CLI sandbox tests |
| `plan-terraform` | Infrastructure | 🧑‍🚀 | Terraform plan for OpenRouter, GitHub, Linode |
| `build-devcontainer` | Devcontainer | 🧑‍🏭 | Build and test devcontainer image |

The merge queue re-runs all checks on the queued merge commit — a PR green on its own can still fail once `main` has moved underneath it.
