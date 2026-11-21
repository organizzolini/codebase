---
type: domain-index
title: Domain Systems Overview
description: Index of the nine domain systems (four application domains + five toolchain domains) with one-line purpose, primary language, runtime targets, and links to detail pages.
tags: [domain, overview, architecture, application-domains, toolchain-domains]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-21T15:47:19.421Z
sources:
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
  - id: openwiki-source-bb47f0ae03a5325f0d8fdea7
    resource: repo://projects/common/persistence/README.md
  - id: openwiki-source-52f2bb7d9c7d2fad35c7c856
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/README.md
  - id: openwiki-source-353594b808056ff8dd3dbc28
    resource: repo://projects/ic-suite/codependix/codependix-cli/README.md
  - id: openwiki-source-4afd9d23488d0275aa688221
    resource: repo://projects/ic-suite/codometer/codometer-cli/README.md
  - id: openwiki-source-03219b76704d24994321965e
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/README.md
  - id: openwiki-source-15595f87d2b72a10e2cbba47
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/README.md
  - id: openwiki-source-c816812d5348f49efc00a840
    resource: repo://projects/lexico/lexico-api/project.json
  - id: openwiki-source-5e40db637ff9cea3eb6ab5fe
    resource: repo://projects/lexico/lexico-cli/README.md
  - id: openwiki-source-e0cf0150cb4d3420082c1bed
    resource: repo://projects/lexico/lexico-web/project.json
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.9.0", at: "2026-11-21T15:47:19.421Z" }
---

# Domain Systems Overview

This repository contains **nine independent domain systems**: four application domains and five toolchain domains. No domain imports code from another domain — this is a hard architectural rule enforced by the workspace structure and dependency constraints.

## Application Domains (4)

Each application domain is a vertical slice delivering a complete user-facing product: CLI + API + Web + DB (except **affirmancy**, which is CLI + Notebook only).

| Domain | Type | Language | Primary Output | Key Dependencies | Detail |
|--------|------|----------|----------------|------------------|--------|
| [affirmancy](affirmancy.md) | Python/Jupyter CLI + notebook pipeline | Python ≥ 3.11 | Affirmations JSON/Markdown | LangChain, LangGraph, Ollama, SearxNG | [affirmancy.md](affirmancy.md) |
| [caelundas](caelundas.md) | NestJS CLI + GraphQL API + TanStack Start web + Postgres/SQLite | TypeScript | `.ics` calendar + JSON + web UI | Swiss Ephemeris, Postgres, SQLite | [caelundas.md](caelundas.md) |
| [lexico](lexico.md) | NestJS CLI + GraphQL API + TanStack Start web + Postgres | TypeScript | Latin dictionary (Postgres + GraphQL + web) | Postgres, GraphQL, cheerio, mdast | [lexico.md](lexico.md) |
| [meanderaw](meanderaw.md) | NestJS CLI + TanStack Start web + Postgres | TypeScript | Meander database (Postgres) + HTML pages | Postgres, TanStack Start | [meanderaw.md](meanderaw.md) |

### Application Domain Vertical Slice Structure

```
Application Domain
├── <domain>-cli       # NestJS command-line application (entry point, orchestration)
├── <domain>-api       # NestJS GraphQL API (caelundas, lexico) — absent in meanderaw, affirmancy
├── <domain>-web       # TanStack Start SSR React application (caelundas, lexico, meanderaw)
├── <domain>-db        # @codebase/persistence-backed library: entities, migrations, TypeORM module
└── (shared)           # @codebase/* packages: persistence, interface, presentation, observability, testing
```

- **affirmancy** is the exception: Python/Jupyter only, no API, no web, no shared TypeScript packages. It uses its own uv workspace (`configuration/python`) and local LLM stack (Ollama, SearxNG).
- **caelundas** supports both Postgres (via `@codebase/persistence`) and SQLite (local file) for the CLI calendar generation path; the web/API path uses Postgres.
- **meanderaw** has no GraphQL API — the web application reads directly from Postgres via the shared persistence layer.
- All three TypeScript domains share the `@codebase/persistence` package for database connection, base entities (uuidv7, timestamps, soft delete), Testcontainers harness, and migration targets.

## Toolchain Domains (5)

Each toolchain domain is published as an npm package (`@callidescope/cli`, `@codependix/cli`, `@codometer/cli`, `@coinagerie/cli`, `@conformetry/cli`) and follows a **core + cli + nx plugin** structure where applicable:

| Domain | Purpose | Packages | Nx Plugin | Detail |
|--------|---------|----------|-----------|--------|
| [callidescope](callidescope.md) | Trace call stacks across a TypeScript monorepo; measure depth/breadth; report paths exceeding limits | `callidescope-core`, `callidescope-cli`, `callidescope-nx` | Yes (`callidescope-nx`) | [callidescope.md](callidescope.md) |
| [codependix](codependix.md) | Export dependency graphs (Nx, NestJS modules, file imports, Python imports) as JSON/Markdown; gate boundary rules | `codependix-core`, `codependix-cli`, `codependix-nx` | Yes (`codependix-nx`) | [codependix.md](codependix.md) |
| [codometer](codometer.md) | Measure repository: language stats + project-specific convention counters (services, tests, etc.); badge/JSON output | `codometer-core`, `codometer-cli`, `codometer-nx` | Yes (`codometer-nx`) | [codometer.md](codometer.md) |
| [coinagerie](coinagerie.md) | Extract every identifier/word from a codebase; maintain a markdown glossary in sync with code | `coinagerie-core`, `coinagerie-cli`, `coinagerie-nx` | Yes (`coinagerie-nx`) | [coinagerie.md](coinagerie.md) |
| [conformetry](conformetry.md) | Scaffold from templates, then validate existing code against those same templates (structural diff, not textual) | `conformetry-core`, `conformetry-cli`, `conformetry-nx` | Yes (`conformetry-nx`) | [conformetry.md](conformetry.md) |

### Toolchain Domain Structure

```
Toolchain Domain
├── <domain>-core       # Pure logic: analysis, graph building, validation, generation (no CLI, no Nx)
├── <domain>-cli        # NestJS command-line application: entry point, flags, config, output writers
├── <domain>-nx         # Nx plugin: executors, generators, project integration (optional but present for all 5)
├── <domain>-configuration   # Shared config types, schema validation (Zod)
├── <domain>-agents     # AI agent integrations (where applicable)
├── <domain>-output     # Output formatters (JSON, Markdown, Mermaid, etc.)
└── (domain-specific)   # e.g., callidescope-graph, codependix-boundaries, codometer-languages, coinagerie-vocabulary, conformetry-generation/validation
```

All five toolchains:
- Are **independently installable** via npm (`npm install --save-dev @<domain>/cli`)
- Require an explicit `--config` path — no config discovery, no defaults
- Support `--check` (gate on findings) and `--write` (emit artifacts) as separate concerns
- Produce both human-readable (Markdown, Mermaid) and machine-readable (JSON) output
- Have Vitest suites and conformetry-generated project structure

## No-Dependency-Between-Domains Rule

> **No domain imports code from another domain.**

This rule applies to both application domains and toolchain domains:
- Application domains do not import from each other (e.g., `caelundas` never imports `lexico` code)
- Toolchain domains do not import from each other (e.g., `callidescope` never imports `codependix` code)
- Application domains do not import from toolchain domains (toolchains are dev dependencies only)
- Toolchain domains do not import from application domains

Cross-cutting concerns are factored into the **`@codebase/*` shared packages** (persistence, interface, presentation, observability, testing) which are **not domains** — they are infrastructure libraries used by the three TypeScript application domains.

## Shared Infrastructure (`@codebase/*`)

| Package | Purpose |
|---------|---------|
| `@codebase/persistence` | Postgres environment schemas (`<PROJECT>_POSTGRES_*`), TypeORM modules, base entities (uuidv7, timestamps, soft delete), Testcontainers harness, migration targets; SQLite equivalents for caelundas |
| `@codebase/interface` | Shared TypeScript types, Zod schemas, GraphQL scalars |
| `@codebase/presentation` | Shared React components (shadcn/ui, TanStack Table, etc.), Tailwind config |
| `@codebase/observability` | Pino logging, Lightship health probes, OpenTelemetry setup |
| `@codebase/testing` | Testcontainers-backed NestJS testing module, Vitest utilities |

## Domain Detail Pages

Each domain has its own detail page with deep-dive documentation:

- [affirmancy.md](affirmancy.md) — Python/Jupyter affirmation generation pipeline
- [caelundas.md](caelundas.md) — Astronomical calendar: Swiss Ephemeris, event detection, .ics/JSON output
- [lexico.md](lexico.md) — Latin dictionary: multi-source ingestion, GraphQL API, TanStack Start web
- [meanderaw.md](meanderaw.md) — Meander pattern database: procedural generation, Postgres, HTML page rendering
- [callidescope.md](callidescope.md) — Call stack depth/breadth analysis across monorepo
- [codependix.md](codependix.md) — Dependency graph export (Nx, NestJS, file imports) + boundary gating
- [codometer.md](codometer.md) — Repository measurement: language stats + convention counters
- [coinagerie.md](coinagerie.md) — Codebase glossary extraction and markdown sync
- [conformetry.md](conformetry.md) — Template scaffolding + structural validation against templates

## Architecture Diagram

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
graph TB
    subgraph Applications
        A1[affirmancy<br/>Python/Jupyter<br/>CLI + Notebook]
        A2[caelundas<br/>NestJS + TanStack Start<br/>CLI + API + Web + DB]
        A3[lexico<br/>NestJS + TanStack Start<br/>CLI + API + Web + DB]
        A4[meanderaw<br/>NestJS + TanStack Start<br/>CLI + Web + DB]
    end

    subgraph Toolchains
        T1[callidescope<br/>Core + CLI + Nx Plugin<br/>Call graph analysis]
        T2[codependix<br/>Core + CLI + Nx Plugin<br/>Dependency graphs + boundaries]
        T3[codometer<br/>Core + CLI + Nx Plugin<br/>Repo measurement + conventions]
        T4[coinagerie<br/>Core + CLI + Nx Plugin<br/>Glossary extraction]
        T5[conformetry<br/>Core + CLI + Nx Plugin<br/>Scaffold + validate templates]
    end

    subgraph SharedInfrastructure[@codebase/* Shared Packages]
        SI1[persistence]
        SI2[interface]
        SI3[presentation]
        SI4[observability]
        SI5[testing]
    end

    A2 --> SI1 & SI2 & SI3 & SI4 & SI5
    A3 --> SI1 & SI2 & SI3 & SI4 & SI5
    A4 --> SI1 & SI2 & SI3 & SI4 & SI5

    style A1 fill:#f9f,stroke:#333
    style A2 fill:#bbf,stroke:#333
    style A3 fill:#bbf,stroke:#333
    style A4 fill:#bbf,stroke:#333
    style T1 fill:#bfb,stroke:#333
    style T2 fill:#bfb,stroke:#333
    style T3 fill:#bfb,stroke:#333
    style T4 fill:#bfb,stroke:#333
    style T5 fill:#bfb,stroke:#333
    style SI1 fill:#ffd,stroke:#333
    style SI2 fill:#ffd,stroke:#333
    style SI3 fill:#ffd,stroke:#333
    style SI4 fill:#ffd,stroke:#333
    style SI5 fill:#ffd,stroke:#333
```

## Key Entry Points by Domain

### Application Domains

| Domain | Primary Entry Points |
|--------|---------------------|
| **affirmancy** | `nx run affirmancy:ollama --configuration=start`, `nx run infrastructure:searxng:up`, `src/affirmancy.ipynb` |
| **caelundas** | `nx run caelundas-cli:download-ephemeris`, `nx run caelundas-cli:start`, `nx run caelundas-api:start`, `nx run caelundas-web:start` |
| **lexico** | `nx run lexico-cli:start` (root pipeline), `nx run lexico-cli:start:dictionary`, `nx run lexico-api:start`, `nx run lexico-web:start` |
| **meanderaw** | `nx run meanderaw-cli:start` (draw run), `nx run meanderaw-web:start` |

### Toolchain Domains

| Domain | CLI Command | Nx Target |
|--------|-------------|-----------|
| **callidescope** | `npx callidescope --config <path> --check depth` | `nx run callidescope-cli:start` |
| **codependix** | `npx codependix map --config <path> --check boundaries` | `nx run codependix-cli:start` |
| **codometer** | `npx codometer --config <path> --check limits` | `nx run codometer-cli:start` |
| **coinagerie** | `npx @coinagerie/cli --config <path> --check` | `nx run coinagerie-cli:start` |
| **conformetry** | `npx conformetry generate --config <path> --template <name>` / `npx conformetry validate --config <path>` | `nx run conformetry-cli:start` |

---

**See also:** [Architecture Overview](../architecture/overview.md) for the broader system context including Nx workspace layout, Docker Compose infrastructure, and deployment topology.
