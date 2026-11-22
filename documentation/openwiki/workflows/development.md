---
type: Reference
title: Development Workflow
description: End-to-end development workflow covering the 8-step agent process, project-scoped work rules, Nx commands, code validation gates, pull request compliance, and integration procedures.
tags: [workflow, agent, nx, validation, pull-request, testing, ci-cd]
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
generated: { by: "claude-code", at: "2026-11-22T00:18:20.862Z" }
verified:
  - by: openwiki/0.9.0
    at: 2026-11-22T00:18:20.862Z
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

Run `validate-code` gated by `verification-before-completion`, then run `ponytail-debt` and list each `shortcut:` comment the branch adds in the pull request's Details, so no deferral lands without review.

### Validation Workflow

**Auto-fix:**
```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main
```
For new or untracked files `nx affected` does not pick up:
```bash
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
```

**Verify:**
```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main
```
**All checks must pass before committing.** Triage failures with the `triage-integration` skill. For a touched TypeScript project that defines a `type-coverage` target, run both `typecheck` and `type-coverage`; test coverage is 96% for branches, functions, lines and statements (`nx run <project>:vitest --configuration=coverage`).

### Verification Before Completion

**Core principle:** evidence before claims. Identify the command that proves the claim, run it in full, read the whole output and exit code, and only then make the claim. No "should work" or "probably".

## Step 8: Integrate

Use `finishing-a-development-branch` for the merge or PR decision, executing through `submit-changes`, `commit-code` and `create-pull-request`; read its test step as `nx affected --target=vitest --base=main`. Do not run raw Git commands for worktrees, branches, commits or pull requests: the skills enforce this repository's conventions.

## Nx Commands Reference

Always run tasks through Nx for caching and task graph benefits.

| Operation | Command |
|-----------|---------|
| Run affected lint/typecheck/format/deprecate/guard (auto-fix) | `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main` |
| Run affected lint/typecheck/format/deprecate/guard (check) | `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main` |
| Run tests for a project | `nx run <project>:vitest:<unit\|integration\|e2e>` |
| Run tests with coverage | `nx run <project>:vitest --configuration=coverage` |
| Run typecheck for a project | `nx run <project>:typecheck` |
| Run type coverage for a project | `nx run <project>:type-coverage` |
| Run affected tests | `nx affected --target=vitest --base=main` |
| Build affected projects | `nx affected --target=build-projects --base=main` |
| Secure code check | `nx affected --target=secure-code --base=main` |

**Note:** There is no `test` target in this workspace — it is `vitest` for TypeScript and `pytest` for Python, both reachable through `test-code`.

## Project-Scoped Work

- When coding or refactoring, focus on **one project at a time**, or for sufficiently large requests only one module or folder at a time.
- If a request spans multiple projects or scopes, complete the first project end-to-end before starting the next — **as commits on the same branch**, not as separate pull requests.
- If the work is truly independent across projects, split it into separate subagents or passes so each agent stays project-scoped.
- Keep each **commit** to one project or module even when its pull request spans several, so the title can name the fewest scopes that cover every commit and carry the type of the most significant one.

## Pull Request Compliance

Every PR description must carry all **4 mandatory sections** with real content and no unfilled placeholder comments:

| Section | Shape | Limit |
|---------|-------|-------|
| `## 🌰 Summary` | One plain paragraph | ≤ 48 words |
| `## 📝 Details` | Bulleted list, one marker throughout | ≤ 512 words |
| `## 🧪 Testing` | Ordered list (code blocks indented under step) | — |
| `## 🔗 Related` | Leading-dash list (`-`), then anything may follow | — |

**Never omit `🔗 Related`** — link to specs, files, or documentation if no issue exists.

Validate the PR once it exists (read-only) and fix what it reports before requesting review:
```bash
NODE_OPTIONS='' node --import @swc-node/register/esm-register compliance/src/compliance.main.ts pull-request <number>
```

Set all required metadata at creation:
- `--assignee @me`
- `--label type:<type>`
- `--label scope:<scope>`
- `--label source:agent`

### Branch Naming Guidelines

**Required format:** `<type>/<scope>-<description>` — all three parts required.

- **Type and scope** must be exact values from the closed vocabulary in `configuration/repository/conventional.config.cjs`. An invented scope fails validation even when the branch name reads well.
- **Description** is kebab-case matching `[a-z0-9-]+` — no uppercase, underscores, dots, or extra slashes.

**Examples**: `feat/lexico-user-auth`, `fix/caelundas-timezone-bug`, `docs/documentation-contributing-guide`

Validate before pushing:
```bash
pnpm exec validate-branch-name -t "<branch-name>"
```

Only `main` is exempt. Automated prefixes are also accepted: `copilot/*`, `dependabot/*`, `jimmypaolini/copilot/*`, `renovate/*`. Both the pre-push hook and 🧑‍⚖️ Comply Code reject anything else.

### Commit Guidelines

Format: `<type>(<scope>): <gitmoji> <subject>` — a single line, max 128 characters.

- **Type and scope** come from `configuration/repository/conventional.config.cjs`, both lowercase
- **Gitmoji required** as the first token of the subject
- Subject is lowercase, present-imperative (`add`, not `added` or `adds`), with no trailing period
- **Body and footer are forbidden**, except lines that are exactly `Co-authored-by:` or `Claude-Session:` trailers. Everything else belongs in the subject or the pull request description
- Never list multiple changes — summarize at a higher level, or split the commit

Common gitmojis: ✨ `feat` · 🐛 `fix` · 📝 `docs` · 🧪 `test` · ♻️ `refactor` · 🎨 `style` · ⚡️ `perf` · 🔧 `chore` · 👷 `ci` · 📦 `build` · ⏪ `revert`

**Breaking changes**: add `!` after the scope, or a `BREAKING CHANGE:` footer.

### Types and Scopes

The valid types (feat, fix, docs, test, refactor, style, perf, chore, ci, build, revert) and the closed scope vocabulary live in `configuration/repository/conventional.config.cjs`, the single source of truth for commitlint, branch validation, release rules and VS Code autocomplete. The scope list deliberately collapses each toolchain to one name (callidescope, codependix, codometer, coinagerie, conformetry) rather than one per package, so deriving a scope from a directory name is how an invented scope fails validation. If a change genuinely spans scopes, list them comma-separated (`feat(lexico,lexico-db): …`) rather than reaching for an umbrella scope.

### Release Significance

This repository squash-merges using the pull request title, so **the title is the only thing semantic-release ever sees**. Every individual commit on the branch is discarded at squash time.

The `pull-request-release-significance` check reads the branch's commits and fails the pull request when the title's type is **less** release-significant than the most significant commit on the branch, or when the title shares no scope overlap with a commit.

**Practical effect:** pick the type and scope for the branch as a whole, and title it at the most significant commit.

- A `feat` commit on a branch titled `chore` or `ci` fails the check — retitle the pull request as `feat`.
- Mixing `feat` and `fix` work is fine; title it `feat`, since `feat` outranks `fix`. The squash then bumps every package it touches by that type, which is accepted.


## Git Hooks (Husky)

Three Husky hooks enforce quality gates locally, from `configuration/repository/.husky/`. **Never bypass them with `--no-verify`** — fix the underlying issue instead, and never run `husky` from a worktree (it rewrites the shared `core.hooksPath` and silently disables the main checkout's hooks).

| Hook | Trigger | What it runs | Config |
|------|---------|--------------|--------|
| `pre-commit` | `git commit` | Commit signing configuration check, then **lint-staged**: format, lint, typecheck, spelling and more on staged files | `configuration/repository/lint-staged.config.ts` |
| `commit-msg` | `git commit` | **commitlint**: validates the Conventional Commits format | `configuration/repository/commitlint.config.ts` |
| `pre-push` | `git push` | **validate-branch-name**, then a commit signature check over the pushed commits | `validate-branch-name.config.cjs` |

If a hook fails, the git operation is blocked until you fix the error. `pre-commit` writes its full output to `last-lint-staged-output.log`, which is where to look when the terminal output is truncated.

## Working in a Git Worktree

Worktrees are the normal way to run several branches side by side here, and three traps are specific to this repository.

- **`pnpm-lock.yaml` goes dirty on its own.** `pnpm install` or `lint-code --write` rewrites the `projects/JimmyPaolini` entry, because a placeholder `package.json` is inconsistently present across checkouts. Revert the lockfile rather than trying to reconcile it.
- **Never run `git submodule update --init` for `projects/JimmyPaolini`.** That submodule is deliberately left uninitialized everywhere, locally and in CI. A `-` prefix in `git submodule status` is expected here, not broken.
- **The stash stack is shared with every other worktree.** A bare `git stash pop` can take someone else's work. Prefer a temporary commit, or `git stash push -u -m "<unique-tag>"` and `git stash apply <sha>`.

The branch name is not free-form in a worktree either — derive one from the tables above and validate it before creating anything, since an unvalidated branch cannot be pushed. If the branch already exists locally, attach a worktree to it rather than creating a second branch. See [using-git-worktrees](../../.agents/skills/using-git-worktrees/SKILL.md).

## Validation Gates (CI Workflows)

The Continuous Integration matrix runs one leg per gate on every pull request (see the CI/CD page for the full list): Static (typecheck, format, lint, deprecate), Guard, Callidescope Restrict, Codependix Bound, Conformetry Validate, a Test leg per project group, Secure, Build (which includes codometer), End to End IC Suite, Infrastructure and Devcontainer. The Continuous Compliance workflow separately runs Issue, Enforce and Comply (branch name, PR title, body, labels, assignees, release significance).

## IC-Suite Toolchains

Five in-house toolchains measure this workspace and gate what they measure:

| Toolchain | What It Does | What Fails a PR |
|-----------|--------------|-----------------|
| `conformetry` | Scaffolds from templates, measures generated instances against templates | `conformetry-validate` (👔 Conformetry Validate leg) |
| `codometer` | Measures directories against declared limits (size, counts, comments) | The project's `codometer` target inside `build-projects` (👷 Build leg) |
| `codependix` | Exports import graphs, judges against boundary rules | Per-project `codependix-bound` (🕸️ Codependix Bound leg) |
| `callidescope` | Traces call stacks, flags too-deep or too-wide stacks | Per-project `callidescope-restrict` (🔭 Callidescope Restrict leg) |
| `coinagerie` | Lists the words the code uses and keeps a glossary in step | Per-project `coinagerie-check` (💂 Guard leg) |

**Generate rather than hand-craft** — code written in a shape a template already describes starts life failing conformance. Use `nx g conformetry:<generator>`.

## Skills Reference by Step

| Step | Primary Skill | Supporting Skills |
|------|---------------|-------------------|
| 1. Clarify | `brainstorming` | `grill-me`, `grilling` |
| 2. Specify | (spec issue) | `manage-project`, `link-issue` |
| 3. Decompose | `writing-plans` | `wayfinder` (if work exceeds one session) |
| 4. Handoff | (`# Handoff` comment) | — |
| 5. Build | `link-issue`, `ponytail` | `test-driven-development`, `systematic-debugging`, `subagent-driven-development`, `dispatching-parallel-agents`, `gh-stack`, `using-git-worktrees` |
| 6. Review | `requesting-code-review` | `ponytail-review`, `receiving-code-review` |
| 7. Validate | `validate-code` | `verification-before-completion`, `ponytail-debt`, `triage-integration` |
| 8. Integrate | `finishing-a-development-branch` | `submit-changes`, `commit-code`, `create-pull-request` |

## Related Pages

- [Local Development](../operations/local-development.md) — Setup, commands, tooling
- [CI/CD Pipeline](../workflows/ci-cd.md) — GitHub Actions workflows and gates
- [Code Quality](../workflows/code-quality.md) — Linting, formatting, type coverage, size limits
- [Release Process](../workflows/release.md) — Semantic release, versioning, publishing
- [Scaffolding](../workflows/scaffolding.md) — Conformetry generators and templates
