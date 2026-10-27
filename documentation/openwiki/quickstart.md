---
type: Reference
title: Quickstart
description: Entry point for the OpenWiki. Provides a task-oriented map routing readers to the right architecture, domain, workflow, or operations page based on what they need to understand or change.
tags: [quickstart, overview, navigation]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-7ce83b1fa051a437b5baffc6
    resource: repo://.devcontainer/cloud/devcontainer.json
  - id: openwiki-source-36b751a4c96b6d4e9193da92
    resource: repo://.devcontainer/local/devcontainer.json
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-39c3295efc089133e87a9c80
    resource: repo://CONTEXT.md
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
  - id: openwiki-source-7b424da3424410740bbda58c
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/package.json
  - id: openwiki-source-824c9da02a58cc5b2f5aef5c
    resource: repo://projects/ic-suite/codependix/codependix-cli/package.json
  - id: openwiki-source-3ae2ebeca3adb1785fa98c4c
    resource: repo://projects/ic-suite/codometer/codometer-cli/package.json
  - id: openwiki-source-b26e4947b4168052f48f0702
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/package.json
  - id: openwiki-source-d29bde3ec215557ea1958feb
    resource: repo://projects/lexico/lexico-web/package.json
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Quickstart

Welcome to the OpenWiki for this pnpm + Nx monorepo of personal applications, shared packages, and the IC-Suite toolchains that keep them structurally consistent.

## Quick Navigation by Intent

| I want to… | Start here |
|------------|------------|
<!-- openwiki: broken internal link [../architecture/overview.md] file "../architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Understand the big picture** | [Architecture Overview](../architecture/overview.md) — four domains, four toolchains, common packages, infrastructure |
<!-- openwiki: broken internal link [../domain/overview.md] file "../domain/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Explore a specific domain** | [Domain Systems Overview](../domain/overview.md) — affirmancy, caelundas, lexico, meanderaw |
<!-- openwiki: broken internal link [../operations/local-development.md] file "../operations/local-development.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Set up my local machine** | [Local Development Setup](../operations/local-development.md) — dev container, Docker Compose, env files |
<!-- openwiki: broken internal link [../workflows/development.md] file "../workflows/development.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Start a new feature or fix** | [Development Workflow](../workflows/development.md) — 8-step agent workflow (clarify → specify → decompose → handoff → build → review → validate → integrate) |
<!-- openwiki: broken internal link [../testing/overview.md] file "../testing/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Run tests / check quality** | [Testing Strategy Overview](../testing/overview.md) — `nx run <project>:vitest:<unit\|integration>`, coverage gates |
<!-- openwiki: broken internal link [../architecture/infrastructure.md] file "../architecture/infrastructure.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Deploy or operate in production** | [Infrastructure & Deployment](../architecture/infrastructure.md) — Helm, Terraform, Docker Compose, CI/CD |
<!-- openwiki: broken internal link [../workflows/scaffolding.md] file "../workflows/scaffolding.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Scaffold a new project/module/file** | [Scaffolding & Generators](../workflows/scaffolding.md) — conformetry generators via Nx |
<!-- openwiki: broken internal link [../architecture/ic-suite.md] file "../architecture/ic-suite.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Learn the IC-Suite toolchains** | [IC-Suite Architecture](../architecture/ic-suite.md) — callidescope, codependix, codometer, conformetry |

---

## Projects Table

The repository is organized into four top-level domain groups and the IC-Suite toolchains:

| Group | Projects | Description |
|-------|----------|-------------|
| **affirmancy** | `affirmancy` | Python LangGraph ReAct agent using Ollama (gemma4:e2b) + SearxNG to research subjects and generate grammatically-validated affirmations |
| **caelundas** | `caelundas-cli`, `caelundas-web` | NestJS CLI computes planetary positions with Swiss Ephemeris (JPL DE431), detects astronomical events, stores in Postgres, renders `.ics` + JSON; TanStack Start web for browsing |
| **lexico** | `lexico-cli`, `lexico-api`, `lexico-entities`, `lexico-web` | Latin-English dictionary suite: ingestion CLI, NestJS GraphQL API (Relay), TypeORM entities/migrations, TanStack Start SSR web |
| **meanderaw** | `meanderaw-cli`, `meanderaw-web` | NestJS CLI enumerates/measures/classifies Greek meander patterns by lattice Code into Postgres; TanStack Start SSR web for exploration |
| **ic-suite** | `callidescope`, `codependix`, `codometer`, `conformetry` | Four independent toolchains published as npm packages: call-stack analysis, dependency graph boundaries, code measurement, template generation & validation |

All domain projects depend on the **common packages** (`@codebase/persistence`, `@codebase/interface`, `@codebase/presentation`, `@codebase/observability`) but never on each other.

---

## Core Concepts at a Glance

### Four Application Domains (decoupled vertical slices)

| Domain | Language | Primary Output | Key Tech |
|--------|----------|----------------|----------|
| **affirmancy** | Python | Affirmations JSON/Markdown | LangGraph, Ollama, SearxNG, Pydantic |
| **caelundas** | TypeScript | `.ics` calendar + JSON | Swiss Ephemeris (JPL DE431), Postgres, nest-commander |
| **lexico** | TypeScript | Latin dictionary (Postgres + GraphQL) | GraphQL, Relay, TypeORM, cheerio |
| **meanderaw** | TypeScript | Meander DB (Postgres) + HTML | Lattice enumeration, Betti numbers, sparse JSONB |

### IC-Suite: Four Independent Toolchains

Each follows the **five-layer spine** (ADR 0013): `core → configuration → analysis → output → cli` (with Nx plugins for callidescope, codependix, conformetry).

| Toolchain | Purpose | Published Packages |
|-----------|---------|-------------------|
| **callidescope** | Call stack depth/breadth through injected deps | 7 |
| **codependix** | Dependency graphs (Nx/NestJS/file) + boundary rules | 10 |
| **codometer** | Measure TS/JS/Python/JSON/md/notebooks; enforce limits | 7 |
| **conformetry** | Template-driven generation; validate instances vs templates | 9 |

Toolchains share only `observability`. Configuration tooling (`configuration/`, `synchronization/`) consumes IC-Suite.

---

## Essential Commands

```bash
# Install dependencies
pnpm install

# Run all quality checks on affected projects
pnpm nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --base=main

# Run tests for a project
nx run <project>:vitest:unit
nx run <project>:vitest:integration

# Start local infrastructure (Postgres, SearxNG, Open WebUI)
docker compose -f infrastructure/docker-compose.yml up -d

# Database migrations (example for lexico)
nx run lexico-api:migration:run

# Dev servers
nx run lexico-web:start          # TanStack Start at localhost:3000
nx run caelundas-web:start
nx run meanderaw-web:start
```

---

## Documentation Hubs

| Area | Pages |
|------|-------|
<!-- openwiki: broken internal link [../architecture/overview.md] file "../architecture/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../architecture/common-packages.md] file "../architecture/common-packages.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../architecture/ic-suite.md] file "../architecture/ic-suite.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../architecture/infrastructure.md] file "../architecture/infrastructure.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Architecture** | [Overview](../architecture/overview.md) • [Common Packages](../architecture/common-packages.md) • [IC-Suite](../architecture/ic-suite.md) • [Infrastructure](../architecture/infrastructure.md) |
<!-- openwiki: broken internal link [../domain/overview.md] file "../domain/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../domain/affirmancy.md] file "../domain/affirmancy.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../domain/caelundas.md] file "../domain/caelundas.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../domain/lexico.md] file "../domain/lexico.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../domain/meanderaw.md] file "../domain/meanderaw.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Domains** | [Overview](../domain/overview.md) • [Affirmancy](../domain/affirmancy.md) • [Caelundas](../domain/caelundas.md) • [Lexico](../domain/lexico.md) • [Meanderaw](../domain/meanderaw.md) |
<!-- openwiki: broken internal link [../operations/local-development.md] file "../operations/local-development.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../operations/database-management.md] file "../operations/database-management.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Operations** | [Local Development](../operations/local-development.md) • [Database Management](../operations/database-management.md) |
<!-- openwiki: broken internal link [../workflows/development.md] file "../workflows/development.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../workflows/ci-cd.md] file "../workflows/ci-cd.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../workflows/code-quality.md] file "../workflows/code-quality.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../workflows/release.md] file "../workflows/release.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../workflows/scaffolding.md] file "../workflows/scaffolding.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Workflows** | [Development](../workflows/development.md) • [CI/CD](../workflows/ci-cd.md) • [Code Quality Gates](../workflows/code-quality.md) • [Release](../workflows/release.md) • [Scaffolding](../workflows/scaffolding.md) |
<!-- openwiki: broken internal link [../testing/overview.md] file "../testing/overview.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/affirmancy.md] file "../testing/affirmancy.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/caelundas.md] file "../testing/caelundas.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/lexico.md] file "../testing/lexico.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/meanderaw.md] file "../testing/meanderaw.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/ic-suite.md] file "../testing/ic-suite.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../testing/integration.md] file "../testing/integration.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Testing** | [Strategy](../testing/overview.md) • [Affirmancy](../testing/affirmancy.md) • [Caelundas](../testing/caelundas.md) • [Lexico](../testing/lexico.md) • [Meanderaw](../testing/meanderaw.md) • [IC-Suite](../testing/ic-suite.md) • [Integration](../testing/integration.md) |
<!-- openwiki: broken internal link [../integrations/external-services.md] file "../integrations/external-services.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../integrations/ollama-searxng.md] file "../integrations/ollama-searxng.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../integrations/swiss-ephemeris.md] file "../integrations/swiss-ephemeris.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Integrations** | [External Services](../integrations/external-services.md) • [Ollama & SearxNG](../integrations/ollama-searxng.md) • [Swiss Ephemeris](../integrations/swiss-ephemeris.md) |
<!-- openwiki: broken internal link [../concepts/generator-template-instance.md] file "../concepts/generator-template-instance.md" does not exist. Fix the href or restore the target, then delete this comment. -->
<!-- openwiki: broken internal link [../concepts/meander-theory.md] file "../concepts/meander-theory.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| **Concepts** | [Generator Template Instance](../concepts/generator-template-instance.md) • [Meander Theory](../concepts/meander-theory.md) |

---

## Getting Started Checklist

- [ ] Open in **VS Code Dev Container** (choose *Local* for Docker-outside-of-Docker, *Cloud* for Codespaces)
- [ ] Run `pnpm install` (if not done by `postCreateCommand`)
- [ ] Start infrastructure: `docker compose -f infrastructure/docker-compose.yml up -d`
- [ ] Run migrations for domains you'll work on (e.g., `nx run lexico-api:migration:run`)
- [ ] Start a dev server: `nx run lexico-web:start` → <http://localhost:3000>
<!-- openwiki: broken internal link [../workflows/development.md] file "../workflows/development.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [ ] Read [Development Workflow](../workflows/development.md) before making changes
- [ ] Run `nx affected --target=vitest --base=main` to verify test setup
