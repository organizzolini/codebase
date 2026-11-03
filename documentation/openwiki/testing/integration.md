---
type: "Reference"
title: "Integration Testing"
openwiki_generated: true
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-db7eb71a3306403209a370a4
    resource: repo://.agents/skills/testing-strategy/SKILL.md
  - id: openwiki-source-cb3df90b3af3b7ee2f16c98e
    resource: repo://.agents/skills/triage-integration/SKILL.md
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-bbab45af4bebcbd50cf915b0
    resource: repo://integration/src/integration.main.end-to-end.test.ts
  - id: openwiki-source-c226aa5c7f690262741b3f25
    resource: repo://projects/common/interface/testing/graphql-mock-server.ts
  - id: openwiki-source-79e7b4ee4ecfb08c4edc2d59
    resource: repo://projects/common/interface/testing/pagination.ts
  - id: openwiki-source-a688f65f433758aea382c292
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts
  - id: openwiki-source-4808dd4ba16cde901f5bc82f
    resource: repo://projects/common/persistence/testing/persistence-testing.utilities.ts
  - id: openwiki-source-d2bcabd613e9901cd5519864
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-run.command.integration.test.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---


# Integration Testing

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

## CI Integration Test Sharding (4 Legs)

In CI, the `test-code` target is split into four parallel legs so no single leg waits for the slowest projects. This is configured in `.github/workflows/continuous-integration.yml`:

| Leg | Name | Shard | Excludes |
|-----|------|-------|----------|
| 1 | Test | — | `meanderaw-cli`, `projects/caelundas/**`, `projects/ic-suite/**` |
| 2 | Test Caelundas | `caelundas` | `*,!projects/caelundas/**` |
| 3 | Test Meanderaw | `meanderaw-cli` | `*,!meanderaw-cli` |
| 4 | Test IC Suite | `ic-suite` | `*,!projects/ic-suite/**` |

**Rationale (from CI workflow comments):**
- Meanderaw alone took over seven minutes uncached beside the rest, and about three minutes alone
- ic-suite's 37 packages were most of what remained
- Caelundas's command line cannot start until its ephemeris download finishes, so it ran last and alone for four more minutes
- The fourth leg ("everything else") keeps the `Test` name branch protection has always required
- A leg with nothing affected runs nothing

Each leg runs with `--configuration=coverage` and `--parallel=4`. The `setup-codebase` composite action installs the Postgres client only for the primary `test-code` leg (`matrix.check.target == 'test-code' && !matrix.check.shard`).

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

## End-to-End Tests in the `integration` Project

The `integration` project itself has an end-to-end test (`integration.main.end-to-end.test.ts`) that spawns the real CLI entrypoint (`integration/src/integration.main.ts`) and verifies:

1. The NestJS command container boots without DI resolution errors
2. All 12 CI commands are registered (`adopt-task-database`, `bound-base-to-push`, `cleanup-codebase`, `collect-codometer-baseline`, `import-pr-task-cache`, `keep-task-database`, `merge-task-cache`, `report-codometer-changes`, `run-affected`, `setup-codebase`, `upgrade-dependencies`, `verify-task-database`)
3. Environment schema validation works with defaults

This is the highest seam test for the CI plumbing commands.

## Diagnosing CI Integration Failures

The **triage-integration** skill covers diagnosing and fixing codebase integration failures, whether they occur locally (Husky pre-commit/pre-push hooks, lint-staged) or remotely (GitHub Actions CI workflows). Key procedures:

### Local Submission Failure
```bash
NX_PERF_LOGGING=false lint-staged --config configuration/lint-staged.config.ts --continue-on-error
```

### CI Workflow Failure
```bash
gh run view <run-id> --log-failed
# or fetch all failing runs for current PR
gh pr checks --json name,state,link --jq '.[] | select(.state == "FAILURE") | "\(.name) \(.link)"'
```

### Step-by-Step Triage
1. **Identify the failing hook** (pre-commit, commit-msg, pre-push) or **CI target** (typecheck-code, lint-code, test-code, guard-code, secure-code, build-projects)
2. **Read the error output** — determine which Nx target failed and which project(s)
3. **Locate relevant configuration** — use the triage-integration skill's configuration tables
4. **Apply targeted fixes** — auto-fix with `--configuration=write` where available, manual fixes for typecheck, spell-check, etc.
5. **Validate fixes** — run the exact failing target with `--configuration=check`
6. **Leave files unstaged** for user review

**Critical rule**: After applying fixes with `--configuration=write`, you MUST validate with `--configuration=check` but MUST NOT run `lint-staged`, `git commit`, or `git push`.

## Related Pages

- [Testing Overview](overview.md)
- [Affirmancy Testing](affirmancy.md)
- [Caelundas Testing](caelundas.md)
- [Lexico Testing](lexico.md)
- [Meanderaw Testing](meanderaw.md)
- [Architecture: Common Packages](../architecture/common-packages.md)
- [Operations: Database Management](../operations/database-management.md)
- [Workflows: CI/CD](../workflows/ci-cd.md)
