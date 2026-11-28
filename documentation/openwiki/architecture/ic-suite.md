---
type: "Reference"
title: "IC Suite Toolchains"
description: "Documents the five independently versioned IC-Suite toolchains (callidescope, codependix, codometer, coinagerie, conformetry) following the five-layer spine architecture. Covers package structure, CLI usage, Nx targets, CI gate flow, and integration patterns."
tags: ["architecture", "ic-suite", "toolchains", "nx", "ci"]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-27T18:15:08.471Z
sources:
  - id: openwiki-source-105f2705156f283beb3d513c
    resource: repo://.github/workflows/continuous-deployment.yml
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-a6afdf06930846474873c4aa
    resource: repo://configuration/ic-suite/callidescope.config.ts
  - id: openwiki-source-d7ee8504ef5ff061b38f1613
    resource: repo://configuration/ic-suite/codependix.config.ts
  - id: openwiki-source-50b667bfcf0ee4b4daed851d
    resource: repo://configuration/ic-suite/codometer.config.ts
  - id: openwiki-source-6419221f89e7a55a996f3dab
    resource: repo://configuration/ic-suite/conformetry.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-f45834e39c42c6991e4c7485
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts
  - id: openwiki-source-bd726a7a7e4dc7e3b9adfed4
    resource: repo://projects/ic-suite/callidescope/callidescope-configuration/src/index.ts
  - id: openwiki-source-e9854bb4c2ae227c0cf44227
    resource: repo://projects/ic-suite/callidescope/callidescope-core/src/index.ts
  - id: openwiki-source-e9f0def2c1883fe601b7af44
    resource: repo://projects/ic-suite/callidescope/callidescope-graph/src/index.ts
  - id: openwiki-source-c1f8f704f0e4826d1b7980ec
    resource: repo://projects/ic-suite/callidescope/callidescope-nx/project.json
  - id: openwiki-source-3a9a91a5f64207a13d1e2208
    resource: repo://projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.constants.ts
  - id: openwiki-source-b0f4b82129506808ee6679a5
    resource: repo://projects/ic-suite/callidescope/callidescope-output/src/index.ts
  - id: openwiki-source-52ec00392373de2385106b9d
    resource: repo://projects/ic-suite/codependix/codependix-boundaries/src/index.ts
  - id: openwiki-source-7888f6ea89a05e862cf0cc3b
    resource: repo://projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts
  - id: openwiki-source-f087af2acf403009fbceed5c
    resource: repo://projects/ic-suite/codependix/codependix-core/src/index.ts
  - id: openwiki-source-3ca00872c3d01e4059aacc64
    resource: repo://projects/ic-suite/codependix/codependix-file-imports/project.json
  - id: openwiki-source-012fbe8366b7e02d3ec54e38
    resource: repo://projects/ic-suite/codependix/codependix-nestjs-modules/project.json
  - id: openwiki-source-73b5019f53dca90164d26822
    resource: repo://projects/ic-suite/codependix/codependix-nx-projects/project.json
  - id: openwiki-source-59d3751dd8e6e4492491900b
    resource: repo://projects/ic-suite/codependix/codependix-nx/project.json
  - id: openwiki-source-d0a636aedee2b4cb64837599
    resource: repo://projects/ic-suite/codometer/codometer-agents/package.json
  - id: openwiki-source-b2ac8b68d3252c13108556d1
    resource: repo://projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts
  - id: openwiki-source-270388a94b4ee6cbdcef79a0
    resource: repo://projects/ic-suite/codometer/codometer-configuration/src/index.ts
  - id: openwiki-source-c840e090aaf31d9588225b28
    resource: repo://projects/ic-suite/codometer/codometer-languages/project.json
  - id: openwiki-source-a7168da9dd9e35405dea1554
    resource: repo://projects/ic-suite/codometer/codometer-measurement/project.json
  - id: openwiki-source-03219b76704d24994321965e
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/README.md
  - id: openwiki-source-30d75b38e319b302ec825e0e
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/project.json
  - id: openwiki-source-570f4b453a6a63a61dce6558
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/project.json
  - id: openwiki-source-1670ae66cc1e701c73f30206
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/src/modules/generate/generate.command.ts
  - id: openwiki-source-e765f25b516b999424539342
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/src/modules/validate/validate.command.ts
  - id: openwiki-source-30ea5f8cd0a73ded8c23221f
    resource: repo://projects/ic-suite/conformetry/conformetry-output/src/index.ts
generated: { by: "openwiki/0.9.0", at: "2026-11-27T18:15:08.471Z" }
---

# IC Suite Toolchains

The **IC-Suite** is a family of five independently versioned, command-line toolchains published from this workspace: **callidescope**, **codependix**, **codometer**, **coinagerie**, and **conformetry**. Each suite is a product, not a directory — its packages version independently but are documented and discovered as one thing, named for the command a user runs (`callidescope`, `codependix`, `codometer`, `coinagerie`, `conformetry`).

All five suites share the same five-layer architectural spine, each layer depending only downward:

```
core → configuration → analysis → output → cli
                                     ↑
                                     └─ nx (optional plugin layer, tagged layer:cli)
```

This convergence was deliberately landed as vocabulary first (ADR 0013), with `layer:*` tags applied in follow-up pull requests per toolchain.

## Five-Layer Spine

| Layer | Tag | Holds | Never holds |
|-------|-----|-------|-------------|
| **core** | `layer:core` | Domain vocabulary only: result and finding types, error classes, shared enums and unions, analyzer and validator contracts | Services, modules, anything executable |
| **configuration** | `layer:configuration` | The config file's schema, loading, defaults, and override resolution, **plus CLI flag resolution**, producing one resolved configuration object | Domain result types |
| **analysis** | `layer:analysis` | What the tool actually does. Per-suite names and per-suite shape | Rendering, command wiring |
| **output** | `layer:output` | Every render target: JSON, markdown, mermaid, anchor blocks, destination routing, delivery | Analysis |
| **cli** | `layer:cli` | `*.command.ts` modules that wire the toolchain together | Analysis, rendering, or configuration logic |

### The `nx` plugin layer

Where a suite provides an Nx plugin (`@callidescope/nx`, `@codependix/nx`, `@coinagerie/nx`, `@conformetry/nx`), it sits **above `cli`** and carries `layer:cli` — not a sixth tag. This keeps the spine at five layers and the generic boundary rules at four. The `nx` plugin is a second host for the same underlying toolchain, not a new layer stacked above it.

### Core-versus-configuration test

The sharp test that decides where a type belongs:

> **If it describes what the tool produced, it is `core`; if it describes what the user wrote in `<tool>.config.ts`, it is `configuration`.**

Under this test `CodeStatisticsResult` belongs in `core` and `WriteMarkdownOutput` stays in `configuration` — despite reading like an output-layer type, it names a destination the user declared in the config file, which is what the test scores rather than the name. A `core` package that exports a live service, or a `configuration` package that exports a result type the tool produced rather than a value the user configured, has drifted out of its layer regardless of which package it physically sits in.

### Analysis layer does not converge on a name

Every other layer converges on one name across all five toolchains. The **analysis layer deliberately does not**: forcing it to would produce a sixty-file blob in codometer's case, where "analysis" would have to cover language measurement, size measurement, and everything else the tool does in one package. It stays named for what it analyzes — governed by a rule instead of a shared noun:

> **One package per independently usable analyzer, named for what it analyzes.**

| Suite | Analysis packages (`layer:analysis`) |
|-------|--------------------------------------|
| callidescope | `callidescope-graph` |
| codependix | `codependix-boundaries`, `codependix-file-imports`, `codependix-nestjs-modules`, `codependix-nx-projects` |
| codometer | `codometer-languages`, `codometer-measurement` |
| coinagerie | `coinagerie-languages`, `coinagerie-vocabulary` |
| conformetry | `conformetry-generation`, `conformetry-languages`, `conformetry-validation` |

## Per-Suite Package Structure

### callidescope — Call stack tracing toolchain

Traces control flow through injected dependencies and reports where a stack got too deep.

| Package | Layer | Publishes | Purpose |
|---------|-------|-----------|---------|
| `@callidescope/core` | `core` | ✅ | Domain vocabulary: call graph, stack, frame, finding types |
| `@callidescope/configuration` | `configuration` | ✅ | Reads `callidescope.config.ts`, resolves CLI flags, depth/breadth limits |
| `@callidescope/graph` | `analysis` | ✅ | Builds call graph from TypeScript AST, measures depth/breadth |
| `@callidescope/output` | `output` | ✅ | Renders findings to markdown, mermaid, JSON |
| `@callidescope/cli` | `cli` | ✅ | `nest-commander` host, wires graph → output, gates depth |
| `@callidescope/nx` | `cli` (nx plugin) | ✅ | Nx plugin inferring per-project `trace`, `depth`, `breadth`, `restrict` targets |
| `@callidescope/agents` | *(none)* | ❌ | Agent skills, travel via `skills-lock.json` |
| `@callidescope/examples` | *(none)* | ❌ | Fixture codebase with worked examples per rule/finding/output |

### codependix — Dependency graph export and boundary gating

Reads what each project depends on, renders graphs as JSON/Markdown/mermaid, gates rules those graphs are judged against.

| Package | Layer | Publishes | Purpose |
|---------|-------|-----------|---------|
| `@codependix/core` | `core` | ✅ | Graph models, boundary rule definitions, traversal contracts |
| `@codependix/configuration` | `configuration` | ✅ | Reads `codependix.config.ts`, resolves CLI, produces run config |
| `@codependix/file-imports` | `analysis` | ✅ | TypeScript/JS file-level import graph extraction |
| `@codependix/nestjs-modules` | `analysis` | ✅ | NestJS container module graph exploration |
| `@codependix/nx-projects` | `analysis` | ✅ | Reads Nx project graph, builds one-hop neighborhood |
| `@codependix/boundaries` | `analysis` | ✅ | Validates forbid/allow rules, detects cycles across all graph levels |
| `@codependix/output` | `output` | ✅ | Renders graphs as JSON, Markdown, mermaid, splices anchor blocks |
| `@codependix/cli` | `cli` | ✅ | Host exporting graphs and gating boundaries |
| `@codependix/nx` | `cli` (nx plugin) | ✅ | Nx plugin inferring per-project `codependix-bound` target |
| `@codependix/agents` | *(none)* | ❌ | Agent skills, travel via `skills-lock.json` |
| `@codependix/examples` | *(none)* | ❌ | 21 subjects built to be graphed, each carrying rendered guide |

> **Note on `codependix-nx-projects`**: It keeps its name even though it collides with the `nx` plugin layer. It is an **analysis-layer** graph builder that *reads* the Nx project graph, not a plugin registered in `nx.json`. This is a documented, deliberate exception (ADR 0013).

### codometer — Repository measurement toolchain

Counts a codebase and reports what it found against configured limits.

| Package | Layer | Publishes | Purpose |
|---------|-------|-----------|---------|
| `@codometer/core` | `core` | ✅ | Statistics and report vocabulary, measurement errors |
| `@codometer/configuration` | `configuration` | ✅ | Reads `codometer.config.ts`, exclusion globs, output destinations, limits |
| `@codometer/languages` | `analysis` | ✅ | Language parsers (TS, JS, Python, JSON, MD, Jupyter) behind one `analyze()` |
| `@codometer/measurement` | `analysis` | ✅ | File discovery, size calculation, custom metric evaluation, limit enforcement |
| `@codometer/output` | `output` | ✅ | JSON reports, README badges, PR change reports, destination routing |
| `@codometer/cli` | `cli` | ✅ | Host measuring files, writing badge block/JSON report |
| `@codometer/agents` | *(none)* | ❌ | Agent skills, travel via `skills-lock.json` |
| `@codometer/examples` | *(none)* | ❌ | Sample corpus with known contents, runnable example per feature |

### conformetry — Template-driven generation and conformance validation

Scaffolds files from templates and validates implementations against them.

| Package | Layer | Publishes | Purpose |
|---------|-------|-----------|---------|
| `@conformetry/core` | `core` | ✅ | Difference, score, inventory, language validator types — no executable code |
| `@conformetry/configuration` | `configuration` | ✅ | Config loading, template/instance discovery, generator input resolution |
| `@conformetry/generation` | `analysis` | ✅ | Scaffold file generation, rendering templates through configuration |
| `@conformetry/languages` | `analysis` | ✅ | Multi-language file comparison, syntax validators, difference/scoring primitives |
| `@conformetry/validation` | `analysis` | ✅ | Validation orchestration, language routing, finding deduplication |
| `@conformetry/output` | `output` | ✅ | Validation report, template/instance inventory rendering |
| `@conformetry/cli` | `cli` | ✅ | Host expanding globs, prompting inputs, running generation/validation |
| `@conformetry/nx` | `cli` (nx plugin) | ✅ | Nx plugin with generators, executors, emitted-plugin bootstrap |
| `@conformetry/agents` | *(none)* | ❌ | Agent skills, travel via `skills-lock.json` |
| `@conformetry/examples` | *(none)* | ❌ | 11 runnable examples with config, templates, instances, guides (CI-executed) |

### coinagerie — Vocabulary toolchain

Lists every word the codebase uses (identifiers, object keys, enum members, folder and file names, split into lowercase words) and keeps a markdown glossary of them in step with the code.

| Package | Layer | Publishes | Purpose |
|---------|-------|-----------|---------|
| `@coinagerie/core` | `core` | ✅ | Domain vocabulary: words, glossary and finding types |
| `@coinagerie/configuration` | `configuration` | ✅ | Reads `coinagerie.config.ts`: includes, exclusions, folds, glossary destinations |
| `@coinagerie/languages` | `analysis` | ✅ | Per-language word extraction and language keyword lists |
| `@coinagerie/vocabulary` | `analysis` | ✅ | Collects the vocabulary and compares it with the glossaries |
| `@coinagerie/output` | `output` | ✅ | Markdown and JSON glossary destinations |
| `@coinagerie/cli` | `cli` | ✅ | Host: prints, `--check`s or `--write`s the glossary |
| `@coinagerie/nx` | `cli` (nx plugin) | ✅ | Nx plugin inferring the per-project `coinagerie-check` target |
| `@coinagerie/agents` | *(none)* | ❌ | Agent skills, travel via `skills-lock.json` |
| `@coinagerie/examples` | *(none)* | ❌ | Fixture projects with worked examples |

## Publishable vs Non-Publishable Packages

Each suite has **publishable packages** (sent to npm on release) and **non-publishable packages** (never published):

| Category | Packages | Reason |
|----------|----------|--------|
| **Publishable** | All `core`, `configuration`, `analysis`, `output`, `cli`, `nx` packages | Public library contracts and tooling consumers install |
| **Non-publishable** | `*-agents`, `*-examples` | Skills travel through `skills-lock.json`; examples are fixtures, several broken on purpose |

Three gates prevent non-publishable packages from reaching npm:
1. `private: true` in `package.json` (npm refuses to publish)
2. Orchestrator's `release.projects` filter in `nx.json`
3. Registry permissions

A package outside the publishable set is held by the first two, never by only one.

## Independent Versioning with Cascading Dependents

The 36 publishable packages across the five suites version independently using **Nx Release** (`nx release`) with `projectsRelationship: "independent"` (ADR 0017).

- **Conventional commits** determine semver bump specifiers for every package a commit affects.
- **Cascade**: When a dependency package is bumped, Nx Release automatically cascades a **patch version bump** (`updateDependents: "auto"`) and updates manifest dependency constraints across all internal dependents.
- **Per-package git tags and changelogs**: Each package generates an independent tag (`{projectName}@{version}`, e.g., `conformetry-cli@0.1.0`) and maintains its own release notes.
- **Explicit exclusions**: The 10 non-publishable packages (`*-agents`, `*-examples`) are excluded in `nx.json` `release.projects` configuration.

### Two Release Tiers

1. **Repository root release**: Root monorepo uses `semantic-release` on merges to `main` for fixed-version repository releases (e.g., `v2.20.0`). No packages published to npm.
2. **Publishable packages release**: 36 library packages use `nx release` with independent versioning and per-package tags.

## Per-Toolchain Operational Reference

### callidescope — Call-Stack Depth & Breadth

**What it measures**: Call-stack depth (longest chain of nested calls) and breadth (fan-out: number of direct callees per callable) for every traced entry point in a project and its Nx dependencies.

**Configuration file**: `callidescope.config.ts` (per-project, spreading `projectDefaults` from `configuration/ic-suite/callidescope.config.ts`)

```ts
import { projectDefaults } from "../../../configuration/ic-suite/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: { maximumBreadth: 8, maximumDepth: 6 },
};
```

**Workspace defaults**: `configuration/ic-suite/callidescope.config.ts` exports `projectDefaults` (entry-point decorators, exclude patterns, output destinations) and `workspaceLimits` (depth 17, breadth 2) — the latter serves only as a starting point for new projects; every existing traced project declares its own boundary-tested numbers. A project declaring a higher number keeps it — nothing clamps it down.

**CLI command**:
```bash
callidescope --config <path> [--check depth,breadth,reports] [--write] [--format markdown|mermaid|json]
```

| Flag | Purpose |
|------|---------|
| `--check depth` | Fail if any call stack exceeds the project's `maximumDepth` |
| `--check breadth` | Fail if any callable exceeds the project's `maximumBreadth` |
| `--check reports` | Fail if any configured output destination is stale (run on default branch) |
| `--write` | Write reports to configured destinations (README, JSON files) |
| `--format` | What to print to stdout: `markdown` (default), `mermaid`, or `json` |

**Nx targets** (inferred by `@callidescope/nx`):
- `callidescope-trace` — Print every call stack above/below each callable
- `callidescope-depth` — Print stacks for a single callable
- `callidescope-breadth` — Print one callable's direct callers/callees
- `callidescope-restrict` — **Fail** if any traced call stack exceeds the project's declared limits (the gate CI reads; formerly `callidescope-gate`)

**Gate semantics**:
- The gate runs over the project **and its Nx dependencies** (the trace follows the dependency graph).
- Only findings **charged to the project itself** fail its gate. A breach in a dependency fails that dependency's own gate.
- `nx affected -t callidescope-restrict` scopes the gate to changed projects, so CI only runs what matters.
- A project with no traced files (empty scope) **fails** rather than passes — a green gate without a trace would be misleading.

**Findings charged to projects**: Each finding (`DeepStack`, `WideCallable`) carries the project that owns the callable. The gate counts only findings whose `projectName` matches the project under test.

---

### codependix — Dependency-Graph Boundaries

**What it measures**: Three graph levels — file imports (TypeScript/JS), NestJS modules, and Nx projects — and validates forbid/allow rules and cycle detection across all levels.

**Configuration file**: `codependix.config.ts` (workspace-level at `configuration/ic-suite/codependix.config.ts`; per-project configs spread `projectDefaults` for README anchor blocks)

**Boundary rules** (from `configuration/ic-suite/codependix.config.ts`):
- **Generic `layer:*` rules** — Apply to all five toolchains: a layer may reach its own layer and every layer beneath it (e.g., `layer:analysis` → `layer:analysis`, `layer:output`, `layer:cli`).
- **Per-package `name:*` rules** — Tighten generic rules, catching mis-tagged packages and cross-toolchain edges (`layer:*` cannot express `suite:*` tags).
- Rules are ANDed: every rule must pass. Rules are verified to hold across all projects before being written; a red rule on arrival is a backlog item, not a gate.

**CLI command**:
```bash
codependix map --config <path> [--check boundaries,reports] [--write] [--format markdown|json] [--projects <names>] [--tags <tags>]
```

| Flag | Purpose |
|------|---------|
| `--check boundaries` | Fail if any boundary rule is broken (runs on every PR) |
| `--check reports` | Fail if any configured README anchor block is stale (runs on default branch) |
| `--write` | Regenerate all configured graph exports into READMEs |
| `--format` | Output format for stdout |

**Nx target** (inferred by `@codependix/nx`):
- `codependix-bound` — **Fail** if any boundary rule is broken in the graphs built over the project and its dependencies. Only findings charged to the project itself cause a failure.

**Gate semantics**:
- Graphs are built over the project **and everything it depends on**.
- `nx affected -t codependix-bound` scopes to changed projects.
- The workspace-wide `configuration:codependix` target is **write-only** (regenerates README graphs on the default branch during release) and is not reachable from `guard-code`.

**Findings charged to projects**: Each boundary violation (`ForbidViolation`, `AllowViolation`, `Cycle`) carries the project that owns the importing file/module. The gate counts only violations whose `projectName` matches the project under test.

---

### codometer — Size, Count, and Comment Budgets

**What it measures**: File sizes (lines, bytes), symbol counts (functions, classes, methods, static methods), and comment-block word counts per language. Custom counters for project conventions (Module Files, Service Files, Unit Tests, etc.).

**Configuration file**: `codometer.config.ts` (per-project, spreading shared `codometerConfiguration` from `configuration/ic-suite/codometer.config.ts`)

**Shared configuration** (`configuration/ic-suite/codometer.config.ts`):
- **Custom statistics**: File-name patterns (`.module.ts`, `.service.ts`, `.command.ts`, etc.), symbol kinds (`static` methods), and comment budgets per language.
- **Comment budgets**: plain comment blocks are capped at 48 words and 8 lines per language, shell at 48 words and 16 lines, and each JSDoc declaration kind has its own smaller cap (class and file headers get the most).
- **Directory tree limits**: folder breadth is capped at 12 entries and nesting depth at 9.
- **Limits**: Zero-tolerance (`value: 0`) on each comment budget's `custom.<label>` metric — counts blocks exceeding the budget.
- **Outputs**: JSON report (`codometer-report.json`) and Markdown badges in `README.md`.

**CLI command**:
```bash
codometer measure --config <path> [--check limits] [--output-json] [--output-markdown <path>] [--inputs <globs>]
```

| Flag | Purpose |
|------|---------|
| `--check limits` | Fail if any declared limit is exceeded (the gate) |
| `--output-json` | Write JSON report to `codometer-report.json` |
| `--output-markdown <path>` | Write/update badge block in specified file (typically `README.md`) |
| `--inputs <globs>` | Override configured inputs for a one-off run |

**Nx targets** (inferred by `@codometer/nx`):
- `codometer-limit` — Gates comment budgets and directory ceilings (no build required)
- `codometer-weigh` — Gates compiled output size limits (runs after build)

**Enforced limits**:
- **Max 512 lines per file** — enforced by codometer limits on file-size metrics.
- **Max 48 words per plain comment block** (and 8 lines; shell gets 16 lines) — enforced by comment-budget counters with `maximumWords` and zero-tolerance limits.
- **Directory breadth ≤ 12, depth ≤ 9** — enforced by tree statistics with zero-tolerance limits.

**Gate semantics**:
- `codometer-limit` runs first in CI (no build needed), gating comment budgets and directory structure.
- `codometer-weigh` runs in `build-projects` after `build`, gating packaged size limits.
- `build-projects` depends on `build` and `codometer-weigh`, so a build that exceeds size limits fails before packaging.

**Findings charged to projects**: Each limit breach carries the `inputName` (e.g., `codebase`, `Compiled JavaScript`) and the metric path (e.g., `codebase.lines`, `codebase.custom.TypeScript Comment Budget`). The gate evaluates limits per input; a breach in a project's own inputs fails that project's gate.

---

### conformetry — Template Conformance

**What it measures**: Validates that generated code matches its declared template. Computes a similarity score (0–100) per instance against its template, using language-aware comparison (AST for TS/JS/Python, token-based for others).

**Configuration file**: `conformetry.config.ts` (workspace-level at `configuration/ic-suite/conformetry.config.ts`)

**Workspace configuration** defines generator groups (e.g., `jupyter-notebook-application`, `nestjs-command-project`, `nestjs-graphql-application`, `react-component-folder`, `tanstack-route`) with:
- Template paths under `configuration/ic-suite/conformetry-templates/`
- Input schemas (Zod → JSON Schema for generator prompts)
- Instance globs and optional per-group substitutions
- Thresholds (minimum score to pass)

**CLI command**:
```bash
conformetry validate --config <path> [--templates <names>] [--instances <globs>] [--languages <names>] [--threshold <ratio>]
conformetry generate --config <path> [--template <name>] [--inputs <json>]
```

| Flag | Purpose |
|------|---------|
| `validate --threshold` | Minimum similarity ratio an instance must reach; validation fails an instance below it (the gate) |
| `validate --languages` | Narrow validation to specific languages |
| `validate --templates` | Narrow validation to specific templates |
| `validate --instances` | Override instance globs for a one-off run |
| `generate` | Scaffold new files from a template (interactive prompts for inputs) |

**Nx target** (inferred by `@conformetry/nx`):
- `conformetry-validate` — Validate the project's instances against their templates. Fails if generated output diverges beyond the configured `threshold`.

**Gate semantics**:
- `nx affected -t conformetry-validate` scopes validation to changed projects.
- The `threshold` option (per instance group in config) controls how much divergence is tolerated before failing.

**Findings charged to projects**: Each validation result carries the `instancePath` and `templateName`. The gate fails the project owning the instance path when the score falls below the group's threshold.

---

### coinagerie — Vocabulary and Glossaries

**What it measures**: The words the code uses — identifiers, object keys, enum members, folder names and file names, split into lowercase words — against the markdown glossaries that define them. A word the code uses with no glossary entry, and an entry for a word the code no longer uses, both fail the check.

**Configuration file**: `coinagerie.config.ts` (workspace-level at `configuration/ic-suite/coinagerie.config.ts`; each project's own file sits in its `configuration/` folder). `--config` is required: coinagerie never searches for a configuration.

**CLI command**:
```bash
coinagerie --config <path>            # print the glossary block, write nothing
coinagerie --config <path> --check    # exit 1 naming missing and stale words
coinagerie --config <path> --write    # rewrite every glossary, keeping definitions
```

**Nx target** (inferred by `@coinagerie/nx`): `coinagerie-check`, with a `write` configuration that rewrites the glossary at `documentation/coinagerie.md`. A bare entry for a new word passes; definitions are written by hand with the `coinagerie-define` skill, because the check judges which words are listed, not whether they are defined.

---

## CI Gate Flow

Pull requests are gated by the matrix in `.github/workflows/continuous-integration.yml`. Each toolchain's gate runs as its own leg over the affected projects, so a red check names the toolchain that failed:

| CI leg | Nx target | Toolchain |
|--------|-----------|-----------|
| 🧑‍⚕️ Static | `typecheck-code`, `format-code`, `lint-code`, `deprecate-code` | — |
| 💂 Guard | `agent-instructions`, `catalog-manifests`, `coinagerie-check`, `lockfile`, `project-ports`, `pull-request-template`, `readme-projects`, `skill-descriptions`, `typeorm-migration-sql`, `vscode-extensions` | coinagerie, workspace integrity |
| 🔬 Callidescope Restrict | `callidescope-restrict` (sharded) | callidescope |
| 🕸️ Codependix Bound | `codependix-bound` | codependix |
| ⏲️ Codometer Limit | `codometer-limit` | codometer (comment budgets, directory ceilings) |
| 👔 Conformetry Validate | `conformetry-validate` | conformetry |
| 👷 Build | `build-projects` = `build` then `codometer-weigh` | codometer (compiled size) |

Every gate charges its findings to the project that owns them and fails only that project, so `nx affected` scopes each leg to what a change touched, and GitHub shows one status check per leg.

### The `guard-code` Aggregator

Defined in `nx.json` under `targetDefaults.guard-code`, this `nx:noop` target depends on the per-project gates plus workspace integrity checks:

```json
"guard-code": {
  "cache": false,
  "configurations": { "check": {}, "write": {} },
  "defaultConfiguration": "check",
  "dependsOn": [
    "agent-instructions",
    "callidescope-restrict",
    "catalog-manifests",
    "codependix-bound",
    "coinagerie-check",
    "conformetry-validate",
    "lockfile",
    "project-ports",
    "pull-request-template",
    "readme-projects",
    "skill-descriptions",
    "typeorm-migration-sql",
    "vscode-extensions"
  ],
  "description": "Aggregator for guard-code...",
  "executor": "nx:noop",
  "inputs": ["default"]
}
```

Running `nx run <project>:guard-code` (or `nx affected -t guard-code`) executes the four gating IC-Suite toolchains (all but codometer) plus workspace integrity checks for the affected projects. Neither `callidescope-restrict` nor `codependix-bound` has configurations, so the configuration passed to `guard-code` falls through to their defaults.

### The `build-projects` Aggregator

```json
"build-projects": {
  "dependsOn": ["build", "codometer-weigh"],
  "executor": "nx:noop"
}
```

Every build is measured by codometer; a size-limit breach fails the build. The `codometer-weigh` target runs through the `integration:codometer` executor, with a `check` configuration that gates the project's limit and a `write` configuration that writes `documentation/codometer.md`.

### Pre-Commit Hooks

`lint-staged` (configured in `configuration/repository/lint-staged.config.ts`) runs `nx affected` over the staged changes, selecting projects the way CI does, with the same `lint-code` target family that the `validate-code` skill runs. `codometer` is not part of the pre-commit gate; it runs in `build-projects` during CI.

### CI Workflow

GitHub Actions (`.github/workflows/continuous-integration.yml`) runs the matrix above on pull requests. The `validate-code` skill documents the full local validation workflow:

1. **Auto-fix** — `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main`
2. **Verify** — `nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main`
3. **Coverage gate** (when required) — `nx run <project>:vitest --configuration=coverage`
4. **Type coverage gate** (when required) — `nx run <project>:type-coverage`

All checks must pass before proceeding. Failures are triaged with the `triage-integration` skill, which provides per-tool fix instructions.

## No-Shared-Package Constraint

The five toolchains share nothing today but a logger, and the layer vocabulary **must not change that**. No cross-toolchain `@ic-suite/*` package is created. The common `ConfigurationService` shape is a **convention, not an imported type** — each toolchain's `core` declares its own structurally identical shape, and no toolchain imports that shape from anywhere else. A later session that "simplifies" the five toolchains onto a shared dependency is undoing this decision, not completing it (ADR 0013).

## Integration with Workspace

- **Nx plugins** (`callidescope-nx`, `codependix-nx`, `coinagerie-nx`, `conformetry-nx`) integrate each suite into the Nx workspace, inferring per-project targets that follow the Nx dependency graph.
- **Agents** (`*-agents`) are skill packages installed back from `skills-lock.json` like any other vendored skill — they do not participate in the five-layer spine.
- **Examples** (`*-examples`) are test fixtures executed by CI so guides cannot rot; they are deliberately non-publishable.
- **Inline compilation**: Where one workspace package's code is compiled into another's build output, the published tarball carries it without naming it as a dependency. The dependency stays a single package in the workspace.

## Mermaid Diagram: Five-Layer Spine

```mermaid
flowchart TD
    %% Layer definitions
    subgraph L5 ["Layer 5: cli (entrypoint)"]
        CLI["*.command.ts modules only"]
        NX["Nx plugin (where exists)\n@callidescope/nx\n@codependix/nx\n@conformetry/nx\n@coinagerie/nx"]
    end

    subgraph L4 ["Layer 4: output (rendering & delivery)"]
        OUTPUT["JSON, Markdown, Mermaid\nAnchor blocks, destinations\nRouting & delivery"]
    end

    subgraph L3 ["Layer 3: analysis (what the tool does)"]
        CAL_A["callidescope-graph\n(call graph, depth, breadth)"]
        DEP_A1["codependix-boundaries\n(rule validation, cycles)"]
        DEP_A2["codependix-file-imports\n(file import graph)"]
        DEP_A3["codependix-nestjs-modules\n(NestJS module graph)"]
        DEP_A4["codependix-nx-projects\n(Nx project graph reader)"]
        COD_A1["codometer-languages\n(parsers, comment analysis)"]
        COD_A2["codometer-measurement\n(file discovery, metrics)"]
        CON_A1["conformetry-generation\n(template rendering)"]
        CON_A2["conformetry-languages\n(comparison, validators)"]
        CON_A3["conformetry-validation\n(orchestration, matching)"]
        COI_A1["coinagerie-languages\n(per-language word extraction)"]
        COI_A2["coinagerie-vocabulary\n(vocabulary collection)"]
    end

    subgraph L2 ["Layer 2: configuration (resolved run config)"]
        CONFIG["Schema, loading, defaults\nCLI flag resolution\n→ one resolved config object"]
    end

    subgraph L1 ["Layer 1: core (domain vocabulary)"]
        CORE["Result & finding types\nError classes\nEnums, unions, contracts\nNo services, no executables"]
    end

    %% No-layer packages
    subgraph NL ["No layer tag (not in runtime chain)"]
        AGENTS["*-agents\n(skills via skills-lock.json)"]
        EXAMPLES["*-examples\n(fixtures, some broken on purpose)"]
    end

    %% Dependency edges (downward only)
    CLI --> OUTPUT
    NX --> CLI
    OUTPUT --> CAL_A
    OUTPUT --> DEP_A1
    OUTPUT --> DEP_A2
    OUTPUT --> DEP_A3
    OUTPUT --> DEP_A4
    OUTPUT --> COD_A1
    OUTPUT --> COD_A2
    OUTPUT --> CON_A1
    OUTPUT --> CON_A2
    OUTPUT --> CON_A3
    OUTPUT --> COI_A1
    OUTPUT --> COI_A2
    CAL_A --> CONFIG
    DEP_A1 --> CONFIG
    DEP_A2 --> CONFIG
    DEP_A3 --> CONFIG
    DEP_A4 --> CONFIG
    COD_A1 --> CONFIG
    COD_A2 --> CONFIG
    CON_A1 --> CONFIG
    CON_A2 --> CONFIG
    CON_A3 --> CONFIG
    COI_A1 --> CONFIG
    COI_A2 --> CONFIG
    CONFIG --> CORE

    %% Styling
    classDef layer fill:#f8f9fa,stroke:#6c757d,stroke-width:1px;
    classDef core fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef config fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef analysis fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef output fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef cli fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef nolayer fill:#eceff1,stroke:#546e7a,stroke-dasharray: 5 5;

    class CORE core;
    class CONFIG config;
    class CAL_A,DEP_A1,DEP_A2,DEP_A3,DEP_A4,COD_A1,COD_A2,CON_A1,CON_A2,CON_A3,COI_A1,COI_A2 analysis;
    class OUTPUT output;
    class CLI,NX cli;
    class AGENTS,EXAMPLES nolayer;
```

## Related Documentation

- [Architecture Overview](../architecture/overview.md) — Workspace-wide architectural patterns
- [Callidescope Domain](../domain/callidescope.md) — Call stack tracing domain model
- [Codependix Domain](../domain/codependix.md) — Dependency graph and boundary domain model
- [Codomter Domain](../domain/codometer.md) — Repository measurement domain model
- [Conformetry Domain](../domain/conformetry.md) — Template generation and conformance domain model
