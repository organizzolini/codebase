---
type: Architecture
title: Architecture Overview
description: High-level system architecture showing the four major domains (affirmancy, caelundas, lexico, meanderaw), the IC-Suite toolchains, shared common packages, and cross-cutting infrastructure.
tags: [architecture, codebase, nx, TypeScript, Python]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-3813a8d6b5fb514dbe957652
    resource: repo://configuration/codependix.config.ts
  - id: openwiki-source-75161601af5a39bb60abb392
    resource: repo://configuration/conformetry.config.ts
  - id: openwiki-source-39c3295efc089133e87a9c80
    resource: repo://CONTEXT.md
  - id: openwiki-source-2611f82c4debd12996455857
    resource: repo://documentation/adr/0013-name-the-ic-suite-layers.md
  - id: openwiki-source-02697dfc3eaeabacfc681e88
    resource: repo://documentation/adr/0024-nest-every-project-under-projects.md
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-aa414ec11f49c0bd0511815c
    resource: repo://projects/affirmancy/project.json
  - id: openwiki-source-5effdfad598c5d934a923718
    resource: repo://projects/caelundas/caelundas-cli/project.json
  - id: openwiki-source-f816dafba05f46665e78722c
    resource: repo://projects/common/interface/project.json
  - id: openwiki-source-06cec2050e1b9e3dd741c9f4
    resource: repo://projects/common/observability/project.json
  - id: openwiki-source-de4dffad77fdd24cedfe1707
    resource: repo://projects/common/persistence/project.json
  - id: openwiki-source-5bafa90f596911b2487bd34f
    resource: repo://projects/common/presentation/project.json
  - id: openwiki-source-b037a02ecab615c15deb1d91
    resource: repo://projects/ic-suite/callidescope/callidescope-core/project.json
  - id: openwiki-source-f084a22c5c532343a9d27c48
    resource: repo://projects/ic-suite/codependix/codependix-core/project.json
  - id: openwiki-source-2833f4046ed31ba1123ef893
    resource: repo://projects/ic-suite/codometer/codometer-core/project.json
  - id: openwiki-source-1bd2cf1e4f05398afbe13eb6
    resource: repo://projects/ic-suite/conformetry/conformetry-configuration/README.md
  - id: openwiki-source-88483a7848b23450193df8a0
    resource: repo://projects/ic-suite/conformetry/conformetry-core/project.json
  - id: openwiki-source-9c39b5d57dccbc31a8952ba4
    resource: repo://projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts
  - id: openwiki-source-e0cf0150cb4d3420082c1bed
    resource: repo://projects/lexico/lexico-web/project.json
  - id: openwiki-source-e4dad6cf25b0a8d5881fa48e
    resource: repo://projects/meanderaw/meanderaw-cli/project.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---
# Architecture Overview

This document presents the high-level architecture of the codebase, organized into four application domains, the IC-Suite toolchains, shared common packages, and cross-cutting infrastructure.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
    subgraph Domains [Application Domains]
        Affirmancy["affirmancy<br/>Python LangGraph agent"]
        Caelundas["caelundas<br/>NestJS CLI + TanStack Start web"]
        Lexico["lexico<br/>NestJS API + TanStack Start web"]
        Meanderaw["meanderaw<br/>NestJS CLI + TanStack Start web"]
    end

    subgraph ICSuite [IC-Suite Toolchains]
        Callidescope["callidescope<br/>Call stack tracing"]
        Codependix["codependix<br/>Dependency graph export"]
        Codometer["codometer<br/>Repository measurement"]
        Conformetry["conformetry<br/>Template generation & validation"]
    end

    subgraph ICSuiteLayers [IC-Suite Layer Spine (ADR 0013)]
        Core["core<br/>layer:core<br/>Contracts leaf"]
        Config["configuration<br/>layer:configuration<br/>Config resolution"]
        Analysis["analysis<br/>layer:analysis<br/>Tool logic"]
        Output["output<br/>layer:output<br/>Rendering"]
        CLI["cli<br/>layer:cli<br/>Entrypoints"]
        NXPlugin["nx plugin<br/>layer:cli<br/>Nx host"]
    end

    subgraph Common [Common Packages]
        Interface["interface<br/>GraphQL types & helpers"]
        Observability["observability<br/>Pino logger service"]
        Persistence["persistence<br/>Postgres, TypeORM, Testcontainers"]
        Presentation["presentation<br/>React components"]
    end

    subgraph Infra [Infrastructure]
        Kubernetes["Helm charts<br/>kubernetes-job"]
        Terraform["Linode LKE<br/>cluster provisioning"]
        DockerCompose["Local services<br/>Postgres, SearxNG, Open WebUI"]
        CIWorkflows["GitHub Actions<br/>CI/CD/Compliance"]
    end

    subgraph ConfigTools [Configuration & Tooling]
        Configuration["configuration<br/>Shared tool config"]
        Synchronization["synchronization<br/>Derived config regeneration"]
        Validation["validation<br/>One-sided checks"]
        Documentation["documentation<br/>Docs refresh"]
        Installation["installation<br/>Dev machine setup"]
        Integration["integration<br/>CI plumbing"]
        Publication["publication<br/>Publish plumbing"]
    end

    %% Domain dependencies on common packages
    Affirmancy -.-> Persistence
    Affirmancy -.-> Observability
    Caelundas --> Persistence
    Caelundas --> Observability
    Lexico --> Interface
    Lexico --> Persistence
    Lexico --> Presentation
    Lexico --> Observability
    Meanderaw --> Persistence
    Meanderaw --> Observability

    %% IC-Suite internal layer dependencies (five-layer spine)
    Core -.-> Config
    Config -.-> Analysis
    Analysis -.-> Output
    Output -.-> CLI
    CLI -.-> NXPlugin

    %% IC-Suite toolchains depend on common observability
    Callidescope --> Observability
    Codependix --> Observability
    Codometer --> Observability
    Conformetry --> Observability

    %% Configuration tooling consumes IC-Suite
    Synchronization --> Conformetry
    Configuration -.-> Codependix
    Configuration -.-> Codometer
    Configuration -.-> Conformetry

    %% Infrastructure runs applications
    Kubernetes -.-> Domains
    DockerCompose -.-> Domains
    Terraform -.-> Kubernetes

    %% Configuration tooling uses infrastructure
    Integration --> CIWorkflows
    Publication --> CIWorkflows
```

**Figure 1:** High-level architecture showing four application domains, four IC-Suite toolchains with their five-layer spine (ADR 0013), shared common packages, configuration tooling, and infrastructure.

## System Structure

The codebase uses `pnpm` workspaces and `Nx` to coordinate builds, tests, and linting across TypeScript and Python workloads. Every project lives under `projects/` per **ADR 0024**, with domain grouping folders (`projects/affirmancy/`, `projects/caelundas/`, `projects/lexico/`, `projects/meanderaw/`, `projects/ic-suite/`, `projects/common/`).

### Application Domains

| Domain | Location | Type | Key Technologies |
|--------|----------|------|------------------|
| **affirmancy** | `projects/affirmancy/` | Python application | LangChain, LangGraph, Ollama, SearxNG, Jupyter notebooks |
| **caelundas** | `projects/caelundas/` | NestJS CLI + TanStack Start web | Swiss Ephemeris, TypeORM, PostgreSQL, nest-commander |
| **lexico** | `projects/lexico/` | NestJS API + TanStack Start web | GraphQL, Relay, TypeORM, PostgreSQL |
| **meanderaw** | `projects/meanderaw/` | NestJS CLI + TanStack Start web | Greek meander enumeration, TypeORM, PostgreSQL |

Each domain is a vertical slice: it owns its applications, data models, and interfaces. Domains depend on **common packages** for shared infrastructure but do not depend on each other.

### IC-Suite Toolchains

The IC-Suite (`projects/ic-suite/`) contains four independently versioned toolchains, each following the same **five-layer spine** defined in **ADR 0013**:

```
core ← configuration ← analysis ← output ← cli
                              ↑
                           nx plugin (where it exists)
```

| Layer | Tag | Responsibility | Never Holds |
|-------|-----|----------------|-------------|
| **core** | `layer:core` | Domain vocabulary only: result/finding types, error classes, shared enums, analyzer contracts | Services, modules, anything executable |
| **configuration** | `layer:configuration` | Config file schema, loading, defaults, CLI flag resolution → single resolved config object | Domain result types |
| **analysis** | `layer:analysis` | What the tool actually does (per-suite names) | Rendering, command wiring |
| **output** | `layer:output` | Every render target: JSON, markdown, mermaid, anchor blocks, destination routing | Analysis |
| **cli** | `layer:cli` | `*.command.ts` modules only (entrypoints) | Any logic |

The four toolchains:
- **callidescope**: Call stack tracing through injected dependencies
- **codependix**: Dependency graph export and boundary gating
- **codometer**: Repository measurement and reporting
- **conformetry**: Template-driven generation and conformance validation

Each toolchain's packages are **independently publishable** to npm. The toolchains share **only** the `observability` package (a pino-backed logger); no cross-toolchain `@ic-suite/*` package exists — this is a deliberate constraint (ADR 0013).

The `nx` plugin layer (callidescope, codependix, conformetry) carries `layer:cli`, not a sixth tag — it is a second host for the same underlying toolchain, not a new layer stacked above it.

### Common Packages (`projects/common/`)

Shared infrastructure used by application domains:

| Package | Purpose | Consumers |
|---------|---------|-----------|
| **interface** | GraphQL Relay types, entity-to-GraphQL contract, codegen config | lexico-web, lexico-api |
| **observability** | Pino-backed NestJS `LoggerService` and `LoggerModule` | All NestJS projects (domains + IC-Suite) |
| **persistence** | Postgres config fragment, TypeORM options/module, base entities, Testcontainers harness, migration CLI, export/import | caelundas, lexico, meanderaw |
| **presentation** | React component library (shadcn/ui + Base UI primitives) | lexico-web, meanderaw-web |

These are **internal workspace packages** (`type:package`), not published to npm.

### Configuration & Tooling (`configuration/`, `synchronization/`, `validation/`, etc.)

Cross-cutting tooling that operates on the workspace itself:

- **configuration**: Shared ESLint, TypeScript, Vitest, codependix, codometer, conformetry configs exported as `@codebase/configuration`
- **synchronization**: Regenerates derived configuration (codependix graphs, conformetry templates, documentation) and fails CI on drift
- **validation**: One-sided checks (PR metadata gate, etc.)
- **documentation**: NestJS CLI that refreshes repository documentation from code
- **installation**: Dev machine bootstrap (env files, dependencies, shell config)
- **integration** / **publication**: CI plumbing for affected runs, task cache, publishable-packages gate

### Infrastructure (`infrastructure/`)

- **Helm** (`helm/kubernetes-job/`): Reusable chart for batch job deployments with PVC storage
- **Terraform** (`terraform/`): Linode LKE cluster provisioning
- **Docker Compose**: Local PostgreSQL (creates per-project roles/databases/schemas), SearxNG, Open WebUI
- **GitHub Actions**: CI/CD/Compliance workflows using shared `setup-codebase` composite action

### Symlink Structure

The repository uses symlinks to provide alternative paths to the same content:

- `docs/` → `documentation/` (the documentation project)
- `openwiki/` → `documentation/openwiki/` (OpenWiki source content)

These symlinks allow tools and users to reference the documentation under familiar paths while keeping the canonical location under `documentation/`.

## Cross-Cutting Architectural Concern: Conformetry Template/Instance Validation Loop

The **conformetry** toolchain implements a cross-cutting template/instance validation loop that operates across the entire workspace:

1. **Generator Declaration**: Each generator is declared in `configuration/conformetry.config.ts` with a template directory, input schema (Zod → JSON Schema), and instance patterns (globs locating where generated code lives).

2. **Template as Source of Truth**: Templates are ordinary files with Mustache placeholders. They define what correct generated output looks like — validation measures instances against the template, not against an abstract rule set.

3. **Instance Discovery & Matching**: At validation time, instances are discovered by expanding the generator's glob patterns. Each instance is matched against **every template** by the share of the template's files the instance already has; the best fit wins. Special outcomes: `no-match` (no template explains it well enough) and `ambiguous` (multiple templates tie).

4. **Language-Based Comparison**: Each file type family (TypeScript, GraphQL, Markdown, Python, etc.) has a **Language** module in `conformetry-languages` that implements extension-based comparison. Languages measure differences and score conformance, reporting findings.

5. **Two Modes, Two Hosts**: 
   - **CLI host** (`conformetry-cli`): Interactive generation with prompts, validation runs on demand
   - **Nx plugin host** (`@conformetry/nx`): Generators exposed as `nx g conformetry:generate <name>`, validation integrated into CI via `conformetry-validate` target

6. **Continuous Conformance**: The `synchronization` tooling regenerates derived configuration and documentation, and `conformetry-validation` runs in CI to ensure no drift between templates and instances.

This loop is cross-cutting because it applies to **all project types** — Python applications, NestJS CLI tools, NestJS libraries, TanStack Start web apps, IC-Suite packages, and configuration tooling itself — as long as a generator is defined for them.

## Nx Module Boundary Rules

Nx enforces architectural boundaries through **project tags** and **dependency constraints** defined in `nx.json` and `eslint.config.ts`:

### Project Tags

Every `project.json` carries tags that classify the project:

- **Domain**: `domain:affirmancy`, `domain:caelundas`, `domain:lexico`, `domain:meanderaw`, `domain:ic-suite`
- **Type**: `type:application` (executable entrypoints) or `type:package` (libraries)
- **Layer** (IC-Suite only): `layer:core`, `layer:configuration`, `layer:analysis`, `layer:output`, `layer:cli`
- **Framework/Language**: `language:typescript`, `language:python`, `framework:nestjs`, `framework:react`, etc.

### Enforced Boundary Rules

| Rule | Enforcement |
|------|-------------|
| **Applications cannot import applications** | `depConstraints` in ESLint: `type:application` projects may not depend on other `type:application` projects |
| **Packages cannot import applications** | `type:package` projects may not depend on `type:application` projects |
| **Applications can import packages** | `type:application` → `type:package` is allowed (the normal direction) |
| **Packages can import packages** | `type:package` → `type:package` is allowed (shared infrastructure) |
| **IC-Suite layer ordering** | Within each toolchain: `core` → `configuration` → `analysis` → `output` → `cli` (enforced by `codependix` boundary rules) |
| **No cross-toolchain `@ic-suite/*` imports** | Each toolchain is independently versioned; they share only `observability` |

These rules are codified in `configuration/codependix.config.ts` boundary definitions and enforced by the `codependix-gate` Nx target (provided by `@codependix/nx` plugin) which runs in CI.

## Dependency Direction

```
Applications (domains)
    ↓ depend on
Common Packages (interface, observability, persistence, presentation)
    ↓
IC-Suite Toolchains (independent, consumed by configuration tooling)
    ↓
Configuration Tooling (reads workspace, invokes IC-Suite)
    ↓
Infrastructure (runs applications, provides cluster/services)
```

- **Applications** depend on **common packages** — never on each other
- **IC-Suite toolchains** are independent; **configuration tooling** consumes them
- **Infrastructure** runs applications and provides shared services (Postgres, etc.)
- **Common observability** is the single shared dependency across all NestJS projects (domains + IC-Suite)

## Architectural Decisions

- **ADR 0024**: Every project lives under `projects/` — folder structure no longer encodes project type; `type:application` / `type:package` tags do
- **ADR 0013**: IC-Suite layer vocabulary — five-layer spine with `layer:*` tags, no shared cross-toolchain package, analysis layer named per-suite
- **Nx project graph** is the source of truth for dependency gating (codependix boundaries, ESLint `depConstraints`)

## Related Documentation

- [Common Packages](../architecture/common-packages.md) — Detailed common package responsibilities
- [IC-Suite Toolchains](../architecture/ic-suite.md) — Per-toolchain package structure and layer details
- [Infrastructure](../architecture/infrastructure.md) — Helm, Terraform, Docker Compose, CI/CD
- [Domain Overview](../domain/overview.md) — Per-domain architecture and data models
- [Generator, Template, Instance, Language](../concepts/generator-template-instance.md) — Conformetry vocabulary
- [ADR 0013: Name the ic-suite layers](../../documentation/adr/0013-name-the-ic-suite-layers.md)
- [ADR 0024: Nest every project under projects/](../../documentation/adr/0024-nest-every-project-under-projects.md)
