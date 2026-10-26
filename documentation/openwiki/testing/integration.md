---
type: concept
title: Integration Testing Patterns
description: Cross-project integration testing patterns using Testcontainers Postgres, GraphQL mock servers, Nx affected test runs, and workspace-wide validation with production-equivalent wiring.
tags: [testing, integration, testcontainers, graphql, nx, persistence]
sources:
  - id: openwiki-source-343a267167db0186d4c7a103
    resource: repo://.agents/skills/create-pull-request/SKILL.md
  - id: openwiki-source-4cfef24d7967ddef88357d1c
    resource: repo://.agents/skills/testing-mocks/SKILL.md
  - id: openwiki-source-db7eb71a3306403209a370a4
    resource: repo://.agents/skills/testing-strategy/SKILL.md
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-c226aa5c7f690262741b3f25
    resource: repo://projects/common/interface/testing/graphql-mock-server.ts
  - id: openwiki-source-79e7b4ee4ecfb08c4edc2d59
    resource: repo://projects/common/interface/testing/pagination.ts
  - id: openwiki-source-bb47f0ae03a5325f0d8fdea7
    resource: repo://projects/common/persistence/README.md
  - id: openwiki-source-a688f65f433758aea382c292
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts
  - id: openwiki-source-4808dd4ba16cde901f5bc82f
    resource: repo://projects/common/persistence/testing/persistence-testing.utilities.ts
  - id: openwiki-source-02549341c8e1ccbd9077c65c
    resource: repo://projects/lexico/lexico-api/src/modules/search/search.service.integration.test.ts
  - id: openwiki-source-b9108d2fc15726287e4f9485
    resource: repo://projects/lexico/lexico-web/src/routes/search.integration.test.tsx
  - id: openwiki-source-d2bcabd613e9901cd5519864
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-run.command.integration.test.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Integration Testing Patterns

This document describes the integration testing patterns used across the workspace. Integration tests exercise real infrastructure (Postgres, GraphQL) through the same module wiring as production, validating schema migrations, pagination logic, and cross-service behavior.

## Testcontainers Postgres

The `@codebase/persistence/testing` entry provides `startPostgresContainer`, which starts a throwaway `postgres:18-alpine` container (falling back to Google's Docker Hub mirror) laid out exactly like the local Docker development environment:

- A `<project>_username` role owning a `<project>_testing` database
- A `<project>` schema inside that database
- The project's real migrations run against the container before tests begin

This means **every integration suite exercises the project's migrations**, catching schema drift early.

### `startPostgresContainer`

```ts
import { startPostgresContainer } from "@codebase/persistence/testing";
import { CreateWidgets1767225600000 } from "./testing/fixtures/migrations/1767225600000-create-widgets";

const container = await startPostgresContainer({
  migrations: [CreateWidgets1767225600000],
  project: "fixture",
});

// container.connection  – the project's role connection (never admin)
// container.environment – <PROJECT>_POSTGRES_* variables for ConfigModule
// await container.stop() – stops the container
```

The container runs migrations as the project's role (not the admin user), then disconnects. The returned `connection` and `environment` are the same shape a `PostgresqlModule.forRoot` expects.

**Key behaviors:**
- Falls back through `POSTGRES_CONTAINER_IMAGES` when one image fails to pull
- Fails with the migration's own error when a migration fails
- Requires Docker to be running

### `startDatabaseTestingModule`

For tests that need a full NestJS module connected to the database, `startDatabaseTestingModule` wraps `startPostgresContainer` and compiles a testing module with:

- Global `ConfigModule` reading the container's `<PROJECT>_POSTGRES_*` from `process.env`
- `PostgresqlModule.forRoot` (or the project's own database module passed as `database`)
- `TypeOrmModule.forFeature(entities)` for repositories
- Any additional `imports` and `providers` under test

```ts
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

const database = await startDatabaseTestingModule({
  entities: [Meander],
  imports: [DrawingModule],
  migrations: [InitialMigration1767225600000],
  project: "meanderaw",
  providers: [DrawCommand],
  validate: (config) => environmentSchema.parse(config),
});

const meanders = database.repository(Meander);
const command = database.module.get(DrawCommand);
// database.dataSource, database.container also available

await database.close(); // closes module, stops container, restores process.env
```

**Options:**
- `project` — names the role, `_testing` database, schema, and env vars
- `entities` — registered with `TypeOrmModule.forFeature`
- `migrations` — run by the container before the module boots
- `imports` / `providers` — modules and providers under test
- `database` — the project's own `<Project>PostgresqlModule` (avoids double connection)
- `namingStrategy` — replaces snake case (incompatible with `database`)
- `validate` — application's environment validation (e.g., `environmentSchema.parse`)
- `images` — overrides the container images tried, in order

The `close` method tears down everything and restores the entire `process.env`.

### Integration Tests Use Production Wiring

Integration tests connect through the **exact same persistence/module wiring as production**: `PostgresqlModule.forRoot`, `ConfigModule`, TypeORM `DataSource`, and the project's real migrations. No test-only shortcuts or in-memory substitutes. This ensures the test validates the actual production code path.

## GraphQL Mock Server

The `@codebase/interface/testing` entry exports `graphqlMockServer`, an [MSW](https://mswjs.io/) server that client tests use to answer GraphQL requests. It provides a lifecycle API and typed handlers generated by GraphQL Code Generator.

### Lifecycle

```ts
import {
  graphqlMockServer,
  startGraphqlMockServer,
  resetGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";

// In a test file:
beforeAll(() => startGraphqlMockServer());    // starts MSW, fails unhandled requests
afterEach(() => resetGraphqlMockServer());    // drops test-added handlers
afterAll(() => stopGraphqlMockServer());      // stops MSW
```

- `startGraphqlMockServer()` — calls `listen({ onUnhandledRequest: "error" })` so any request without a handler fails the test
- `resetGraphqlMockServer()` — calls `resetHandlers()`, leaving only the base handlers
- `stopGraphqlMockServer()` — calls `close()`

### Usage in Client Tests

```ts
import { graphqlMockServer } from "@codebase/interface/testing";
import { mockSearchLatinQuery } from "../graphql/generated/mocks";
import { HttpResponse } from "msw";

graphqlMockServer.use(
  mockSearchLatinQuery(() =>
    HttpResponse.json({ data: { searchLatin: answer(latin) } })
  )
);
```

Tests add handlers via `graphqlMockServer.use()` using the typed mock functions that code generation emits. This keeps the contract between client and server validated in tests.

## Server-Side Pagination Oracle

For server (API) integration tests, `@codebase/interface/testing` provides an **in-memory pagination oracle** that SQL-backed pagination must agree with on every boundary. This was the original slicing logic before pagination moved into SQL, preserved as the ground truth.

### Core Functions

| Function | Purpose |
|----------|---------|
| `paginateArray(items, { after, before, first, last, getCursor })` | Slices an array per Relay pagination args — the oracle |
| `expectedPage(ids, request, cursorOf?)` | Returns a `PageSummary` (ids, cursors, hasNext/PreviousPage, totalCount) for a given request |
| `paginationMatrix(ids, outsiderId, options?)` | Generates a comprehensive matrix of cursor/count combinations worth testing |
| `summarize(connection)` | Reduces a GraphQL connection to observable `PageSummary` |

### `paginationMatrix` Coverage

The matrix pins:
- First, middle, and last member cursors
- An outsider ID (not in the set)
- An undecodable cursor
- Non-canonical cursor encodings
- Ordered, equal, and crossed `after`/`before` pairs
- Combined with limits: `{}`, `{first:0}`, `{first:2}`, `{first:-1}`, `{last:0}`, `{last:2}`, `{last:-1}`, `{first:2,last:1}`

A `quick` option keeps only the middle member, outsider, and one pair for faster runs.

### Integration Test Pattern

```ts
import {
  expectedPage,
  paginationMatrix,
  summarize,
} from "@codebase/interface/testing";
import { toCursor } from "@codebase/interface";

const all = await service.searchLatin("query");
const ids = all.edges.map((e) => e.node.lexeme.id);
const scores = new Map(all.edges.map((e) => [e.node.lexeme.id, e.node.score]));
const cursorOf = (id: string) => toCursor({ id, score: scores.get(id) ?? 0 });

for (const pagination of paginationMatrix(ids, outsiderId, { cursorOf })) {
  const result = await service.searchLatin("query", pagination);
  expect(summarize(result)).toStrictEqual(expectedPage(ids, pagination, cursorOf));
}
```

This asserts that **every page boundary** of the SQL pagination matches the in-memory oracle.

## Nx Affected Testing

The workspace uses `nx affected` to run only tests for projects touched by a change and their dependents. This is the standard CI and local validation command:

```bash
# Run all affected tests (unit + integration)
nx affected --target=vitest --base=main

# With coverage gates
nx affected --target=vitest --configuration=coverage --base=main
```

### Test Configurations

Each project defines `vitest` targets for different test types:

```bash
nx run <project>:vitest:unit
nx run <project>:vitest:integration
nx run <project>:vitest:end-to-end
```

The `nx affected --target=vitest` command runs **all** vitest configurations (unit, integration, e2e) for affected projects. This is the command used in CI, pre-push hooks, and the `validate-code` skill.

### Why Affected Testing Matters

- **Speed**: Only re-runs tests for changed code and its dependents
- **Correctness**: Nx computes the project graph and knows which projects transitively depend on what changed
- **CI efficiency**: The same command runs locally and in CI with identical semantics

## Mocking Patterns in Integration Tests

Integration tests combine real infrastructure (Postgres via Testcontainers) with selective mocking of external services or complex dependencies using `@golevelup/ts-vitest`'s `createMock<T>()`.

### Pattern: Mock External Services, Use Real Database

```ts
import { createMock } from "@golevelup/ts-vitest";
import { LoggerService } from "@codebase/observability";
import { DrawCodeService } from "./draw-code.service";

const { writes } = vi.hoisted(() => ({ writes: new Map<string, string>() }));

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(async (path, data) => {
    let page = "";
    for await (const piece of data) page += piece;
    writes.set(path, page);
  }),
}));

const drawRun = await startDrawRun([
  { provide: DrawCodeService, useValue: createMock<DrawCodeService>() },
  { provide: LoggerService, useValue: createMock<LoggerService>() },
]);
```

- `createMock<T>()` auto-mocks any class/interface — **never write manual stubs**
- Declare mock variables at `describe` scope, instantiate in `beforeAll`
- Use `vi.hoisted()` for mocks that must exist before module import
- Mock external I/O (filesystem, HTTP) while keeping the database real

### Repository Mocks in NestJS DI

```ts
import { getRepositoryToken } from "@nestjs/typeorm";
import { createMock } from "@golevelup/ts-vitest";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type { Repository } from "typeorm";

const module = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: getRepositoryToken(MyEntity),
      useValue: createMock<Repository<MyEntity>>() satisfies DeepMocked<Repository<MyEntity>>,
    },
  ],
}).compile();

const repository = module.get(getRepositoryToken(MyEntity)) as DeepMocked<Repository<MyEntity>>;
repository.findOneBy.mockResolvedValue(myFixture);
```

- Use `getRepositoryToken(Entity)` as the provider token
- Put mocks in `providers`, never in `imports`
- Annotate with `DeepMocked<T>` for type safety and ESLint compliance

## Test File Organization

- **Unit**: `*.unit.test.ts` — isolated, fast, mocked dependencies
- **Integration**: `*.integration.test.ts` — real Postgres, real module wiring, selective mocks
- **End-to-end**: `*.end-to-end.test.ts` — full application stack (rare)

Integration tests live beside the code they test (e.g., `src/modules/search/search.service.integration.test.ts`).

## Running Integration Tests

```bash
# Single project integration tests
nx run lexico-api:vitest:integration

# Affected integration tests (CI standard)
nx affected --target=vitest --base=main

# With coverage
nx affected --target=vitest --configuration=coverage --base=main
```

Docker must be running for Testcontainers-based tests.

## Related Pages

- [Testing Overview](overview.md)
- [Affirmancy Testing](affirmancy.md)
<!-- openwiki: broken internal link [caelundas.md] file "caelundas.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Caelundas Testing](caelundas.md)
- [Lexico Testing](lexico.md)
- [Meanderaw Testing](meanderaw.md)
