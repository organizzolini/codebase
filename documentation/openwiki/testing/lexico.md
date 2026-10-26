---
type: testing
title: Lexico Testing
description: Documents lexico's testing strategy across its CLI, web, API, and entities packages using vitest, GraphQL mock servers, testcontainers for Postgres, and React Testing Library.
tags: [testing, lexico, vitest, graphql, testcontainers, react-testing-library]
sources:
  - id: openwiki-source-cffe8ea3d9a4c39bbbf89d4a
    resource: repo://projects/common/interface/README.md
  - id: openwiki-source-5941305f85850497c69b4b90
    resource: repo://projects/lexico/lexico-api/testing/author-text-application.ts
  - id: openwiki-source-e333ff138b80fb25ac5c837b
    resource: repo://projects/lexico/lexico-api/testing/author-text-catalog.ts
  - id: openwiki-source-4c401cda8dafa7f504abdfae
    resource: repo://projects/lexico/lexico-api/testing/database.ts
  - id: openwiki-source-53b69eb1c1be9d9e2e9908b9
    resource: repo://projects/lexico/lexico-api/testing/graphql-application.ts
  - id: openwiki-source-aecc874db36a40857e6340f7
    resource: repo://projects/lexico/lexico-api/testing/literature-services.ts
  - id: openwiki-source-937e740fdf9044bd5840f532
    resource: repo://projects/lexico/lexico-api/testing/reading-application.ts
  - id: openwiki-source-785573dc01acf8d1452fda8e
    resource: repo://projects/lexico/lexico-api/testing/reading-passage.ts
  - id: openwiki-source-319f71514ed17e9d88071e3a
    resource: repo://projects/lexico/lexico-api/testing/relay-connection-walk.ts
  - id: openwiki-source-75ac35aaad6df33076ee8763
    resource: repo://projects/lexico/lexico-api/testing/setup.ts
  - id: openwiki-source-a096d23536f18081c5f5e693
    resource: repo://projects/lexico/lexico-api/testing/word-lookups.ts
  - id: openwiki-source-f8a91499153a8ad6af0a64a6
    resource: repo://projects/lexico/lexico-cli/testing/command-harness.ts
  - id: openwiki-source-f4137c6e39c9b2ae35ea6f43
    resource: repo://projects/lexico/lexico-cli/testing/mocks.ts
  - id: openwiki-source-10e0af1182e16146cc6e573c
    resource: repo://projects/lexico/lexico-cli/testing/setup.ts
  - id: openwiki-source-f83e010925a0641b1e318a65
    resource: repo://projects/lexico/lexico-entities/src/modules/entities/entities.module.integration.test.ts
  - id: openwiki-source-e1bca19e105caebed53977d0
    resource: repo://projects/lexico/lexico-entities/testing/entity-definition-assertions.ts
  - id: openwiki-source-f8b0268cfe9fb710540dac8b
    resource: repo://projects/lexico/lexico-entities/testing/setup.ts
  - id: openwiki-source-b9108d2fc15726287e4f9485
    resource: repo://projects/lexico/lexico-web/src/routes/search.integration.test.tsx
  - id: openwiki-source-2f30e0452aaed0b78a567808
    resource: repo://projects/lexico/lexico-web/testing/render-route.tsx
  - id: openwiki-source-a57103ba766db49a188a1605
    resource: repo://projects/lexico/lexico-web/testing/setup.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Lexico Testing

Lexico organizes its tests into four packages, each with a testing module that provides harnesses, fixtures, and shared setup. All packages use **vitest** as the test runner. The API and entities packages spin up real Postgres containers via **testcontainers** through the shared `@codebase/persistence/testing` module. The web package uses **MSW** (via `@codebase/interface/testing`) to mock GraphQL responses and **React Testing Library** with **TanStack Start** integration for route rendering. The CLI package uses NestJS testing utilities with mocked repositories and Cheerio helpers for HTML/XML parsing.

## Package Structure

| Package | Testing Entry Point | Key Harnesses |
|---------|--------------------|---------------|
| `lexico-api` | `projects/lexico/lexico-api/testing/` | `startLexicoGraphqlApplication`, `startAuthorTextApplication`, `startReadingApplication` |
| `lexico-cli` | `projects/lexico/lexico-cli/testing/` | `createCommandTestHarness`, `runCommandLine` |
| `lexico-entities` | `projects/lexico/lexico-entities/testing/` | `entity-definition-assertions.ts` for TypeORM metadata validation |
| `lexico-web` | `projects/lexico/lexico-web/testing/` | `renderRoute` for TanStack Start route integration |

---

## API Testing: GraphQL Resolver Tests with `graphqlMockServer`

The API package provides two testing approaches:

### 1. Full Application Integration Tests

`startLexicoGraphqlApplication` (and its specialized variants `startAuthorTextApplication` and `startReadingApplication`) boots a complete NestJS application with Apollo GraphQL over Express against a **real migrated Postgres container** started via testcontainers. This is used for end-to-end and integration tests that need the full request lifecycle.

```typescript
// From graphql-application.ts
export async function startLexicoGraphqlApplication(
  modules: NonNullable<ModuleMetadata["imports"]>,
): Promise<LexicoGraphqlApplication> {
  const database = await startDatabaseTestingModule({
    database: LexicoDatabaseModule,
    entities: [],
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({ autoSchemaFile: true, ... }),
      ...modules,
    ],
    migrations: [...LEXICO_DATABASE_MIGRATIONS],
    project: "lexico",
    validate: (config) => environmentSchema.parse(config),
  });
  // Returns { query, repository, stop }
}
```

**Usage in tests** (e.g., `authors.resolver.integration.test.ts`):

```typescript
beforeAll(async () => {
  database = await startLexicoDatabaseTestingModule([Author, Line, Text, Token, Word]);
  catalog = await seedAuthorTextCatalog(database);
  const { createLoader, service } = createLiteratureServices(database);
  resolver = new AuthorsResolver(service, createLoader());
}, DATABASE_TIMEOUT_MILLISECONDS);
```

### 2. GraphQL Mock Server for Unit Tests

For unit tests that don't need a database, the API uses `graphqlMockServer` from `@codebase/interface/testing` (documented in `projects/common/interface/README.md`). This provides MSW handlers that answer GraphQL requests with typed mocks.

```typescript
// From interface/testing (referenced in web tests)
- For a client: `graphqlMockServer` with `startGraphqlMockServer`, `resetGraphqlMockServer`, and `stopGraphqlMockServer`
- For a server: `paginateArray`, `paginationMatrix`, `expectedPage`, and `summarize`
```

### Test Fixtures and Seeding

The API testing module includes rich seeding utilities:

- **`author-text-catalog.ts`**: Seeds a three-level hierarchy (Vergil → Aeneid → Book I/II → Proem → Lines) plus flat-author bibliographies. Provides `AuthorTextCatalog` with typed references to seeded entities.
- **`word-lookups.ts`**: Seeds ambiguous word forms (`rosae` = 3 forms of one noun; `est` = shared by two verbs) and a soft-deleted word.
- **`reading-passage.ts`**: Seeds a full literature passage with tokens, lines, and text hierarchy.
- **`literature-services.ts`**: Creates service and loader instances wired to the test database.
- **`relay-connection-walk.ts`**: Helpers for walking Relay-style connections (`walkForward`, `walkBackward`, `nodesOf`).

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

- **TypeORM Repository Mocks**: `createRepositoryMock<Entity>()` with fully configured `createQueryBuilder` chain
- **Prompts Mocking**: `mockDates()`, `mockStandardInputTerminal()`, `setPromptsMockResponse()`, `setPromptsMockResponseOnce()`
- **Cheerio Helpers**: `loadCheerioElement()`, `loadCheerioWithRoot()`, `loadCheerioXmlElement()`, `loadCheerioXmlWithRoot()` for parsing HTML/XML test fixtures

**Example** (from `lexico-ingestion.command.unit.test.ts`):

```typescript
const { promptsMock } = vi.hoisted(() => ({
  promptsMock: vi.fn<() => Promise<Record<string, boolean>>>(),
}));
vi.mock("prompts", () => ({ default: promptsMock }));

beforeAll(async () => {
  setPromptsMockResponse(promptsMock, { value: true });
  const module = await Test.createTestingModule({
    providers: [
      LexicoIngestionCommand,
      { provide: LoggerService, useValue: createMock<LoggerService>() },
      { provide: CorpusScriptorumEcclesiasticorumLatinorumCommand, useValue: createMock<...>() },
      // ... other sub-commands mocked
    ],
  }).compile();
});
```

---

## Entities Testing: TypeORM Entity Tests with Testcontainers

The entities package validates TypeORM entity definitions and integration with real Postgres.

### Entity Definition Assertions

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

### Integration Tests with Testcontainers

`entities.module.integration.test.ts` spins up a real Postgres container via `@codebase/persistence/testing` and verifies:

1. **Module graph evaluation**: Each entity file imports cleanly under SWC with decorator metadata emitted
2. **Service integration**: `EntitiesService` CRUD operations against real database
3. **Migration compatibility**: Schema generated by migrations matches entity decorators

```typescript
// From entities.module.integration.test.ts
it.concurrent.each(ENTITY_FILES)(
  "evaluates %s as an entry point with decorator metadata",
  async (entityFile) => {
    await expect(
      importInFreshProcess(path.join(ENTITIES_DIRECTORY, entityFile)),
    ).resolves.not.toContain("Error");
  },
  IMPORT_TIMEOUT_MILLISECONDS,
);
```

The `importInFreshProcess` helper runs each entity in a separate Node process with `@swc-node/register` to ensure decorator metadata is available (vitest's transform doesn't emit it).

---

## Web Testing: TanStack Start Integration Tests with React Testing Library

The web package tests routes using TanStack Start's router with an in-memory history, rendered via React Testing Library.

### Route Rendering Harness

```typescript
// From render-route.tsx
export async function renderRoute(path: string): Promise<void> {
  const router = getRouter();
  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [path] }),
    scrollRestoration: false,
  });
  await router.load();
  render(<RouterProvider router={router} />);
}
```

### Global Test Setup

`setup.ts` configures the test environment:

1. **Mocks `createServerFn`** from `@tanstack/react-start` to call handlers directly (server functions don't run in test environment)
2. **Stubs `window.matchMedia`** for components that read it on render
3. **Starts/stops MSW GraphQL mock server** from `@codebase/interface/testing`:
   - `beforeAll`: `startGraphqlMockServer()`
   - `afterEach`: `cleanup()` + `resetGraphqlMockServer()`
   - `afterAll`: `stopGraphqlMockServer()`

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
  await renderRoute("/search?query=amo");
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
| **Environment stubbing** | API, Entities | `vi.stubEnv("POSTGRES_DB", "postgres")` etc. in database setup |

### Running Tests

```bash
# API
nx run lexico-api:vitest

# CLI
nx run lexico-cli:vitest

# Entities
nx run lexico-entities:vitest

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
| **End-to-end** | `*.end-to-end.test.ts` | Full HTTP server via `startLexicoGraphqlApplication` / `startAuthorTextApplication` |

### lexico-cli

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.ts` | `createCommandTestHarness`, mocked sub-commands |
| **End-to-end** | `*.end-to-end.test.ts` | `runCommandLine` with real nest-commander runner |

### lexico-entities

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.ts` | `entity-definition-assertions`, mocked repositories |
| **Integration** | `*.integration.test.ts` | Real Postgres via `startDatabaseTestingModule` |

### lexico-web

| Category | Examples | Uses |
|----------|----------|------|
| **Unit** | `*.unit.test.tsx` | React Testing Library, MSW for component queries |
| **Integration** | `*.integration.test.tsx` | `renderRoute` with TanStack Start router, MSW for route loaders |

---

## Related Pages

- [Domain: Lexico](../domain/lexico.md) — Lexico domain overview
- [Testing: Integration](../testing/integration.md) — Cross-package integration testing patterns
- [Testing: Overview](../testing/overview.md) — General testing principles and tooling
