---
type: testing
title: Lexico Testing
description: Documents lexico's testing strategy across its CLI, web, API, and db packages using vitest, GraphQL mock servers, testcontainers for Postgres, and React Testing Library.
tags: [testing, lexico, vitest, graphql, testcontainers, react-testing-library]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-25T18:55:00.444Z
sources:
  - id: openwiki-source-fb04b392a5b00efed2344b4b
    resource: repo://projects/common/interface/testing/graphql-mock-server/graphql-mock-server.utilities.ts
  - id: openwiki-source-d43cf1b76d511df31f2fb62d
    resource: repo://projects/common/persistence/testing/database-testing/database-testing.utilities.ts
  - id: openwiki-source-0f5884c35255bb2fdbdf4700
    resource: repo://projects/lexico/lexico-api/configuration/vitest.config.ts
  - id: openwiki-source-fa9e446c4eb1ff126c49f88e
    resource: repo://projects/lexico/lexico-api/testing/applications/author-text-application.ts
  - id: openwiki-source-c3974265f7a8e508460abacb
    resource: repo://projects/lexico/lexico-api/testing/applications/graphql-application.ts
  - id: openwiki-source-29c6fc87aa7543951ec549f0
    resource: repo://projects/lexico/lexico-api/testing/applications/reading-application.ts
  - id: openwiki-source-4c401cda8dafa7f504abdfae
    resource: repo://projects/lexico/lexico-api/testing/database.ts
  - id: openwiki-source-096b7babdf2598facd381c8f
    resource: repo://projects/lexico/lexico-api/testing/fixtures/author-text-catalog.ts
  - id: openwiki-source-1403685bd38199be8ea86fab
    resource: repo://projects/lexico/lexico-api/testing/fixtures/reading-passage.ts
  - id: openwiki-source-931363c6f5149c0713ec1280
    resource: repo://projects/lexico/lexico-api/testing/literature-search-pagination.ts
  - id: openwiki-source-aecc874db36a40857e6340f7
    resource: repo://projects/lexico/lexico-api/testing/literature-services.ts
  - id: openwiki-source-319f71514ed17e9d88071e3a
    resource: repo://projects/lexico/lexico-api/testing/relay-connection-walk.ts
  - id: openwiki-source-a096d23536f18081c5f5e693
    resource: repo://projects/lexico/lexico-api/testing/word-lookups.ts
  - id: openwiki-source-a940f3afbe351816194157ea
    resource: repo://projects/lexico/lexico-cli/configuration/vitest.config.ts
  - id: openwiki-source-f8a91499153a8ad6af0a64a6
    resource: repo://projects/lexico/lexico-cli/testing/command-harness.ts
  - id: openwiki-source-f4137c6e39c9b2ae35ea6f43
    resource: repo://projects/lexico/lexico-cli/testing/mocks.ts
  - id: openwiki-source-005b9828b5c7157a3c7ed44c
    resource: repo://projects/lexico/lexico-db/src/modules/database/database.entities.integration.test.ts
  - id: openwiki-source-2d136d9694b769f300d2a4d8
    resource: repo://projects/lexico/lexico-db/src/modules/database/database.module.integration.test.ts
  - id: openwiki-source-c045047f522293751de1ac56
    resource: repo://projects/lexico/lexico-db/testing/entity-definition-assertions.ts
  - id: openwiki-source-e88a583329f0fa0a7421ddff
    resource: repo://projects/lexico/lexico-web/configuration/vitest.config.ts
  - id: openwiki-source-b9108d2fc15726287e4f9485
    resource: repo://projects/lexico/lexico-web/src/routes/search.integration.test.tsx
  - id: openwiki-source-a57103ba766db49a188a1605
    resource: repo://projects/lexico/lexico-web/testing/setup.ts
generated: { by: "openwiki/0.9.0", at: "2026-11-25T18:55:00.444Z" }
---

# Lexico Testing

Lexico organizes its tests into four packages, each with a testing module that provides harnesses, fixtures, and shared setup. All packages use **vitest** as the test runner. The API and db packages spin up real Postgres containers via **testcontainers** through the shared `@codebase/persistence/testing` module. The web package uses **MSW** (via `@codebase/interface/testing`) to mock GraphQL responses and **React Testing Library** with **TanStack Start** integration for route rendering. The CLI package uses NestJS testing utilities with mocked repositories and Cheerio helpers for HTML/XML parsing.

## Package Structure

| Package | Testing Entry Point | Key Harnesses |
|---------|--------------------|---------------|
| `lexico-api` | `projects/lexico/lexico-api/testing/` | `startLexicoGraphqlApplication`, `startAuthorTextApplication`, `startReadingApplication`, `startLexicoDatabaseTestingModule` |
| `lexico-cli` | `projects/lexico/lexico-cli/testing/` | `createCommandTestHarness`, `runCommandLine` |
| `lexico-db` | `projects/lexico/lexico-db/testing/` | `entity-definition-assertions.ts` for TypeORM metadata validation; integration tests in `src/modules/database/` |
| `lexico-web` | `projects/lexico/lexico-web/testing/` | `renderRoute` for TanStack Start route integration; MSW lifecycle in `setup.ts` |

---

## API Testing: GraphQL Resolver Tests

The API package provides three testing approaches, ranging from full end-to-end to pure unit tests. Testing utilities live under `projects/lexico/lexico-api/testing/` with subdirectories `applications/` for application-level harnesses and `fixtures/` for seeding utilities.

### 1. Full Application End-to-End Tests

`startLexicoGraphqlApplication` (in `applications/graphql-application.ts`) boots a complete NestJS application with Apollo GraphQL over Express against a **real migrated Postgres container** started via testcontainers. This is used for end-to-end tests that need the full HTTP request lifecycle.

```typescript
// From applications/graphql-application.ts
export async function startLexicoGraphqlApplication(
  modules: NonNullable<ModuleMetadata["imports"]>,
): Promise<LexicoGraphqlApplication> {
  const database = await startDatabaseTestingModule({
    database: LexicoDatabaseModule,
    entities: [],
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({
        autoSchemaFile: true,
        buildSchemaOptions: { orphanedTypes: [...ORPHANED_GRAPHQL_TYPES] },
        driver: ApolloDriver,
        playground: false,
      }),
      ...modules,
    ],
    migrations: [...LEXICO_DATABASE_MIGRATIONS],
    project: "lexico",
    validate: (config) => environmentSchema.parse(config),
  });
  // Returns { query, repository, stop }
}
```

The returned `LexicoGraphqlApplication` exposes:
- `query(document, variables)` — posts GraphQL operations to the running server
- `repository` — direct TypeORM repository access for assertions
- `stop()` — closes the HTTP server and database container

### 2. Specialized Seeded Applications

Two higher-level harnesses seed domain-specific data before booting the API (both in `applications/`):

- **`startAuthorTextApplication`** (`author-text-application.ts`) — seeds a three-level author/text/line hierarchy (Vergil → Aeneid → Book I/II → Proem → Lines) plus flat-author bibliographies via `seedAuthorTextCatalog`, then boots the full `LexicoApiModule`
- **`startReadingApplication`** (`reading-application.ts`) — seeds a complete literature passage with tokens, lines, and text hierarchy via `seedReadingPassage`, then serves only the `LiteratureModule` under a minimal root module

Both return an `execute` function for GraphQL operations plus the seeded catalog/passage for assertions.

### 3. GraphQL Mock Server for Unit Tests

For unit tests that don't need a database, the API uses `graphqlMockServer` from `@codebase/interface/testing`. This provides an MSW server that answers GraphQL requests with typed mocks. Tests add handlers via `graphqlMockServer.use()` using the generated mock helpers.

```typescript
// From @codebase/interface/testing
export const graphqlMockServer = setupServer();

export function startGraphqlMockServer(): void {
  graphqlMockServer.listen({ onUnhandledRequest: "error" });
}
export function resetGraphqlMockServer(): void {
  graphqlMockServer.resetHandlers();
}
export function stopGraphqlMockServer(): void {
  graphqlMockServer.close();
}
```

### Test Fixtures and Seeding (`fixtures/`)

The API testing module includes rich seeding utilities in `fixtures/`:

- **`author-text-catalog.ts`** — seeds a three-level hierarchy (Vergil → Aeneid → Book I/II → Proem → Lines) plus flat-author bibliographies. Provides `AuthorTextCatalog` with typed references to seeded entities.
- **`word-lookups.ts`** — seeds ambiguous word forms (`rosae` = 3 forms of one noun; `est` = shared by two verbs) and a soft-deleted word.
- **`reading-passage.ts`** — seeds a full literature passage with tokens, lines, and text hierarchy (Aeneid opening, five lines inserted out of order).
- **`literature-services.ts`** — creates service and loader instances wired to the test database.
- **`relay-connection-walk.ts`** — helpers for walking Relay-style connections (`walkForward`, `walkBackward`, `nodesOf`).
- **`library-catalog.ts`** — seeds a library hierarchy for library browsing tests.
- **`literature-search-corpus.ts`** — seeds a larger corpus for search pagination tests.
- **`word-candidates-passage.ts`** — seeds word candidate data for reading tests.

### Relay Cursor Pagination Verification

The `literature-search-pagination.ts` module provides an **oracle-based pagination test** that verifies SQL pagination matches in-memory array slicing:

```typescript
// From literature-search-pagination.ts
export async function expectLiteratureSearchPagination(
  fetchPage: FetchLiteratureSearchPage,
  pageSize: number,
): Promise<string[]> {
  const everything = await fetchPage({});
  const ids = pageIds(everything);

  expect(everything.totalCount).toBe(ids.length);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.length).toBeGreaterThan(pageSize);

  await expect(walkForward(fetchPage, pageSize, ids.length)).resolves.toStrictEqual(ids);
  await expect(walkBackward(fetchPage, pageSize, ids.length)).resolves.toStrictEqual(ids);

  return ids;
}
```

The `paginationMatrix` function from `@codebase/interface/testing` generates comprehensive cursor/count combinations (first, last, both, zero, negative, crossed pairs, non-canonical encodings) to stress-test boundary conditions.

---

## CLI Testing: Ingestion Stage Tests with Mocked Sources

The CLI package tests commands using NestJS's `Test.createTestingModule` with mocked dependencies. The testing module provides:

### Command Test Harness

```typescript
// From command-harness.ts
export async function createCommandTestHarness<CommandType>({
  additionalProviders = [],
  commandType,
}: CreateCommandTestHarnessOptions<CommandType>): Promise<CommandTestHarness<CommandType>> {
  const testingModule = await Test.createTestingModule({
    providers: [
      commandType,
      { provide: LoggerService, useValue: createMock<LoggerService>() },
      ...additionalProviders,
    ],
  }).compile();
  // Returns { command, logger, testingModule }
}
```

### Real Command Line Execution

```typescript
// Runs argv through nest-commander exactly as the CLI does
export async function runCommandLine({ argv, providers }: RunCommandLineOptions): Promise<void>
```

### Mocks for Ingestion Testing (`mocks.ts`)

The CLI testing module provides extensive mocks for ingestion pipeline testing:

- **TypeORM Repository Mocks**: `createRepositoryMock<Entity>()` with a fully configured `createQueryBuilder` chain (all chainable methods return `this`, terminal methods left for per-test configuration)
- **Prompts Mocking**: `mockDates()`, `mockStandardInputTerminal()`, `setPromptsMockResponse()`, `setPromptsMockResponseOnce()`
- **Cheerio Helpers**: `loadCheerioElement()`, `loadCheerioWithRoot()`, `loadCheerioXmlElement()`, `loadCheerioXmlWithRoot()` for parsing HTML/XML test fixtures

---

## Database Testing: TypeORM Entity Integration Tests with Testcontainers

The db package validates TypeORM entity definitions against a real Postgres database and verifies schema compatibility with migrations.

### Entity Definition Assertions (Unit Tests)

`entity-definition-assertions.ts` provides compile-time metadata assertions against TypeORM's decorator storage:

```typescript
// Validates entity registry matches expected classes
export function assertEntityRegistryMatches(
  actualEntities: readonly EntityClass[],
  expectedEntities: readonly EntityClass[],
): void

// Asserts relation options (cascade, eager, nullable, onDelete, onUpdate, orphanedRowAction)
export function assertRelationOptions(
  relationMetadata: EntityRelationMetadata,
  expectedOptions: Partial<RelationOptionSubset>,
): void
```

Helper functions include `getEntityRelationMetadata`, `getEntityRelations`, `getEntityTableMetadata` for querying TypeORM's metadata storage.

### Integration Tests with Testcontainers

`src/modules/database/database.entities.integration.test.ts` spins up a real Postgres container via `@codebase/persistence/testing` and verifies:

1. **Schema compatibility**: Migration-generated schema matches entity decorators (no pending schema changes after migrations)
2. **Database session**: Connection uses the correct role (`lexico_username`) and database (`lexico_testing`)
3. **UUID generation**: New rows receive `uuidv7` ids from the database
4. **Bigint indexes**: Line and token indexes store as `bigint` and read back as numbers
5. **Tables, indexes, and constraints**: Every entity maps to the expected table with expected indexes and unique constraints
6. **Entity registration**: All entities are registered with TypeORM metadata
7. **Relationship definitions**: Key relationships (Text.author, Text.lines, Token.line/text/word) are defined

```typescript
// From database.entities.integration.test.ts
describe("entity integration schema", () => {
  beforeAll(async () => {
    container = await startPostgresContainer({
      migrations: [...LEXICO_DATABASE_MIGRATIONS],
      project: "lexico",
    });
    vi.stubEnv("POSTGRES_DB", "postgres");
    vi.stubEnv("POSTGRES_USER", "postgres");

    integrationDataSource = createDataSource(
      { entities: [...DATABASE_ENTITIES], migrations: [...LEXICO_DATABASE_MIGRATIONS], project: "lexico" },
      { ...process.env, ...container.environment },
    );
    await integrationDataSource.initialize();
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  it("builds the schema from the migration alone, leaving nothing for the entities to change", async () => {
    const pending = await integrationDataSource.driver.createSchemaBuilder().log();
    expect(pending.upQueries.map(({ query }) => query)).toStrictEqual([]);
  });
  // ... more tests
});
```

A separate test file `database.module.integration.test.ts` validates that each entity file imports cleanly under SWC with decorator metadata emitted, using `importInFreshProcess` to run each entity in a separate Node process with `@swc-node/register`.

---

## Web Testing: TanStack Start Integration Tests with React Testing Library

The web package tests routes using TanStack Start's router with an in-memory history, rendered via React Testing Library.

### Route Rendering Harness

Routes render through the shared `renderRoute(router, path)` helper from `@codebase/testing/react`, which gives the router a `createMemoryHistory({ initialEntries: [path] })`, loads it, and renders it with React Testing Library:

```typescript
// From search.integration.test.tsx
import { renderRoute } from "@codebase/testing/react";

await renderRoute(getRouter(), "/search?query=amo");
```

The real root renders a whole `<html>` document, which cannot mount inside a test's `<div>`, so the shared helper renders routes under a bare root.

### Global Test Setup (`testing/setup.ts`)

`lexico-web/testing/setup.ts` extends the shared jsdom setup (`@codebase/testing/react/setup`):

1. **Stands in for `createServerFn`** from `@tanstack/react-start` with the shared `createServerFunctionStandIn`, which hands the handler back to be called directly (server functions only run inside the Start runtime)
2. **Stubs `window.matchMedia`** with the shared `matchMediaStandIn`
3. **Stubs `ResizeObserver`** and `Element.prototype.scrollIntoView` for components that depend on layout
4. **Starts/stops the MSW GraphQL mock server** from `@codebase/interface/testing`:
   - `beforeAll`: `startGraphqlMockServer()`
   - `afterEach`: `resetGraphqlMockServer()`
   - `afterAll`: `stopGraphqlMockServer()`

```typescript
// From testing/setup.ts
vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createServerFn: createServerFunctionStandIn,
}));

vi.stubGlobal("matchMedia", matchMediaStandIn);
vi.stubGlobal("ResizeObserver", class { /* ... */ });
Element.prototype.scrollIntoView = vi.fn<Element["scrollIntoView"]>();

beforeAll(() => { startGraphqlMockServer(); });
afterEach(() => { resetGraphqlMockServer(); });
afterAll(() => { stopGraphqlMockServer(); });
```

### GraphQL Codegen for Typed MSW Handlers

The web package uses GraphQL Codegen (`configuration/codegen.ts`) to generate typed MSW mock helpers from the API schema:

```typescript
// From configuration/codegen.ts
import { createGraphqlCodegenConfig } from "@codebase/interface/client";

const config: CodegenConfig = createGraphqlCodegenConfig({
  schema: "../lexico-api/src/schema.gql",
  validators: false,
});
```

This produces typed mock functions like `mockSearchLatinQuery`, `mockSearchEnglishQuery` that tests use with `graphqlMockServer.use()`.

### Integration Test Example

```typescript
// From search.integration.test.tsx
import { graphqlMockServer } from "@codebase/interface/testing";
import { mockSearchLatinQuery, mockSearchEnglishQuery } from "../graphql/generated/mocks";

function stubSearch(latin: [string, number][], english: [string, number][]): void {
  graphqlMockServer.use(
    mockSearchLatinQuery(() => HttpResponse.json({ data: { searchLatin: answer(latin) } })),
    mockSearchEnglishQuery(() => HttpResponse.json({ data: { searchEnglish: answer(english) } })),
  );
}

it("shows Latin and English matches together, best first", async () => {
  stubSearch([["amo", 2], ["amor", 1]], [["love", 3], ["amo", 5]]);
  await renderRoute(getRouter(), "/search?query=amo");
  const cards = await screen.findAllByTestId("lexeme-card");
  expect(cards.map((card) => card.textContent)).toStrictEqual([
    expect.stringContaining("amo"),
    expect.stringContaining("love"),
    expect.stringContaining("amor"),
  ]);
});
```

### Unit Tests

Component unit tests (e.g., `lexeme-card.unit.test.tsx`, `search-bar.unit.test.tsx`) use standard React Testing Library patterns with MSW handlers for any GraphQL queries the component triggers.

---

## Shared Testing Infrastructure

### Common Patterns

| Pattern | Package | Implementation |
|---------|---------|----------------|
| **Test timeout** | All | `DATABASE_TIMEOUT_MILLISECONDS = 120_000` for container startup |
| **Console suppression** | All | `vi.spyOn(console, "log").mockImplementation(() => {})` in `beforeEach` |
| **Mock cleanup** | All | `vi.clearAllMocks()` in `beforeEach` |
| **Environment stubbing** | API, DB | `vi.stubEnv("POSTGRES_DB", "postgres")` etc. in database setup |
| **SWC decorator metadata** | DB | Separate Node process with `@swc-node/register` for import tests |
| **MSW lifecycle** | Web, API (unit) | `startGraphqlMockServer`/`resetGraphqlMockServer`/`stopGraphqlMockServer` from `@codebase/interface/testing` |

### Running Tests

```bash
# API
nx run lexico-api:vitest

# CLI
nx run lexico-cli:vitest

# DB (entities)
nx run lexico-db:vitest

# Web
nx run lexico-web:vitest

# Interface (provides graphqlMockServer)
nx run interface:vitest
```

---

## Test Categories by Package

### lexico-api

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.ts` | Mocked repositories, `graphqlMockServer` |
| **Integration** | `*.integration.test.ts` | Real Postgres via `startLexicoDatabaseTestingModule` |
| **End-to-end** | `*.end-to-end.test.ts` | Full HTTP server via `startLexicoGraphqlApplication` / `startAuthorTextApplication` / `startReadingApplication` |

### lexico-cli

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.ts` | `createCommandTestHarness`, mocked sub-commands, repository mocks |
| **End-to-end** | `*.end-to-end.test.ts` | `runCommandLine` with real nest-commander runner |

### lexico-db

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.ts` | `entity-definition-assertions`, mocked repositories |
| **Integration** | `*.integration.test.ts` (in `src/modules/database/`) | Real Postgres via `startPostgresContainer`, schema verification against migrations |

### lexico-web

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.tsx` | React Testing Library, MSW for component queries |
| **Integration** | `*.integration.test.tsx` | `renderRoute` with TanStack Start router, MSW for route loaders |

---

## Related Pages

- [Domain: Lexico](../domain/lexico.md) — Lexico domain overview
- [Testing: Overview](../testing/overview.md) — General testing principles and tooling
