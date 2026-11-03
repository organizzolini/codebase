---
type: domain
title: Lexico — Latin-English Dictionary Suite
description: Four-project suite (lexico-cli, lexico-entities, lexico-api, lexico-web) that scrapes Latin dictionary and literature sources into Postgres, exposes them via a Relay-paginated GraphQL API, and renders search via TanStack Start SSR.
tags: [latin, dictionary, graphql, nestjs, tanstack, ingestion, relay]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-cffe8ea3d9a4c39bbbf89d4a
    resource: repo://projects/common/interface/README.md
  - id: openwiki-source-5f3e5fd7adac683aca8996b8
    resource: repo://projects/lexico/lexico-api/README.md
  - id: openwiki-source-5b4fa122bb0f24668e50959b
    resource: repo://projects/lexico/lexico-api/src/lexico-api.module.ts
  - id: openwiki-source-3bdbf3345e8015b4a1cf3d99
    resource: repo://projects/lexico/lexico-api/src/modules/lexemes/lexeme.entities.ts
  - id: openwiki-source-912fe26f73983cba4a5f0e7b
    resource: repo://projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts
  - id: openwiki-source-0bf962d4b829277613510224
    resource: repo://projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts
  - id: openwiki-source-29f2810db4c223b268105bcc
    resource: repo://projects/lexico/lexico-api/src/modules/search/search.service.ts
  - id: openwiki-source-5e40db637ff9cea3eb6ab5fe
    resource: repo://projects/lexico/lexico-cli/README.md
  - id: openwiki-source-1c96ca3526446eb357f2cfd8
    resource: repo://projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts
  - id: openwiki-source-7a510b540ce8d31fa655c72a
    resource: repo://projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts
  - id: openwiki-source-21e8cd86f65328ec0cc787e2
    resource: repo://projects/lexico/lexico-cli/src/modules/library/library.command.ts
  - id: openwiki-source-0413e6d3c67dc3d345eebc77
    resource: repo://projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts
  - id: openwiki-source-05cc736189be2ff51a83e912
    resource: repo://projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts
  - id: openwiki-source-e5c8eaa71052567df73086b5
    resource: repo://projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts
  - id: openwiki-source-e8182980d939873c3102c725
    resource: repo://projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts
  - id: openwiki-source-90c63621715af0d615812115
    resource: repo://projects/lexico/lexico-cli/src/modules/literature/literature.command.ts
  - id: openwiki-source-12e2a7148f8283d761134b05
    resource: repo://projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts
  - id: openwiki-source-f57e87962098814771e94b3a
    resource: repo://projects/lexico/lexico-entities/README.md
  - id: openwiki-source-68484052635cbea3c13fef17
    resource: repo://projects/lexico/lexico-entities/src/modules/entities/dictionary/form/adjectival-form.entity.ts
  - id: openwiki-source-65ebce7a35a866e0cee30a3b
    resource: repo://projects/lexico/lexico-entities/src/modules/entities/dictionary/inflection/adjective-inflection.entity.ts
  - id: openwiki-source-cbca90a5ed54cecf99d6ea3f
    resource: repo://projects/lexico/lexico-web/README.md
  - id: openwiki-source-285050fb501154943e7f78e7
    resource: repo://projects/lexico/lexico-web/src/routes/search.tsx
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---

# Lexico — Latin-English Dictionary Suite

Lexico is a four-project suite that builds a Latin–English dictionary from public sources, serves it over GraphQL, and presents it in a server-rendered React application.

## Project Overview

| Project | Role | Technology |
|---------|------|------------|
| **lexico-entities** | Single source of truth for the database schema: TypeORM entities, PostgreSQL migrations, shared grammatical enumerations. | TypeORM, PostgreSQL |
| **lexico-cli** | NestJS command-line ingestion pipeline. Scrapes/loads dictionary and literature sources into the `lexico` schema. | NestJS, `nest-commander`, cheerio |
| **lexico-api** | NestJS GraphQL API. Exposes dictionary and literature entities via Relay cursor connections, with DataLoaders to prevent N+1 queries. | NestJS, Apollo, `@nestjs/graphql`, `nestjs-graphql-connection` |
| **lexico-web** | TanStack Start SSR web application. File-based routing, server functions call the GraphQL API, UI from shared `presentation` component library. | TanStack Start, React 19, Tailwind, TanStack Router |

All projects share the `lexico` PostgreSQL schema (database `lexico_development`, role `lexico_username`). The schema is defined **only** in `lexico-entities`; both the CLI (writer) and the API (reader) depend on that package, so the written and read shapes cannot drift.

---

## Data Model (lexico-entities)

The schema splits into a **dictionary** half and a **literature** half. Every entity extends `DeletableEntity` from `@codebase/persistence`, which supplies a `uuidv7()` primary key, `createdAt/updatedAt/deletedAt` timestamps, and `*By` audit columns.

### Dictionary Entities

| Entity | Purpose | Notes |
|--------|---------|-------|
| `Word` | A surface form / headword a reader looks up. | |
| `Lexeme` | A lexical entry (sense), joined to words through `WordLexeme`. | Core dictionary unit. |
| `Form` | One inflected form, joined to words through `WordForm`. | **Single-table hierarchy**: `AdjectivalForm`, `AdverbForm`, `FiniteVerbForm`, `GerundForm`, `InfinitiveForm`, `NominalForm`, `ParticipleForm`, `SupineForm`. |
| `Inflection` | How a lexeme inflects. | **Single-table hierarchy**: `AdjectiveInflection`, `AdverbInflection`, `NounInflection`, `PrepositionInflection`, `VerbInflection`, `UninflectedInflection`. |
| `PrincipalPart` | Citation principal parts for verbs/nouns. | |
| `Translation` | An English sense/gloss. | |
| `Pronunciation` | Classical and ecclesiastical variants. | |

### Literature Entities

| Entity | Purpose |
|--------|---------|
| `Author` | Classical author. |
| `Text` | One work (can be nested via self-referential parent). |
| `Line` | A line of a work. |
| `Token` | One word occurrence, linking a line back to the dictionary (`Word`). |

### Grammatical Enumerations

Every grammatical axis (case, gender, number, person, tense, mood, voice, degree, declension, conjugation) is exported as both a runtime value array and a TypeScript union type (`FormCaseValues`/`FormCase`, `VerbConjugationValues`/`VerbConjugation`, etc.). Validation, GraphQL enums, and exhaustive switches all read from the same source.

### Naming Strategy

`LexicoNamingStrategy` maps entity/column names to the database's convention, so table names stay predictable across migrations. No entity names a schema; it comes from `LEXICO_POSTGRES_SCHEMA`.

### Migrations

```bash
nx run lexico-entities:migration:generate   # Diff entities → new migration
nx run lexico-entities:migration:run        # Apply pending migrations
nx run lexico-entities:migration:revert     # Roll back the last one
```

Generated migrations emit `-up.sql` and `-down.sql` alongside the TypeScript file; both are linted by `sqlfluff` and checked by `squawk`.

---

## Ingestion Pipeline (lexico-cli)

A NestJS CLI application built with `nest-commander`. The root command (`LexicoIngestionCommand`) prompts for any stage flags not provided on the command line, then runs the selected stages in order.

### Six Ingestion Stages (+ Clear)

| Stage Flag | Command | Source / Action |
|------------|---------|-----------------|
| `--wikipedia` | `wiktionary` | Wiktionary page dumps (raw HTML cached locally as `data/wiktionary/*.json`). |
| `--dictionary` | `dictionary` | Dictionary entries, forms, inflections. Resumable by `--startLemma` / `--endLemma` (lemma range). |
| `--library-sources` | `perseus`, `latin-library`, `corpus-scriptorum-ecclesiasticorum-latinorum`, `epigraphik-datenbank-clauss-slaby` | Upstream sources each work came from (downloads and normalizes to markdown). |
| `--library` | `library` | Library of works (author/text metadata). |
| `--literature` | `literature` | Lines and tokens for loaded texts. |
| — | `clear` | Truncates all ingested tables for a clean start. |

**Resumability**: The dictionary stage processes cached Wiktionary JSON files (`data/wiktionary/*.json`) within an optional lemma range. A run that stops mid-way resumes by pointing `--startLemma` at the last processed lemma.

**Prompt behavior**: A missing flag value (bare `--startLemma`, or omitted `--provider`/`--author`/`--text` on `library`/`literature`) is prompted for **only when stdin is a terminal**; otherwise the command takes its default (no bound / "All"). A cancelled prompt exits non-zero.

### Module-per-Source Architecture

Each source has its own module under `src/modules/` containing:
- Fetcher (downloads raw data)
- Parser for that source's markup (HTML via `cheerio`, wiki markup via `mdast`)
- Mapping into `lexico-entities` entities

This isolates layout changes: a change to one site's HTML is contained to one module.

### Source Modules Detail

#### Wiktionary (`src/modules/wiktionary/`)
Downloads all Latin Wiktionary category pages and stores each article's HTML as a JSON file under `./data/wiktionary`, following pagination until every page in every configured category is exhausted.
- **Categories**: lemma, verb, noun, adjective, adverb, etc. (defined in `wiktionary.constants.ts`)
- **Resumability**: Skips words that already have a cached JSON file.
- **Rate limiting**: 500ms delay between requests, exponential backoff on HTTP 429.
- **Output**: `data/wiktionary/<word>.json` containing `{ category, href, word, html }`

#### Dictionary (`src/modules/dictionary/`)
Ingests cached Wiktionary pages into lexemes, resolves cross-translation references, and applies manual dictionary corrections.
- **Input**: `data/wiktionary/*.json` files
- **Resumable range**: `--startLemma` / `--endLemma` filter files by lemma name
- **Processing flow**: `ingestAll()` → `processFile()` → `ingestLexeme()` → `LexemesService.parseLexemes()` (cheerio parses `p:has(strong.Latn.headword)` sections) → `LexemesService.enrichLexeme()` (pronunciation, forms, translations, principal parts, etymology)
- **Translation references**: Recursive resolution of `*{reference}*` patterns in translations to existing lexemes
- **Error logging**: Failed files logged to `output/dictionary-<timestamp>.log`

#### Perseus (`src/modules/perseus/`)
Downloads and parses texts from the Perseus Digital Library.
- **Provider**: Implements `LibrarySourceProvider` interface for the library pipeline
- **Output**: Normalized markdown files under `data/library/perseus/<author>/<text>.md`

#### Latin Library (`src/modules/latin-library/`)
Scrapes The Latin Library (thelatinlibrary.com) for classical Latin texts.
- **Provider**: Implements `LibrarySourceProvider` interface
- **Output**: Normalized markdown files under `data/library/latin-library/<author>/<text>.md`

#### Corpus Scriptorum Ecclesiasticorum Latinorum (`src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/`)
Downloads ecclesiastical Latin texts from CSEL.
- **Provider**: Implements `LibrarySourceProvider` interface
- **Output**: Normalized markdown files under `data/library/corpus-scriptorum-ecclesiasticorum-latinorum/<author>/<text>.md`

#### Epigraphik Datenbank Clauss-Slaby (`src/modules/epigraphik-datenbank-clauss-slaby/`)
Ingests Latin inscriptions from EDCS.
- **Provider**: Implements `LibrarySourceProvider` interface
- **Output**: Normalized markdown files under `data/library/epigraphik-datenbank-clauss-slaby/<author>/<text>.md`

#### Library (`src/modules/library/`)
Runs configured library source providers and writes normalized markdown files into the local `data/library` tree.
- **Provider orchestration**: Selects provider(s), author(s), and text(s) via CLI options with terminal prompts
- **Deduplication**: By provider priority (perseus > CSEL > thelatinlibrary > EDCS) for same author/text
- **Scanning**: `scanLibrary()` walks `data/library` to build catalog for subsequent stages

#### Literature (`src/modules/literature/`)
Ingests markdown texts from `data/library` into literature entities with provider-aware deduplication.
- **Input**: Markdown files from `data/library/<provider>/<author>/.../<text>.md`
- **Deduplication**: Same as library stage (by provider priority)
- **Filtering**: `--provider`, `--author`, `--text` options with terminal prompts
- **Processing**: `ingestAllAuthors()` parses markdown → creates `Author`, `Text`, `Line`, `Token` entities
- **Token linking**: Each `Token` links back to `Word` entity in dictionary

#### Forms, Inflections, Principal Parts, Pronunciation, Etymology, Translations, Words
Supporting modules that parse specific grammatical data from Wiktionary HTML:
- **Forms** (`src/modules/forms/`): Parses inflection tables into `Form` entity hierarchy
- **Inflections** (`src/modules/inflections/`): Parses inflection patterns into `Inflection` entity hierarchy
- **Principal Parts** (`src/modules/principal-parts/`): Extracts verb/noun principal parts
- **Pronunciation** (`src/modules/pronunciation/`): Classical + ecclesiastical phoneme classifiers
- **Etymology** (`src/modules/etymology/`): Extracts etymology sections
- **Translations** (`src/modules/translations/`): Parses translation glosses and resolves cross-references
- **Words** (`src/modules/words/`): Manages `Word` and `WordLexeme`/`WordForm` join tables

### Execution Flow

```
LexicoIngestionCommand.run()
  ├─ ClearService.clearDictionary()
  ├─ WiktionaryService.ingestWiktionary()        # --wikipedia
  ├─ DictionaryService.ingestAll()               # --dictionary
  │     └─ ManualService.ingestManual()          # Manual corrections
  ├─ LibrarySourcesStage.runLibrarySources()     # --library-sources
  │     ├─ PerseusCommand.run()
  │     ├─ LatinLibraryCommand.run()
  │     ├─ CorpusScriptorumEcclesiasticorumLatinorumCommand.run()
  │     └─ EpigraphikDatenbankClaussSlabyCommand.run()
  ├─ LibraryCommand.run()                        # --library
  └─ LiteratureCommand.run()                     # --literature
```

Sub-commands: `wiktionary`, `dictionary`, `words`, `clear`, `perseus`, `latin-library`, `corpus-scriptorum-ecclesiasticorum-latinorum`, `epigraphik-datenbank-clauss-slaby`, `library`, `literature`, `manual`, `numerals`, `part-of-speech`.

### Moving Data Between Databases

The CLI does not copy tables. Use the persistence package's CLI:
```bash
nx run persistence:start:export --args="--source-uri postgresql://user:password@localhost:5432/lexico_development --schema lexico --table words --data --ddl --file ../lexico/lexico-cli/data/lexico.dump"
nx run persistence:start:import --args="--target-uri postgresql://user:password@localhost:5432/lexico_development --schema lexico --file ../lexico/lexico-cli/data/lexico.dump --clean"
```
Run `import --dry-run` first to preview drops/truncates.

---

## GraphQL API (lexico-api)

NestJS + Apollo Server (`ApolloDriver`), code-first schema emitted to `src/schema.gql` (gitignored). Runs on `http://localhost:5003/graphql` by default.

### Architecture

- **Root module** (`LexicoApiModule`) imports: `DatabaseModule` (from `lexico-entities`), `GraphQLModule`, `HealthModule`, `LexemesModule`, `LiteratureModule`, `SearchModule`, `WordsModule`, `MacronsModule`.
- **Global modules**: `LoggerModule` (from `@codebase/observability`, pino-backed, `Scope.TRANSIENT`), `ConfigModule` (Zod-validated env).
- **Pagination**: Relay connections via `nestjs-graphql-connection`. All list queries return `Connection<T>` with `Edge<T>` and `PageInfo`.
- **Cursors**: Opaque Base64 (`toCursor`/`fromCursor`/`fromCursorSafe` from `@codebase/interface`) and offset-based (`encodeOffsetCursor`/`decodeOffsetCursor`).
- **DataLoaders**: Request-scoped `dataloader` instances for all relation fields (prevents N+1). Loaders live in `<domain>.loader.ts` and are registered in module `providers` + `exports`.
- **Entity → GraphQL mapping**: Each API module defines its own GraphQL object types (e.g., `LexemeType` in `lexemes/lexeme.entities.ts`) implementing `GraphQLObjectOf<Entity, Self, DatabaseOnlyField, RelationField>` from `src/lexico-api.types.ts`. This type contract **fails compilation** if:
  - An entity column is neither declared nor explicitly excluded (`*DatabaseOnlyField` union).
  - A declared field's type differs from its column.
  - Relation fields (`*RelationField` union) don't preserve cardinality/nullability.
- **Resolvers never return entities**. Module `*.utilities.ts` maps entity → GraphQL type (e.g., `toLexemeType`), copying only declared fields; unjoined relations stay unset.
- **Interface resolution**: `Form` and `Inflection` are GraphQL interfaces resolved by the concrete class a row maps to; their object types registered as `ORPHANED_GRAPHQL_TYPES` in `lexemes.constants.ts`.

### Modules & Resolvers

| Module | Resolvers | Key Queries |
|--------|-----------|-------------|
| `LexemesModule` | `LexemesResolver` | `lexeme(id)`, `lexemes(ids)`, `lexemesConnection` (Relay) |
| `WordsModule` | `WordsResolver`, `WordFormResolver`, `WordLexemeResolver` | `word(data)`, `words(datas)`, `wordForm(form)`, `wordLexeme(lexeme)` |
| `LiteratureModule` | `AuthorsResolver`, `TextsResolver`, `LinesResolver`, `TokensResolver`, `LiteratureResolver` | `author(s)`, `text(s)`, `lines`, `tokens`, `searchLiterature` (aggregates authors/texts/lines) |
| `SearchModule` | `SearchResolver` | `searchLatin(args)`, `searchEnglish(args)` — tiered Latin search (enclitic parsing, fuzzy), English full-text + substring |
| `HealthModule` | `HealthResolver` | `health` (boolean) |
| `MacronsModule` | — | Macrons service (diacritic handling for search) |

### Relay Pagination Implementation

`paginateQuery` (in `literature/literature.utilities.ts`) is the shared SQL-backed pagination utility:
- Converts `first`/`after`/`before` into keyset bounds on sort key + id.
- `decodeCursor` reads the row a cursor claims; `readCursorId` extracts entity id.
- `paginateQueryByParent` batches child connections for many parents at once (used by `LiteratureRelationsLoader` for `author→texts`, `text→lines`, `text→childTexts`, `line→tokens`).

The pagination uses a CTE-based approach:
1. Materializes filtered rows with `sortKey` and `id`
2. Reads cursor-claimed rows as CTEs
3. Computes total count, window, and hasRowBefore in single statement
4. Loads entities in chunks (configurable `LOAD_CHUNK_SIZE`)

### Search Details

- **Latin search** (`SearchService.searchLatin`): tiered — headword/word matches → enclitic decomposition → lemma pattern ranking → fuzzy fallback. Returns `Connection<LexemeSearchResult>` with match metadata (source tier, score, identifiers).
- **English search** (`SearchService.searchEnglish`): full-text on `Translation.translationFullTextSearch` + substring on definitions. Same Relay connection shape.
- Both use `paginateRankedLexemes` → `paginateQuery` for cursor paging.

### Testing Strategy

Three tiers, co-located with source:
| Tier | Pattern | Target |
|------|---------|--------|
| Unit | `*.unit.test.ts` | Resolver/service methods with mocked DI |
| Integration | `*.integration.test.ts` | Database queries, external API clients (Testcontainers PostgreSQL) |
| End-to-end | `*.end-to-end.test.ts` | Full GraphQL request/response cycles |

Shared test utilities in `testing/` (`graphql-application.ts`, `database.ts`, `author-text-catalog.ts`, `reading-application.ts`, `relay-connection-walk.ts`, `word-lookups.ts`, `mocks.ts`).

---

## Web Application (lexico-web)

TanStack Start (SSR) + TanStack Router (file-based routing) + React 19 + Tailwind CSS 4. UI components from `@codebase/presentation` (shadcn/ui + Base UI primitives).

### Routes

File-based under `src/routes/`:
- `__root.tsx` — document shell, sidebar layout
- `index.tsx` — `/` redirects to `/search`
- `search.tsx` — `/search` loader + server function + page

Route tree generated to `src/routeTree.gen.ts` (never edited).

### Data Flow: Search Page

1. Route loader (`search.tsx`) calls a **server function** defined beside the route.
2. Server function runs **both** API queries in parallel: `searchLatin` + `searchEnglish`.
3. Results merged client-side, best-first (Latin exact matches ranked higher).
4. First render is already populated (SSR).

GraphQL documents live in `src/graphql/operations/*.graphql`; GraphQL Code Generator emits:
- Operation types
- Zod validators
- MSW mock handlers for tests
to `src/graphql/generated/`.

### Server Functions

TanStack Start server functions = type-safe RPC client→server. Defined in route file or `src/modules/<feature>/<feature>.utilities.ts` (for unit testing without Start runtime). Called from route `loader` (GET) or component via `useServerFn` (POST) + `router.invalidate()`.

### Component Structure

```
src/
├── routes/              # File-based routes
├── components/          # One component + test per file
├── hooks/               # use-<hook>.ts
├── modules/             # Server functions + utilities
├── styles/              # application.css (accent over shadcn tokens)
├── client.tsx           # Hydration entry
└── router.tsx           # Router factory
```

### Commands

```bash
nx run lexico-web:start         # Dev server (http://localhost:7797)
nx run lexico-web:build         # Production SSR bundle
nx run lexico-web:preview       # Serve production build
nx run lexico-web:codegen       # Generate GraphQL artifacts
nx run lexico-web:codegen-watch # Regenerate on schema/ops change
nx run lexico-web:codometer     # Bundle size gate
nx run lexico-web:vitest        # Unit/integration/e2e
```

---

## Shared Interface Package

`@codebase/interface` (in `projects/common/interface`) provides the **GraphQL contract** shared between server and client:

### `@codebase/interface` (graphql-server)
- Relay primitives: `Connection`, `Edge`, `PageInfo`, `createConnection`, `createEdge`, `mapConnection`
- Cursors: `toCursor`, `fromCursor`, `fromCursorSafe`, `encodeOffsetCursor`, `decodeOffsetCursor`
- Entity→GraphQL mapping: `mapRelation`, `mapRelationConnection`, `mapNullable*`, `GraphQLObjectOf`, `GraphQLFields`, `MappedFields`, `RelationKey`
- Pagination mixins: `Paginated`, `createEdgeType`

### `@codebase/interface/client` (graphql-client)
- `createGraphqlCodegenConfig` — shared GraphQL Code Generator config. A client passes only its API's schema URL and gets typed operations, Zod validators, MSW handlers.

### `@codebase/interface/testing`
- Client: `graphqlMockServer`, `startGraphqlMockServer`, `resetGraphqlMockServer`, `stopGraphqlMockServer` (MSW)
- Server: `paginateArray`, `paginationMatrix`, `expectedPage`, `summarize` (SQL-backed pagination oracle)

---

## Environment Variables

All projects read **only** `LEXICO_POSTGRES_*` (never the root `POSTGRES_*`, which are the shared container's admin login). Validated via Zod schemas in each project's `.constants.ts`.

| Variable | Default | Used By |
|----------|---------|---------|
| `LEXICO_POSTGRES_HOST` | `localhost` | All |
| `LEXICO_POSTGRES_PORT` | `5432` | All |
| `LEXICO_POSTGRES_USERNAME` | `lexico_username` | All |
| `LEXICO_POSTGRES_PASSWORD` | `lexico_password` | All |
| `LEXICO_POSTGRES_DATABASE` | `lexico_development` | All |
| `LEXICO_POSTGRES_SCHEMA` | `lexico` | `lexico-entities`, `lexico-api`, `lexico-cli` |
| `LEXICO_API_URL` | `http://localhost:5003/graphql` | `lexico-web` |

---

## Development Workflow

### First-time Setup

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres (from workspace root)
docker compose up -d postgres

# 3. Create role/database/schema (if needed)
docker exec -e POSTGRES_PROJECTS=lexico postgres sh /docker-entrypoint-initdb.d/databases.sh

# 4. Run migrations
nx run lexico-entities:migration:run

# 5. Start API
nx run lexico-api:start      # http://localhost:5003/graphql

# 6. Start web (separate terminal)
nx run lexico-web:start      # http://localhost:7797

# 7. Run ingestion (optional, to populate data)
nx run lexico-cli:start -- --dictionary --literature
```

### Common Commands

```bash
# Typecheck all
nx run lexico-entities:typecheck
nx run lexico-cli:typecheck
nx run lexico-api:typecheck
nx run lexico-web:typecheck

# Lint + format
nx run lexico-entities:lint-code
nx run lexico-cli:lint-code
nx run lexico-api:lint-code
nx run lexico-web:lint-code

# Test
nx run lexico-entities:vitest:unit
nx run lexico-entities:vitest:integration
nx run lexico-cli:vitest
nx run lexico-api:vitest:unit
nx run lexico-api:vitest:integration
nx run lexico-api:vitest:end-to-end
nx run lexico-web:vitest
```

---

## Related Documentation

- [Architecture: Common Packages](../architecture/common-packages.md) — shared `persistence`, `observability`, `interface`, `presentation`
- [Domain Overview](../domain/overview.md) — workspace domain map
- [Local Development](../operations/local-development.md) — Docker, env, Nx
- [Lexico Testing](../testing/lexico.md) — test patterns, Testcontainers, MSW
- [Database Management](../operations/database-management.md) — migration workflows

---

## License

MIT — see [LICENSE](../../../LICENSE).
