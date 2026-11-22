---
type: Reference
title: Quickstart
description: Entry point for the OpenWiki. Provides a task-oriented map routing readers to the right architecture, domain, workflow, or operations page based on what they need to understand or change.
tags: [quickstart, overview, navigation]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-22T00:18:20.862Z
sources:
  - id: openwiki-source-7ce83b1fa051a437b5baffc6
    resource: repo://.devcontainer/cloud/devcontainer.json
  - id: openwiki-source-36b751a4c96b6d4e9193da92
    resource: repo://.devcontainer/local/devcontainer.json
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-2611f82c4debd12996455857
    resource: repo://documentation/adr/0013-name-the-ic-suite-layers.md
  - id: openwiki-source-5af1e140a8c8b0f50fd8ad35
    resource: repo://infrastructure/docker/docker-compose.yml
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
  - id: openwiki-source-8e13495afe9855ffe55d9812
    resource: repo://projects/common/interface/package.json
  - id: openwiki-source-09dd14eaa46847b0e8e3e29a
    resource: repo://projects/common/observability/package.json
  - id: openwiki-source-2b519047810ffd6e336cb936
    resource: repo://projects/common/persistence/package.json
  - id: openwiki-source-1bc1e17fecca95c41675a45f
    resource: repo://projects/common/presentation/package.json
  - id: openwiki-source-ca6ff5242336082371d82360
    resource: repo://projects/common/testing/package.json
  - id: openwiki-source-7b424da3424410740bbda58c
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/package.json
  - id: openwiki-source-824c9da02a58cc5b2f5aef5c
    resource: repo://projects/ic-suite/codependix/codependix-cli/package.json
  - id: openwiki-source-3ae2ebeca3adb1785fa98c4c
    resource: repo://projects/ic-suite/codometer/codometer-cli/package.json
  - id: openwiki-source-c782c5f4d341f62f31fe8aab
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/package.json
  - id: openwiki-source-b26e4947b4168052f48f0702
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/package.json
  - id: openwiki-source-d29bde3ec215557ea1958feb
    resource: repo://projects/lexico/lexico-web/package.json
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "claude-code", at: "2026-11-22T00:18:20.862Z" }
---

# Quickstart

Welcome to the OpenWiki for this pnpm + Nx monorepo of personal applications, shared packages, and the IC-Suite toolchains that keep them structurally consistent.

## Quick Navigation by Intent

| I want to… | Start here |
|------------|------------|
| **Understand the big picture** | [Architecture Overview](architecture/overview.md) — five domains, five toolchains, common packages, infrastructure |
| **Explore a specific domain** | [Domain Systems Overview](domain/overview.md) — affirmancy, caelundas, lexico, meanderaw, IC-Suite toolchains |
| **Set up my local machine** | [Local Development Setup](operations/local-development.md) — dev container, Docker Compose, env files |
| **Start a new feature or fix** | [Development Workflow](workflows/development.md) — 8-step agent workflow (clarify → specify → decompose → handoff → build → review → validate → integrate), one pull request per spec by default |
| **Run tests / check quality** | [Testing Strategy Overview](testing/overview.md) — `nx run <project>:vitest:<unit\|integration>`, coverage gates |
| **Deploy or operate in production** | [Infrastructure & Deployment](architecture/infrastructure.md) — Helm, Terraform, Docker Compose, CI/CD |
| **Scaffold a new project/module/file** | [Scaffolding & Generators](workflows/scaffolding.md) — conformetry generators via Nx |
| **Learn the IC-Suite toolchains** | [IC-Suite Architecture](architecture/ic-suite.md) — callidescope, codependix, codometer, conformetry, coinagerie |

---

## Projects Table

The repository is organized into four top-level domain groups, the IC-Suite toolchains, and shared common packages:

| Group | Projects | Description |
|-------|----------|-------------|
| **affirmancy** | `affirmancy` | Python LangGraph ReAct agent using Ollama (gemma4:e2b) + SearxNG to research subjects and generate grammatically-validated affirmations |
| **caelundas** | `caelundas-cli`, `caelundas-api`, `caelundas-db`, `caelundas-web` | NestJS CLI computes planetary positions with Swiss Ephemeris (JPL DE431), detects astronomical events, stores in Postgres, renders `.ics` + JSON; TanStack Start web for browsing; GraphQL API for events |
| **lexico** | `lexico-cli`, `lexico-api`, `lexico-db`, `lexico-web` | Latin-English dictionary suite: ingestion CLI, NestJS GraphQL API (Relay), TypeORM entities/migrations, TanStack Start SSR web |
| **meanderaw** | `meanderaw-cli`, `meanderaw-web` | NestJS CLI enumerates/measures/classifies Greek meander patterns by lattice Code into Postgres; TanStack Start SSR web for exploration |
| **ic-suite** | `callidescope`, `codependix`, `codometer`, `conformetry`, `coinagerie` | Five independent toolchains published as npm packages: call-stack analysis, dependency graph boundaries, code measurement, template generation & validation, vocabulary glossary management |
| **common** | `persistence`, `interface`, `presentation`, `observability`, `testing` | Shared infrastructure: Postgres/TypeORM/Testcontainers, GraphQL Relay types, React components, Pino logger, Vitest/NestJS/React/Postgres/GraphQL test utilities |

All domain projects depend on the **common packages** but never on each other. IC-Suite toolchains share only `observability`.

---

## Core Concepts at a Glance

### Four Application Domains (decoupled vertical slices)

| Domain | Language | Primary Output | Key Tech |
|--------|----------|----------------|----------|
| **affirmancy** | Python | Affirmations JSON/Markdown | LangGraph, Ollama, SearxNG, Pydantic |
| **caelundas** | TypeScript | `.ics` calendar + JSON + GraphQL | Swiss Ephemeris (JPL DE431), Postgres, nest-commander |
| **lexico** | TypeScript | Latin dictionary (Postgres + GraphQL) | GraphQL, Relay, TypeORM, cheerio |
| **meanderaw** | TypeScript | Meander DB (Postgres) + HTML | Lattice enumeration, Betti numbers, sparse JSONB |

### IC-Suite: Five Independent Toolchains

Each follows the **five-layer spine** (ADR 0013): `core → configuration → analysis → output → cli` (with Nx plugins for callidescope, codependix, conformetry, coinagerie).

| Toolchain | Purpose | Packages (published) |
|-----------|---------|----------------------|
| **callidescope** | Call stack depth/breadth through injected deps | 8 (6) |
| **codependix** | Dependency graphs (Nx/NestJS/file) + boundary rules | 11 (9) |
| **codometer** | Measure TS/JS/Python/JSON/md/notebooks; enforce limits | 8 (6) |
| **conformetry** | Template-driven generation; validate instances vs templates | 10 (8) |
| **coinagerie** | Vocabulary extraction, folding, glossary synchronization | 9 (7) |

Toolchains share only `observability`. Configuration tooling (`configuration/`, `synchronization/`) consumes IC-Suite.

---

## Essential Commands

```bash
# Install dependencies
pnpm install

# Run all quality checks on affected projects (write mode)
pnpm nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main

# Verify no issues remain — all checks must pass (check mode)
pnpm nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main

# Run tests for a project
nx run <project>:vitest:unit
nx run <project>:vitest:integration

# Start local infrastructure (Postgres, SearxNG, Open WebUI)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Database migrations (examples)
nx run lexico-db:migration:run
nx run caelundas-db:migration:run
nx run meanderaw-cli:migration:run

# Dev servers
nx run lexico-web:start          # TanStack Start at localhost:7797 (needs lexico-api)
nx run caelundas-web:start         # localhost:8967 (needs caelundas-api)
nx run meanderaw-web:start

# Run affected tests
pnpm nx affected --target=vitest --base=main
```

---

## Documentation Hubs

| Area | Pages |
|------|-------|
| **Architecture** | [Overview](architecture/overview.md) • [Common Packages](architecture/common-packages.md) • [IC-Suite](architecture/ic-suite.md) • [Infrastructure](architecture/infrastructure.md) |
| **Domains** | [Overview](domain/overview.md) • [Affirmancy](domain/affirmancy.md) • [Caelundas](domain/caelundas.md) • [Lexico](domain/lexico.md) • [Meanderaw](domain/meanderaw.md) • [Callidescope](domain/callidescope.md) • [Codependix](domain/codependix.md) • [Codometer](domain/codometer.md) • [Conformetry](domain/conformetry.md) • [Coinagerie](domain/coinagerie.md) |
| **Operations** | [Local Development](operations/local-development.md) • [Database Management](operations/database-management.md) |
| **Workflows** | [Development](workflows/development.md) • [CI/CD](workflows/ci-cd.md) • [Code Quality Gates](workflows/code-quality.md) • [Release](workflows/release.md) • [Scaffolding](workflows/scaffolding.md) |
| **Testing** | [Strategy](testing/overview.md) • [Affirmancy](testing/affirmancy.md) • [Caelundas](testing/caelundas.md) • [Lexico](testing/lexico.md) • [Meanderaw](testing/meanderaw.md) • [Coinagerie](testing/coinagerie.md) • [Integration](testing/integration.md) |
| **Integrations** | [External Services](integrations/external-services.md) • [Ollama & SearxNG](integrations/ollama-searxng.md) • [Swiss Ephemeris](integrations/swiss-ephemeris.md) |
| **Concepts** | [Generator Template Instance](concepts/generator-template-instance.md) • [Meander Theory](concepts/meander-theory.md) |

---

## Getting Started Checklist

1. **Open in dev container** — VS Code will prompt to reopen in the container defined by `.devcontainer/local/devcontainer.json` (Docker-outside-of-Docker, Node 24, Python 3.14, pnpm 12, uv, Nx, Terraform, Helm, kubectl)
2. **Start infrastructure** — `docker compose -f infrastructure/docker/docker-compose.yml up -d` (Postgres, SearxNG, Open WebUI)
3. **Pull Ollama model** — `nx run affirmancy:ollama --configuration=pull-small` (gemma4:e2b)
4. **Run database migrations** — `nx run caelundas-db:migration:run`, `nx run lexico-db:migration:run`, `nx run meanderaw-cli:migration:run`
5. **Verify setup** — `nx run lexico-web:start` (http://localhost:7797), `nx run caelundas-web:start` (http://localhost:8967), `nx run meanderaw-web:start`

---

## Next Steps

- Read [Architecture Overview](architecture/overview.md) for the system map
- Read [Local Development Setup](operations/local-development.md) for environment details
- Read [Development Workflow](workflows/development.md) before starting work
- Browse [Domain Systems Overview](domain/overview.md) to pick a domain to explore
