---
type: domain-index
title: Domain Systems Overview
description: Index page for the four application domains (affirmancy, caelundas, lexico, meanderaw), summarizing each domain's purpose, technology stack, primary outputs, and key dependencies.
tags: [domain, overview, architecture, application-domains]
sources:
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
  - id: openwiki-source-5e40db637ff9cea3eb6ab5fe
    resource: repo://projects/lexico/lexico-cli/README.md
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Domain Systems Overview

This repository contains four independent application domains, each with its own technology stack, data model, and deployment concerns. They share common infrastructure (Postgres, Nx workspace, Docker Compose) but are otherwise decoupled — no domain imports code from another.

## Summary Table

| Domain | Type | Language | Primary Output | Key Dependencies |
|--------|------|----------|----------------|------------------|
| [affirmancy](affirmancy.md) | Python/Jupyter CLI + notebook pipeline | Python ≥ 3.11 | Affirmations JSON/Markdown | LangChain, LangGraph, Ollama, SearxNG |
| [caelundas](caelundas.md) | NestJS CLI + TanStack Start web | TypeScript | `.ics` calendar + JSON | Swiss Ephemeris, Postgres |
| [lexico](lexico.md) | NestJS CLI + GraphQL API + TanStack Start web | TypeScript | Latin dictionary (Postgres + GraphQL) | Postgres, GraphQL, cheerio, mdast |
| [meanderaw](meanderaw.md) | NestJS CLI + TanStack Start web | TypeScript | Meander database (Postgres) + HTML pages | Postgres |

---

## affirmancy

**Purpose:** Generate structured affirmations across every grammatical mood a language offers.

A Python and Jupyter application that generates affirmations for spiritual practices using a LangGraph ReAct agent. The agent researches a subject through SearxNG metasearch, then a locally-hosted `gemma4:e2b` model via Ollama writes affirmations validated against Pydantic models before being saved as JSON and Markdown.

**Key characteristics:**

- **Grammar-first pipeline** — enumerates moods, voices, tenses, aspects, persons, numbers, polarities, and deixis; a single subject yields affirmations phrased as imperatives, optatives, subjunctives, jussives, and more
- **Subject taxonomy** — categories span tarot, Lenormand, astrological signs/planets/aspects/houses, modalities, chakras, runes, sephiroth, Hebrew letters, kabbalistic worlds, solfeggio frequencies, weekdays, and elements
- **Local-first LLM** — runs entirely on Ollama with no external API calls; model pulled once via `nx run affirmancy:ollama --configuration=pull-small`
- **SearxNG integration** — metasearch provides grounding context for each subject before generation

**Entry points:**

- `nx run affirmancy:ollama --configuration=start` — starts Ollama
- `nx run infrastructure:searxng:up` — starts SearxNG
- `src/affirmancy.ipynb` — main generation pipeline (run in VS Code)
- `src/grammars.py` — grammatical axis definitions (`Mood`, `Voice`, `Tense`, `Aspect`, `Person`, `Number`, `Polarity`, `Deixis`, `Form`)
- `src/models.py` — Pydantic models (`Affirmation`, `GrammarAffirmations`, `SubjectAffirmations`, `ValidationResult`)

---

## caelundas

**Purpose:** Turn the sky into a calendar — compute planetary positions, detect astronomical events, and render an iCalendar file.

A TypeScript application (NestJS CLI + TanStack Start web) that computes planetary positions minute-by-minute over a date range using the Swiss Ephemeris (JPL DE431 data), detects events (aspects, phases, eclipses, retrogrades, ingresses, solstices, twilights), stores them in Postgres, and renders `.ics` and JSON output.

**Key characteristics:**

- **Swiss Ephemeris** — local computation from JPL DE431 data files (no network calls, no API keys, no rate limits); data downloaded once via `nx run caelundas-cli:download-ephemeris`
- **Two-pass event detection** — *perfective* (exact moments at minute resolution) and *progressive* (spans around exact moments: aspect orbs, retrograde periods)
- **Comprehensive event families** — aspects (major, minor, harmonic, compound), lunar phases, planetary phases, eclipses, retrogrades, ingresses, annual solar cycle, lunar apsides, daily cycles, twilights
- **Timezone from coordinates** — derived automatically from observer latitude/longitude to avoid silently wrong sunrise times
- **Postgres persistence** — `calendar_events` table in `caelundas_development` database, `caelundas` schema, `caelundas_username` role

**Entry points:**

- `nx run caelundas-cli:download-ephemeris` — one-time ephemeris data download
- `nx run caelundas-cli:migration:run` — creates `calendar_events` table
- `nx run caelundas-cli:start` — generates calendar (reads `.env` for location/date range)
- `projects/caelundas/caelundas-web` — TanStack Start web application for browsing events

---

## lexico

**Purpose:** Latin-English dictionary suite — ingest, store, and serve dictionary entries, literature, and etymology.

A TypeScript application with three components: a NestJS CLI for ingestion (`lexico-cli`), a NestJS GraphQL API (`lexico-api`), and a TanStack Start SSR web application (`lexico-web`). The CLI scrapes and parses multiple Latin sources into a shared Postgres schema defined by `lexico-entities`.

**Key characteristics:**

- **Multi-source ingestion** — Dictionary (Lewis & Short), Perseus Digital Library, The Latin Library, CSEL (ecclesiastical Latin), EDCS (epigraphic database), Wiktionary; each source in its own module under `src/modules/`
- **Resumable dictionary scrape** — `--startLemma` / `--endLemma` flags allow restarting a long scrape from where it left off
- **Shared schema** — TypeORM entities and migrations in `@codebase/lexico-entities`; ingestion and API cannot drift
- **GraphQL API** — Relay cursor-based search, exposes dictionary entries, forms, inflections, literature lines/tokens, and work metadata
- **HTML parsing** — cheerio for HTML, mdast for wiki markup; source layout changes contained to one module

**Entry points:**

- `nx run lexico-cli:start` — root pipeline (prompts for stages: `--dictionary`, `--literature`, `--library`, `--wikipedia`, etc.)
- `nx run lexico-cli:start:dictionary` — dictionary ingestion with lemma range
- `nx run lexico-cli:start:wiktionary` — Wiktionary dump ingestion
- `nx run lexico-api:start` — GraphQL API server
- `nx run lexico-web:dev` — TanStack Start web application

---

## meanderaw

**Purpose:** Enumerate, measure, and classify Greek meander (key/fret) patterns.

A TypeScript application (NestJS CLI + TanStack Start web) that enumerates every structurally distinct meander within an edge budget, measures topological characteristics (Betti numbers, fork/cross counts, junction types), classifies them, stores rows in Postgres, and renders HTML pattern pages for exploration.

**Key characteristics:**

- **Lattice-based enumeration** — walks the space of direction-bit assignments over a lattice rather than drawing named shapes; 30,279 enumerated meanders at 14 shapes
- **Historical corpus preservation** — 965 hardcoded meanders beyond the edge budget, ingested once from retired file tree and measured identically to enumerated rows
- **Sparse JSON characteristics** — single `characteristics` jsonb column holds every measured trait (numeric counts only when non-zero, booleans only when true); new characteristics need no schema change
- **Code-addressed rows** — each meander uniquely identified by its formatted Code (e.g., `02x02y4488`), rows, and columns; unique index on `code` prevents duplicates
- **Reproducible rendering** — generic renderer draws a meander from its `code`, `rows`, `columns` whenever index pages are built; nothing is stored as SVG
- **HTML output** — `output/index.html` (jump list) and `output/patterns/*.html` (one page per pattern characteristic) rebuilt on every draw run, gitignored

**Entry points:**

- `nx run meanderaw-cli:migration:run` — builds/updates `meanders` table
- `nx run meanderaw-cli:start` — full enumeration draw run (clears and regenerates)
- `nx run meanderaw-cli:start --args="--rows <n> --columns <n> --code <code>"` — single meander draw
- `projects/meanderaw/meanderaw-web` — TanStack Start SSR web application for browsing

---

## Shared Infrastructure

All four domains use the workspace's shared packages:

| Package | Purpose |
|---------|---------|
| `@codebase/persistence` | Postgres connection fragments (`<PROJECT>_POSTGRES_*`), TypeORM options/module, base entities, Testcontainers harness, migration targets, export/import |
| `@codebase/interface` | GraphQL Relay types, cursor helpers, entity-to-GraphQL contract, client codegen config |
| `@codebase/presentation` | React component library (shadcn/ui + Base UI primitives) |
| `@codebase/observability` | Pino-backed NestJS `LoggerService` and `LoggerModule` |

Each domain gets its own database, schema, and role (e.g., `caelundas_development` / `caelundas` / `caelundas_username`), created by the local Postgres container on first volume start.
