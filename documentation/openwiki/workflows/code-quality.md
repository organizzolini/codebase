---
type: workflow
title: Code Quality Gates
description: Documents the four IC-Suite quality gates (callidescope depth/breadth, codependix boundaries, codometer limits, conformetry conformance) and their integration into CI via Nx targets.
tags: [ic-suite, quality-gates, nx, ci, callidescope, codependix, codometer, conformetry]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-cb3df90b3af3b7ee2f16c98e
    resource: repo://.agents/skills/triage-integration/SKILL.md
  - id: openwiki-source-dbd25ad441b2f5c4f5cd1ba8
    resource: repo://.agents/skills/validate-code/SKILL.md
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-3813a8d6b5fb514dbe957652
    resource: repo://configuration/codependix.config.ts
  - id: openwiki-source-90b02c1b2d7e834e85fa1f3a
    resource: repo://configuration/codometer.config.ts
  - id: openwiki-source-495621117b1d7a0a282d1a02
    resource: repo://configuration/lint-staged.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-52f2bb7d9c7d2fad35c7c856
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/README.md
  - id: openwiki-source-51e03273bac4336f316a0939
    resource: repo://projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/executor.ts
  - id: openwiki-source-3a9a91a5f64207a13d1e2208
    resource: repo://projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.constants.ts
  - id: openwiki-source-bc8f29fb181c173738ef9e79
    resource: repo://projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts
  - id: openwiki-source-353594b808056ff8dd3dbc28
    resource: repo://projects/ic-suite/codependix/codependix-cli/README.md
  - id: openwiki-source-85da15e0167ebbba2176a63f
    resource: repo://projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts
  - id: openwiki-source-9b4779d4466d7946f7bbe7ad
    resource: repo://projects/ic-suite/codependix/codependix-nx/src/index.ts
  - id: openwiki-source-b593e5d7e490983f5d4f1d20
    resource: repo://projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.constants.ts
  - id: openwiki-source-4afd9d23488d0275aa688221
    resource: repo://projects/ic-suite/codometer/codometer-cli/README.md
  - id: openwiki-source-15595f87d2b72a10e2cbba47
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/README.md
  - id: openwiki-source-41d402c4941aa1275a7eec3b
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/src/executors/validate/executor.ts
  - id: openwiki-source-a4bfc8509bbcb70fdbb31e1c
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/src/index.ts
  - id: openwiki-source-7e59c3975b6db494b3e4650b
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.constants.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Code Quality Gates

This workspace enforces four in-house toolchains that measure the codebase and gate what they measure. Each toolchain has its own **gating word** — the metric it decides — and is integrated into the Nx task graph so CI fails when a gate is breached.

| Toolchain | Gating Word | What It Gates | Nx Target(s) |
|-----------|-------------|---------------|--------------|
| **callidescope** | `depth` / `breadth` | Call-stack depth and breadth | `callidescope-trace`, `callidescope-depth`, `callidescope-breadth`, `callidescope-gate` |
| **codependix** | `boundaries` | Dependency-graph boundary rules | `codependix-gate` |
| **codometer** | `limits` | File sizes, symbol counts, comment-block length | `codometer` (configurations: `check`, `write`) |
| **conformetry** | `threshold` | Generated code conformance to templates | `conformetry-validate` |

---

## Comparison Table — Per-Tool Gate Summary

| Tool | What It Measures | CLI Flag for Gate | Breach vs Staleness | Where It Runs (CI/Local) | Config Location |
|------|------------------|-------------------|---------------------|---------------------------|-----------------|
| **callidescope** | Call-stack depth & breadth across project + Nx deps | `--check depth,breadth` (breach)<br>`--check reports` (staleness) | **Breach** = `--check depth,breadth` (branch gate)<br>**Staleness** = `--check reports` (default branch only) | CI: `nx affected -t callidescope-gate`<br>Local: same via `lint-staged` → `guard-code` | Project: `callidescope.config.ts`<br>Workspace: `configuration/callidescope.config.ts` |
| **codependix** | Dependency boundaries (file imports, NestJS modules, Nx projects) | `--check boundaries` (breach)<br>`--check reports` (staleness) | **Breach** = `--check boundaries` (branch gate)<br>**Staleness** = `--check reports` (default branch only) | CI: `nx affected -t codependix-gate`<br>Local: same via `lint-staged` → `guard-code` | Project: `codependix.config.ts`<br>Workspace: `configuration/codependix.config.ts` |
| **codometer** | File size, symbol counts, comment-block words (runs on compiled output) | `--check limits` (breach)<br>`--check reports` (staleness) | **Breach** = `--check limits` (branch gate, via `build-projects`)<br>**Staleness** = `--check reports` (default branch only, via `configuration:codometer:write`) | CI: `nx affected -t build-projects` (includes `codometer:check`)<br>Local: `nx run <project>:codometer:check` | Project: `codometer.config.ts`<br>Workspace: `configuration/codometer.config.ts` |
| **conformetry** | Template conformance score (structural AST comparison) | `--threshold` (breach, defaults to 1.0 = perfect) | **Breach only** = score < `threshold` (branch gate)<br>No staleness concept — generated code is either conformant or not | CI: `nx affected -t conformetry-validate`<br>Local: same via `lint-staged` → `guard-code` | Workspace: `configuration/conformetry.config.ts`<br>Per-project inferred via plugin |

---

## The Two-Gate Pattern: Breach Gates vs Staleness Gates

**All four tools share the same gate topology:**

| Gate Kind | CLI Name | Runs On | Purpose |
|-----------|----------|---------|---------|
| **Breach gate** | `depth`, `breadth`, `boundaries`, `limits` | **Every branch** (PR, push) | A violation is caused by the branch and fixed by the branch. |
| **Staleness gate** | `reports` | **Default branch only** (release) | A report goes stale whenever the codebase moves anywhere; gating it on a branch would fail every branch that touched the graph. Published on `main` during release. |

**Key implications:**

- `--check depth,breadth,limits,boundaries` — **never writes**, only reads and fails. Leaves committed reports untouched.
- `--check reports` — **never reads** on a branch; only runs on `main` where the workspace-wide `write` target publishes fresh reports.
- `--write --check reports` is **refused** by all tools: a report cannot be stale in the run that just wrote it.
- The Nx aggregator `guard-code` depends on `callidescope-gate`, `codependix-gate`, `conformetry-validate` — **all breach gates**. It has no `write` configuration for these.
- `codometer:check` (breach) runs in `build-projects` on every build; `codometer:write` (staleness) runs on `main` during release via `configuration:codometer`.

---

## Callidescope — Call-Stack Depth & Breadth

**Purpose**: Measure and gate the call stacks of TypeScript projects. Every project with a `tsconfig.json` (unless excluded by `.callidescopeignore`) receives four inferred Nx targets.

### Inferred Targets

| Target | Executor | Description |
|--------|----------|-------------|
| `callidescope-trace` | `@callidescope/nx:trace` | Print every call stack above and below each callable in the project and its Nx dependencies. |
| `callidescope-depth` | `@callidescope/nx:depth` | Print every call stack above and below a single callable. |
| `callidescope-breadth` | `@callidescope/nx:breadth` | Print one callable's direct callers and callees. |
| `callidescope-gate` | `@callidescope/nx:gate` | **Fail** if any traced call stack exceeds the project's declared `maximumDepth` or `maximumBreadth`. This is the gate CI reads. |

### Configuration

Each traced project provides its own `callidescope.config.ts` spreading `projectDefaults` from `configuration/callidescope.config.ts` and declaring explicit `limits`:

```ts
import { projectDefaults } from "../../../configuration/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: { maximumBreadth: 8, maximumDepth: 6 },
};
```

The workspace-level `workspaceLimits` (depth 17, breadth 2) serves only as a starting point for new projects; every existing traced project declares its own boundary-tested numbers. A project declaring a higher number keeps it — nothing clamps it down.

### Gate Semantics

- The gate runs over the project **and its Nx dependencies** (the trace follows the dependency graph).
- Only findings **charged to the project itself** fail its gate. A breach in a dependency fails that dependency's own gate.
- `nx affected -t callidescope-gate` scopes the gate to changed projects, so CI only runs what matters.
- A project with no traced files (empty scope) **fails** rather than passes — a green gate without a trace would be misleading.

---

## Codependix — Dependency-Graph Boundaries

**Purpose**: Enforce architectural layering and cross-package import rules across three graph levels: file imports, NestJS modules, and Nx projects.

### Inferred Target

| Target | Executor | Description |
|--------|----------|-------------|
| `codependix-gate` | `@codependix/nx:gate` | **Fail** if any boundary rule is broken in the graphs built over the project and its dependencies. Only findings charged to the project itself cause a failure. |

### Boundary Rules

Rules are defined in `configuration/codependix.config.ts` under `boundaries`. They are ANDed: every rule must pass. Two layers of rules exist:

1. **Generic `layer:*` rules** — apply to all four toolchains: a layer may reach its own layer and every layer beneath it.
2. **Per-package `name:*` rules** — tighten the generic rules, catching mis-tagged packages and cross-toolchain edges (`layer:*` cannot express `suite:*` tags).

Rules are verified to hold across all projects before being written; a red rule on arrival is a backlog item, not a gate.

### Gate Semantics

- Graphs are built over the project **and everything it depends on**.
- `nx affected -t codependix-gate` scopes to changed projects.
- The workspace-wide `configuration:codependix` target is **write-only** (regenerates README graphs on the default branch during release) and is not reachable from `guard-code`.

---

## Codometer — Size, Count, and Comment Budgets

**Purpose**: Measure file sizes, symbol counts, and comment-block word counts; gate declared limits.

### Nx Target

| Target | Configuration | Command |
|--------|---------------|---------|
| `codometer` | `check` (default) | `measure --config codometer.config.ts --output-json --check limits` |
| `codometer` | `write` | `measure --config codometer.config.ts --output-json --output-markdown README.md` |

The target is defined in `nx.json` under `targetDefaults.codometer` with multiple overrides for different project depths (root, `projects/*`, `projects/<domain>/*`, `projects/ic-suite/*/*`). Each runs from the project root (`cwd: "{projectRoot}"`) so `--config codometer.config.ts` resolves the project's own file and limits address paths like `Compiled JavaScript.size`.

### Enforced Limits

- **Max 512 lines per file** — enforced by codometer limits on file-size metrics.
- **Max 128 words per comment block** — enforced by comment-budget counters (`comment: { language, maximumWords: 128 }`) with a `value: 0` limit on each budget's `custom.<label>` metric. Shell scripts get 256 words.
- Every project declares its own `codometer.config.ts` spreading the shared `codometerConfiguration` from `configuration/codometer.config.ts`, which defines the counters and the zero-tolerance limits.

### Gate Semantics

- `codometer:check` writes the JSON report (`codometer-report.json`) then fails if any declared limit is exceeded.
- `codometer:write` updates the project's README badges and the JSON report; it runs on the default branch during release.
- `build-projects` depends on `build` and `codometer`, so a build that exceeds size limits fails before packaging.
- **Suppression comments are forbidden** — `// eslint-disable`, `@ts-ignore`, and similar escapes are not permitted. Fix the root cause instead (split files, refactor, rewrite comments).

---

## Conformetry — Template Conformance

**Purpose**: Validate that generated code matches its declared template. Every project holding at least one conformetry instance receives an inferred target.

### Inferred Target

| Target | Executor | Description |
|--------|----------|-------------|
| `conformetry-validate` | `@conformetry/nx:validate` | Validate the project's instances against their templates. Fails if generated output diverges beyond the configured `threshold`. |

### Configuration

The workspace configuration lives at `configuration/conformetry.config.ts`. It defines generator groups (e.g., `jupyter-notebook-application`, `nestjs-cli-application`) with their templates and instance patterns. Each project's instances are listed in the configuration; the plugin infers `conformetry-validate` onto projects that have instances.

### Gate Semantics

- `nx affected -t conformetry-validate` scopes validation to changed projects.
- The `threshold` option controls how much divergence is tolerated before failing (default: `1.0` = perfect match).
- Generated code (e.g., shadcn UI components) is excluded via pattern lists (`SHADCN_GENERATED_PATTERNS`) because editing vendored CLI output would be overwritten on the next `shadcn add`.

---

## Size Limits (Cross-Toolchain)

The workspace enforces two hard size limits, measured and gated by **codometer**:

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Lines per file | **512** | File-size metrics in `codometer.config.ts` custom statistics |
| Words per comment block | **128** (256 for shell) | Comment-budget counters with `maximumWords` and zero-tolerance limits |

**Suppression comments are forbidden** — `// eslint-disable`, `@ts-ignore`, and similar escapes are not permitted. Fix the root cause instead (split files, refactor, rewrite comments).

---

## Integration Into CI

### The `guard-code` Aggregator

Defined in `nx.json` under `targetDefaults.guard-code`, this `nx:noop` target depends on the per-project gates:

```json
"guard-code": {
  "dependsOn": [
    "callidescope-gate",
    "codependix-gate",
    "conformetry-validate",
    "catalog-manifests",
    "lockfile",
    "project-ports",
    "readme-projects",
    "vscode-extensions"
  ],
  "executor": "nx:noop"
}
```

Running `nx run <project>:guard-code` (or `nx affected -t guard-code`) executes all four IC-Suite gates for the affected projects. Neither `callidescope-gate` nor `codependix-gate` has configurations, so the configuration passed to `guard-code` falls through to their defaults.

### The `build-projects` Aggregator

```json
"build-projects": {
  "dependsOn": ["build", "codometer"],
  "executor": "nx:noop"
}
```

Every build is measured by codometer; a size-limit breach fails the build.

### Pre-Commit Hooks

`lint-staged` (configured in `configuration/lint-staged.config.ts`) runs on every staged file:

```bash
nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --parallel=4 --base=HEAD --head=<staged-commit>
```

This runs the full quality suite including `guard-code` (hence all four IC-Suite gates) before commit.

### CI Workflow

GitHub Actions (`.github/workflows/continuous-integration.yml`) runs the same `nx affected` command on pull requests. The `validate-code` skill documents the full local validation workflow:

1. **Auto-fix** — `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main`
2. **Verify** — `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main`
3. **Coverage gate** (when required) — `nx run <project>:vitest --configuration=coverage`
4. **Type coverage gate** (when required) — `nx run <project>:type-coverage` (must also pass `typecheck`)

All checks must pass before proceeding. Failures are triaged with the `triage-integration` skill, which provides per-tool fix instructions.

---

## Local Validation Command

**Canonical pre-commit verification** (from `validate-code` skill and `lint-staged`):

```bash
# Step 1: Auto-fix everything that can be fixed
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main

# Step 2: Verify nothing remains
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main
```

> For new/untracked files that `nx affected` won't detect, target the relevant project(s) directly:
> ```bash
> pnpm exec nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
> ```

**Never bypass git hooks** with `--no-verify` — fix the underlying issue instead.

---

## Type Coverage Rule

When a TypeScript project defines a `type-coverage` target, **both** `typecheck` **and** `type-coverage` must pass:

```bash
pnpm exec nx run <project>:typecheck
pnpm exec nx run <project>:type-coverage
```

Run them back-to-back while stabilizing changes to avoid late iteration loops.

---

## Validation Workflow Summary

| Skill | Purpose |
|-------|---------|
| `validate-code` | Run the full automated quality suite (lint, typecheck, format, deprecate, guard) before committing. |
| `triage-integration` | Diagnose failing integration checks (local hooks or CI), map errors to root causes, apply targeted fixes. |

**Never bypass git hooks** with `--no-verify` — fix the underlying issue instead. The `validate-code` skill is the canonical pre-commit verification step; `triage-integration` is the canonical diagnostic step when something goes red.
