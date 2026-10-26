---
type: Reference
title: Development Workflow
description: End-to-end development workflow covering the 8-step agent process, project-scoped work rules, Nx commands, code validation gates, pull request compliance, and integration procedures.
tags: [workflow, agent, nx, validation, pull-request, testing, ci-cd]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-328f959db511ad93fac4d300
    resource: repo://.agents/skills/brainstorming/SKILL.md
  - id: openwiki-source-fab39b38cc4a467604c546aa
    resource: repo://.agents/skills/finishing-a-development-branch/SKILL.md
  - id: openwiki-source-36773c391cd1a149eea8c3bd
    resource: repo://.agents/skills/handoff/SKILL.md
  - id: openwiki-source-d97fabd7bda947c92f989d2d
    resource: repo://.agents/skills/implement/SKILL.md
  - id: openwiki-source-da457ede71f7f44bbcac86cc
    resource: repo://.agents/skills/requesting-code-review/SKILL.md
  - id: openwiki-source-254dca60aab9850bcd870948
    resource: repo://.agents/skills/subagent-driven-development/SKILL.md
  - id: openwiki-source-ab09db9d0408f67f5441bda9
    resource: repo://.agents/skills/test-driven-development/SKILL.md
  - id: openwiki-source-e32e2b57a6a691336eecb404
    resource: repo://.agents/skills/to-spec/SKILL.md
  - id: openwiki-source-b782b14c7a9700b9b51488ec
    resource: repo://.agents/skills/to-tickets/SKILL.md
  - id: openwiki-source-dbd25ad441b2f5c4f5cd1ba8
    resource: repo://.agents/skills/validate-code/SKILL.md
  - id: openwiki-source-487acb7108f73b00cacb8292
    resource: repo://.agents/skills/verification-before-completion/SKILL.md
  - id: openwiki-source-57b81e54d1113287ebfdf6f8
    resource: repo://.github/CONTRIBUTING.md
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-ef5eda378621be0d004c3e7f
    resource: repo://validation/src/modules/pull-request-body/pull-request-body.constants.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Development Workflow

This page documents the complete agent development workflow as defined in [AGENTS.md](../../AGENTS.md) and [CONTRIBUTING.md](../../.github/CONTRIBUTING.md). The workflow follows an 8-step process with explicit human-gated planning phases and continuous implementation phases, all executed through Nx targets and specialized agent skills.

## Workflow Overview

**Planning is human-gated; implementation is continuous.** During planning (steps 1–4), never chain skills automatically — stop after each step and wait for explicit invocation. During implementation (steps 5–8), subagents execute autonomously and may create sub-issues without asking.

The 8-step workflow:

| Step | Phase | Skill | Gate |
|------|-------|-------|------|
| 1 | Clarify | `brainstorming` + `grill-with-docs` / `grill-me` | Human approval of understanding |
| 2 | Specify | `to-spec` | Human approval of written spec |
| 3 | Decompose | `to-tickets` | Human approval of ticket breakdown |
| 4 | Handoff | `handoff` | Human approval for multi-session work |
| 5 | Build | `implement` + `test-driven-development` + `ponytail` | All tests pass, validation clean |
| 6 | Review | `requesting-code-review` + `code-review` + `ponytail-review` | Reviewer approval |
| 7 | Validate | `validate-code` + `verification-before-completion` | All checks pass with evidence |
| 8 | Integrate | `finishing-a-development-branch` + `submit-changes` + `commit-code` + `create-pull-request` | PR merged or open |

Steps 5 through 8 are **one ticket's lap**, not the whole race — run directly by this session for a single-ticket spec, or inside each dispatched subagent for a multi-ticket one. A pull request opened sends you back to step 5 for the next ticket or stack link.

## Step 1: Clarify

Run the `brainstorming` skill with either `grill-with-docs` (domain models/ADRs) or `grill-me` (plain interview). Follow `grilling` pacing: one numbered frontier with recommendations; ask `ask-matt` if unsure. When done, summarize understanding and **stop** — wait for explicit invocation to proceed.

The `brainstorming` skill classifies the request into one of three paths:
- **Spike** — feasibility question, output is an answer not code
- **Bounded** — well-scoped change to existing code, present short design in chat
- **Architectural** — new projects/subsystems, follow full process to written spec

<details>
<summary>Hard Gate: No Implementation Before Approval</summary>

Before taking any implementation action — including invoking an implementation skill, writing product code, scaffolding, installing product dependencies, or creating an external project — complete the selected path's prerequisites:
- Spike: human approves the question and probe
- Bounded: human approves the short in-chat design
- Architectural: human reviews and approves the written spec, then reviews the implementation plan and selects its execution method

A reply approves the stage actually presented. Approval of an idea or feature scope does not approve artifacts that do not exist yet. Resume at the earliest incomplete stage; do not turn one approval into permission to skip the rest of the selected path. Read-only project exploration is allowed while prerequisites remain incomplete.

</details>

## Step 2: Specify

Run `to-spec` only on manual request. The skill synthesizes the current conversation context and codebase understanding into a specification using a structured template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). Publish the spec issue as a Feature (or Bug) with `--type`, link it, and **stop**.

Key `to-spec` behaviors:
- Explore the repo to understand current state
- Sketch test seams at the highest level possible (prefer existing seams)
- Check with user that seams match expectations
- Apply `ready-for-agent` triage label

## Step 3: Decompose

Run `to-tickets` only on manual request. Break the spec into **tracer-bullet vertical slices** — each cuts a narrow but complete path through every layer (schema, API, UI, tests), is demoable/verifiable on its own, and fits in a single fresh context window.

Each ticket declares its **blocking edges** (other tickets that must complete first). Present the proposed breakdown as a numbered list with title, blocked-by, and what it delivers. Iterate until user approves the granularity, blocking edges, and any merges/splits.

Publish approved tickets to GitHub Issues (one issue per ticket in dependency order, blockers first) with `ready-for-agent` triage label. Use native sub-issue relationships for blocking edges.

**Wide refactors** are the exception to vertical slicing — sequence as expand–contract with prefactoring tickets first.

## Step 4: Handoff

Run `handoff` only on manual request for multi-session work. Compact the conversation into a handoff document saved as a **comment on the spec issue** (not in a temporary directory). 

The handoff must include:
1. Prescribed workflow skills in call order
2. Answers to plan-file and test-seam questions
3. Statement that the session owns every pull request
4. Model and thinking level assigned per role

<!-- openwiki: broken internal link [../agents/handoffs.md] file "../agents/handoffs.md" does not exist. Fix the href or restore the target, then delete this comment. -->
Follow the five repository rules in [`documentation/agents/handoffs.md`](../agents/handoffs.md).

## Step 5: Build

Set tickets to `status:in-progress` before testing.

### Multi-Ticket Spec

Dispatch each parent issue to a fresh subagent (`subagent-driven-development`); never implement sequentially in this session. Parallelize independent tickets (`dispatching-parallel-agents`) or stack dependent ones (`gh-stack`). Brief each with its ticket, the spec, and steps 5–8.

### Smallest Change

<!-- openwiki: broken internal link [#simplicity] heading anchor "simplicity" does not exist in /openwiki/workflows/development.md. Fix the href or restore the target, then delete this comment. -->
Before writing code, run `ponytail` (full level) — skip, reuse, standard library, installed dependency, then minimum new code. [Simplicity](#simplicity) says what outranks it.

### TDD Loop

Use `implement` with `test-driven-development` (strict red-green cycle) and `tdd` (confirmed seams, public interfaces; refactoring belongs to step 6).

**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. Write code before the test? Delete it. Start over. No exceptions.

The TDD cycle:
1. **RED** — Write one minimal test showing what should happen (clear name, real code, one behavior)
2. **Verify RED** — Run test, confirm it fails for the expected reason (feature missing, not typo)
3. **GREEN** — Write simplest code to pass the test (no over-engineering, YAGNI)
4. **Verify GREEN** — Run test, confirm it passes, run project's full suite (not just the file)
5. **REFACTOR** — Clean up (remove duplication, improve names, extract helpers), keep tests green

Test via Nx:
```bash
nx run <project>:vitest:unit        # Unit tests
nx run <project>:vitest:integration # Integration tests
nx run <project>:vitest:e2e         # End-to-end tests
```

### Debugging

Use `systematic-debugging` (root-cause gate) with `diagnosing-bugs`.

## Step 6: Review

Request review via `requesting-code-review` (fresh subagent handed base/head commits), review with `code-review` and `ponytail-review`, and apply feedback via `receiving-code-review`.

**When to request review (mandatory):**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**How to request:**
1. Get git SHAs: `BASE_SHA=$(git merge-base origin/main HEAD)`, `HEAD_SHA=$(git rev-parse HEAD)`
2. Dispatch a `general-purpose` subagent with the `code-reviewer.md` template
3. Act on feedback: fix Critical immediately, fix Important before proceeding, note Minor, push back with reasoning if reviewer is wrong

## Step 7: Validate

Run `validate-code` gated by `verification-before-completion`.

### Validation Workflow

**Step 1 — Auto-fix:**
```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main
```
For new/untracked files not picked up by `nx affected`:
```bash
pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
```

**Step 2 — Verify:**
```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main
```
**All checks must pass before proceeding.** If any fail, triage each failure (see `triage-integration` skill).

**Step 3 — Done:** Once both `write` and `check` pass cleanly, code quality is confirmed.

**Step 4 — Coverage Gate (when required):**
```bash
pnpm exec nx run <project>:vitest --configuration=coverage
```
Test coverage: 96% for branches, functions, lines, and statements.

**Step 5 — Type Coverage Gate (TypeScript projects with target):**
```bash
pnpm exec nx run <project>:typecheck
pnpm exec nx run <project>:type-coverage
```
Type coverage is per-project (`typeCoverage.atLeast` in `package.json`), most packages at 100% with `strict: true`.

### Verification Before Completion

**Core principle:** Evidence before claims, always. Before claiming any status:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim

No "should work", "probably", "seems to", "I'm confident" — run the verification command in this message or don't claim it passes.

## Step 8: Integrate

Use `finishing-a-development-branch` for the merge/PR decision, executing via `submit-changes`, `commit-code`, and `create-pull-request`. Read its test step as `nx affected --target=vitest --base=main`.

### Process

1. **Verify Tests** — Run project's full test suite. If tests fail, report failures and stop.
2. **Detect Environment** — Determine if normal repo, named-branch worktree, or detached HEAD.
3. **Determine Base Branch** — Confirm the fork point (usually `main`).
4. **Present Options** — Exactly 3 options for normal/named-branch, 2 for detached HEAD:
   - Merge back to base locally
   - Push and create Pull Request
   - Keep branch as-is
5. **Execute Choice** — For PR: push branch, create PR via `gh pr create` following template conventions, keep worktree for feedback iterations.
6. **Cleanup Workspace** — For merge locally and confirmed discards only; worktrees under `.worktrees/` or `worktrees/` are cleaned up by this repo.

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

- When coding or refactoring, focus on **one project at a time**, or for sufficiently large requests only one module/folder at a time.
- If a request spans multiple projects or scopes, **complete the first project end-to-end before starting the next one**.
- If the work is truly independent across projects, split it into separate subagents or separate passes so each agent stays project-scoped.
- Avoid mixing unrelated project changes in one context unless the task is explicitly orchestrating them.
- This also keeps a pull request's commits at one release significance: a branch that stays within one project or module rarely accumulates a commit more significant than the type its title was going to use.

## Pull Request Compliance

Every PR description must carry all **4 mandatory sections** with real content and no unfilled placeholder comments:

| Section | Shape | Limit |
|---------|-------|-------|
| `## 🌰 Summary` | One plain paragraph | ≤ 48 words |
| `## 📝 Details` | Bulleted list, one marker throughout | ≤ 512 words |
| `## 🧪 Testing` | Ordered list (code blocks indented under step) | — |
| `## 🔗 Related` | Leading-dash list (`-`), then anything may follow | — |

**Never omit `🔗 Related`** — link to specs, files, or documentation if no issue exists.

Pre-flight validate PR descriptions locally:
```bash
validation/src/validation.main.ts pull-request-body <path-to-body>
```

Set all required metadata at creation:
- `--assignee @me`
- `--label type:<type>`
- `--label scope:<scope>`
- `--label source:agent`

### Branch Naming Guidelines

**Required format:** `<type>/<scope>-<description>` — all three parts required.

- **Type and scope** must be exact values from the [Types](#types) and [Scopes](#scopes) tables. An invented scope fails validation even when the branch name reads well.
- **Description** is kebab-case matching `[a-z0-9-]+` — no uppercase, underscores, dots, or extra slashes.

**Examples**: `feat/lexico-user-auth`, `fix/caelundas-timezone-bug`, `docs/documentation-contributing-guide`

Validate before pushing:
```bash
pnpm exec validate-branch-name -t "<branch-name>"
```

Only `main` is exempt. Automated prefixes are also accepted: `copilot/*`, `dependabot/*`, `jimmypaolini/copilot/*`, `renovate/*`. Both the pre-push hook and 🧑‍⚖️ Comply Code reject anything else.

### Commit Guidelines

Format: `<type>(<scope>): <gitmoji> <subject>` — a single line, max 128 characters.

- **Type and scope** come from the tables below, both lowercase
- **Gitmoji required** as the first token of the subject
- Subject is lowercase, present-imperative (`add`, not `added` or `adds`), with no trailing period
- **Body and footer are forbidden**, except lines that are exactly `Co-authored-by:` or `Claude-Session:` trailers. Everything else belongs in the subject or the pull request description
- Never list multiple changes — summarize at a higher level, or split the commit

Common gitmojis: ✨ `feat` · 🐛 `fix` · 📝 `docs` · 🧪 `test` · ♻️ `refactor` · 🎨 `style` · ⚡️ `perf` · 🔧 `chore` · 👷 `ci` · 📦 `build` · ⏪ `revert`

**Breaking changes**: add `!` after the scope, or a `BREAKING CHANGE:` footer.

### Types

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

### Scopes

| Scope | Description |
| ----- | ----------- |
| `ic-suite` | In-house code measurement and validation toolchains (Callidescope, Codependix, Codometer, Conformetry) and their shared conventions |
| `affirmancy` | Python Jupyter notebook application for LangGraph affirmation generation |
| `caelundas` | Node.js CLI for astronomical calendar generation (NASA JPL ephemeris) |
| `configuration` | Workspace root config files (tsconfig, eslint, vitest, nx.json, etc.) |
| `conformetry` | Code generator templates and validation tests for generated instances |
| `persistence` | Shared Postgres package: environment, TypeORM module, base entities, test harness, and migrations |
| `interface` | Shared GraphQL package: Relay connection helpers, entity-to-object types, client code generation, and test helpers |
| `dependencies` | Dependency version changes (upgrades, additions, removals via pnpm) |
| `deployments` | GitHub Actions workflows and CI/CD pipeline configuration |
| `documentation` | Markdown docs, skills, planning files, and AGENTS.md files |
| `infrastructure` | Helm charts, Terraform configs, and Kubernetes resources |
| `installation` | Developer-machine setup commands that run once Node is installed (environment files, dependencies, shell configuration, software) |
| `integration` | Continuous Integration plumbing: the steps that run around a CI job, such as the affected run and the Nx task-cache database |
| `JimmyPaolini` | Static GitHub profile README project (markdown and assets) |
| `lexico` | TanStack Start SSR Latin dictionary web app |
| `presentation` | Shared React/shadcn component library |
| `lexico-entities` | Shared TypeORM entities and GraphQL types |
| `lexico-cli` | Data ingestion scripts for Lexico |
| `meanderaw` | Greek meander (key/fret) SVG generator CLI and the composable motif/modifier library it reads |
| `sempientor` | Lexical gap discovery CLI that surveys English for morphological, phonotactic, and semantic gaps and coins words to fill them |
| `callidescope` | Call stack tracing and linting CLI, the configuration package it reads, and the packages that build and render its call graph |
| `codependix` | Dependency graph export CLI, the configuration package it reads, and the package that judges the graphs against declared rules |
| `codometer` | Code statistics measurement CLI, the configuration package it reads, and the packages that diff and render its pull request change report |
| `no-release` | Escape hatch: suppress semantic-release for any commit type |
| `publication` | Publication CLI: the CI release steps and the publishable-packages gate |
| `release` | Version bumps and release commits generated by semantic-release |
| `reporting` | Pull request change report generation and the packages that diff and render it |
| `scripts` | Shell and TypeScript scripts in scripts/ (sync, setup, utilities) |
| `testing` | Vitest configuration, shared test utilities, and coverage setup |
| `synchronization` | Synchronization application and commands for automating workflows |
| `validation` | Validation CLI and the checks it runs, such as pull request metadata |

If a change genuinely spans scopes, list them comma-separated (`feat(lexico,logger): ...`) rather than reaching for an umbrella scope. Better still, keep one project or module per pull request — see [Release Significance](#release-significance) for why.

### Release Significance

This repository squash-merges using the pull request title, so **the title is the only thing semantic-release ever sees**. Every individual commit on the branch is discarded at squash time.

The `pull-request-release-significance` check reads the branch's commits and fails the pull request when the title's type is **less** release-significant than the most significant commit on the branch, or when the title shares no scope overlap with a commit.

**Practical effect:** pick the type and scope for the branch as a whole before you start committing, and keep every commit at or below that significance.

- A `feat` commit on a branch titled `chore` or `ci` fails the check — either retitle the pull request as `feat`, or move that commit to its own branch.
- Mixing `feat` and `fix` work is fine; title it `feat`, since `feat` outranks `fix`. Mixing only breaks when a later commit is _more_ significant than the type already chosen.

This is also why one project or module per pull request is the rule: the fewer concerns a branch carries, the less likely it accumulates a commit that outranks its title.

## Git Hooks (Husky)

<!-- openwiki: broken internal link [../../configuration/.husky] file "../../configuration/.husky" does not exist. Fix the href or restore the target, then delete this comment. -->
Three Husky hooks enforce quality gates locally, from [`configuration/.husky/`](../../configuration/.husky). **Never bypass them with `--no-verify`** — fix the underlying issue instead.

| Hook | Trigger | What it runs | Config |
|------|---------|--------------|--------|
| `pre-commit` | `git commit` | Commit signing configuration check, then **lint-staged**: format, lint, typecheck, spelling, and more on staged files | [`lint-staged.config.ts`](../../configuration/lint-staged.config.ts) |
| `commit-msg` | `git commit` | **commitlint**: validates the Conventional Commits format | [`commitlint.config.ts`](../../configuration/commitlint.config.ts) |
| `pre-push` | `git push` | **validate-branch-name**, then a commit signature check over the pushed commits | [`validate-branch-name.config.cjs`](../../validate-branch-name.config.cjs) |

If a hook fails, the git operation is blocked until you fix the error. `pre-commit` writes its full output to `last-lint-staged-output.log`, which is where to look when the terminal output is truncated.

## Working in a Git Worktree

Worktrees are the normal way to run several branches side by side here, and three traps are specific to this repository.

- **`pnpm-lock.yaml` goes dirty on its own.** `pnpm install` or `lint-code --write` rewrites the `projects/JimmyPaolini` entry, because a placeholder `package.json` is inconsistently present across checkouts. Revert the lockfile rather than trying to reconcile it.
- **Never run `git submodule update --init` for `projects/JimmyPaolini`.** That submodule is deliberately left uninitialized everywhere, locally and in CI. A `-` prefix in `git submodule status` is expected here, not broken.
- **The stash stack is shared with every other worktree.** A bare `git stash pop` can take someone else's work. Prefer a temporary commit, or `git stash push -u -m "<unique-tag>"` and `git stash apply <sha>`.

The branch name is not free-form in a worktree either — derive one from the tables above and validate it before creating anything, since an unvalidated branch cannot be pushed. If the branch already exists locally, attach a worktree to it rather than creating a second branch. See [using-git-worktrees](../../.agents/skills/using-git-worktrees/SKILL.md).

## Validation Gates (CI Workflows)

Six workflows run on every pull request:

| Workflow | Runs | Local Equivalent |
|----------|------|------------------|
| 🧑‍🔧 Lint Codebase | Format, lint, typecheck, type coverage, spelling, markdown, YAML, dead code, conformance, synchronization | `nx affected --target=lint-code` |
| 🧑‍🔬 Test Coverage | Unit, integration, e2e tests with coverage thresholds | `nx affected --target=test-code` |
| 🕵️ Secure Code | Secrets, Python AST, dependency vulnerabilities, licenses, infrastructure misconfiguration | `nx affected --target=secure-code` |
| 👷 Make Projects | Builds every buildable project, gates bundle size | `nx affected --target=build-projects` |
| 🧑‍⚖️ Comply Code | Branch name, PR title, body, labels, assignees, release significance | See Pull Request Process |
| 👮 Enforce Code | CODEOWNERS rules and workflow security | `validation/src/validation.main.ts audit-governance` |

## IC-Suite Toolchains

Four in-house toolchains measure this workspace and gate what they measure:

| Toolchain | What It Does | What Fails a PR |
|-----------|--------------|-----------------|
| `conformetry` | Scaffolds from templates, measures generated instances against templates | `conformetry-validate` inside `guard-code` (💂 Guard) |
| `codometer` | Measures directory against declared limits (size, counts, comments) | Project's `codometer` target inside Make Projects |
| `codependix` | Exports import graphs, judges against boundary rules | Per-project `codependix-gate` inside `guard-code` (💂 Guard) |
| `callidescope` | Traces call stacks, flags too-deep/too-wide stacks | Per-project `callidescope-gate` inside `guard-code` (💂 Guard) |

**Generate rather than hand-craft** — code written in a shape a template already describes starts life failing conformance. Use `nx g conformetry:<generator>`.

## Skills Reference by Step

| Step | Primary Skill | Supporting Skills |
|------|---------------|-------------------|
| 1. Clarify | `brainstorming` | `grill-with-docs`, `grill-me`, `grilling`, `ask-matt` |
| 2. Specify | `to-spec` | — |
| 3. Decompose | `to-tickets` | `wayfinder` (if work exceeds one session) |
| 4. Handoff | `handoff` | — |
| 5. Build | `implement` | `test-driven-development`, `tdd`, `ponytail`, `systematic-debugging`, `diagnosing-bugs`, `subagent-driven-development`, `dispatching-parallel-agents`, `gh-stack`, `using-git-worktrees` |
| 6. Review | `requesting-code-review` | `code-review`, `ponytail-review`, `receiving-code-review` |
| 7. Validate | `validate-code` | `verification-before-completion`, `triage-integration` |
| 8. Integrate | `finishing-a-development-branch` | `submit-changes`, `commit-code`, `create-pull-request` |

## Related Pages

- [Local Development](../operations/local-development.md) — Setup, commands, tooling
- [CI/CD Pipeline](../workflows/ci-cd.md) — GitHub Actions workflows and gates
- [Code Quality](../workflows/code-quality.md) — Linting, formatting, type coverage, size limits
- [Release Process](../workflows/release.md) — Semantic release, versioning, publishing
- [Scaffolding](../workflows/scaffolding.md) — Conformetry generators and templates
