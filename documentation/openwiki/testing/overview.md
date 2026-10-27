---
type: "Reference"
title: "Testing Strategy Overview"
description: "High-level testing strategy: test targets (vitest:unit, vitest:integration, vitest:end-to-end), coverage gates, the testing-strategy skill, and CI test sharding. Explains persistence testing helpers (testcontainers Postgres) and MSW/GraphQL codegen for lexico-web."
tags: ["testing", "strategy", "ci", "vitest", "coverage", "testcontainers", "graphql", "msw"]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-ab09db9d0408f67f5441bda9
    resource: repo://.agents/skills/test-driven-development/SKILL.md
  - id: openwiki-source-4cfef24d7967ddef88357d1c
    resource: repo://.agents/skills/testing-mocks/SKILL.md
  - id: openwiki-source-db7eb71a3306403209a370a4
    resource: repo://.agents/skills/testing-strategy/SKILL.md
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-9352839a473daa8b8f2309be
    resource: repo://projects/common/interface/src/modules/graphql-client/graphql-client.constants.ts
  - id: openwiki-source-882dec87f9be719705f89e96
    resource: repo://projects/common/interface/src/modules/graphql-client/graphql-client.utilities.ts
  - id: openwiki-source-c226aa5c7f690262741b3f25
    resource: repo://projects/common/interface/testing/graphql-mock-server.ts
  - id: openwiki-source-656ec5fd6b299f80e2256a7b
    resource: repo://projects/common/interface/testing/index.ts
  - id: openwiki-source-79e7b4ee4ecfb08c4edc2d59
    resource: repo://projects/common/interface/testing/pagination.ts
  - id: openwiki-source-a688f65f433758aea382c292
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts
  - id: openwiki-source-4808dd4ba16cde901f5bc82f
    resource: repo://projects/common/persistence/testing/persistence-testing.utilities.ts
  - id: openwiki-source-6dfd545d8e86700444b57ad8
    resource: repo://projects/lexico/lexico-web/codegen.ts
  - id: openwiki-source-cbca90a5ed54cecf99d6ea3f
    resource: repo://projects/lexico/lexico-web/README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Testing Strategy Overview

This document summarizes the workspace's testing philosophy, conventions, and tooling. It is the entry point for understanding how tests are written, organized, executed, and validated across all projects.

## Core Philosophy

**Tests must accompany code.** No production code is merged without a corresponding test that was written first and watched fail. The workspace enforces **Test-Driven Development (TDD)** with a strict red–green–refactor cycle:

- **RED** – Write a minimal failing test that describes the desired behavior. Verify it fails for the right reason (feature missing, not a typo).
- **GREEN** – Write the minimal implementation to make the test pass. Verify the test passes and the full project suite stays green.
- **REFACTOR** – Clean up duplication, improve names, extract helpers. **Refactoring is a separate step** after green; never add behavior during refactor.

<!-- openwiki: broken internal link [../.agents/skills/test-driven-development/SKILL.md] file "../.agents/skills/test-driven-development/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
The TDD cycle is non-negotiable for new features, bug fixes, refactoring, and behavior changes. Exceptions (throwaway prototypes, generated code, configuration files) require explicit human partner approval. See the [test-driven-development skill](../.agents/skills/test-driven-development/SKILL.md) for the complete rules and common rationalizations to avoid.

## Test Types and Naming

| Type | File Pattern | Purpose |
|------|--------------|---------|
| **Unit** | `*.unit.test.ts` | Isolated, fast, mocked dependencies. Tests one unit of behavior. |
| **Integration** | `*.integration.test.ts` | Real Postgres via Testcontainers, real module wiring, selective mocks for external I/O. |
| **End-to-end** | `*.end-to-end.test.ts` | Full application stack (rare). |

Test files live beside the code they test (e.g., `src/modules/search/search.service.integration.test.ts`).

## Running Tests

Tests are executed via Nx targets per project:

```bash
# Unit tests for a project
nx run <project>:vitest:unit

# Integration tests for a project
nx run <project>:vitest:integration

# End-to-end tests for a project
nx run <project>:vitest:end-to-end

# All affected tests (unit + integration + e2e) — standard CI and local validation
nx affected --target=vitest --base=main

# Affected tests with coverage gates
nx affected --target=vitest --configuration=coverage --base=main
```

The `nx affected --target=vitest` command runs **all** Vitest configurations for affected projects and their dependents. This is the command used in CI, pre-push hooks, and the `validate-code` skill.

## Coverage and Size Gates

Four quality gates must pass for every change. **Lowering any threshold to make a change pass is not an option.**

| Gate | Threshold | Command |
|------|-----------|---------|
| **Test coverage** | 96% branches, functions, lines, statements (set once in `configuration/vitest.config.ts`) | `nx run <project>:vitest --configuration=coverage` |
| **Type coverage** | Per project, in `package.json` as `typeCoverage.atLeast`. Most packages at 100% with `strict: true` | `nx run <project>:type-coverage` |
| **Compiled size** | Per project, declared in `codometer.config.ts` | `nx run <project>:codometer` |
| **Duplication** | Advisory only (not a CI gate) | `nx run configuration:jscpd` |

Key practices:
- After structural test refactors (renaming, regrouping, helper extraction), always re-run coverage to verify no threshold regression.
- If branch coverage is just below threshold, add focused tests for uncovered guard/fallback branches first (undefined/null guards, sparse-array fallbacks, error-only paths).
- Use a hotspot-first loop: generate coverage, sort lowest branch-coverage files, patch highest-impact offenders, re-run coverage.
- Raise coverage with behavior-first assertions, not synthetic test inflation.
- Keep project Vitest configs thin and inherit shared defaults using `mergeConfig(...)` from `configuration/vitest.config.ts` so threshold changes stay centralized.
- Before opening or updating a coverage-focused PR, run the CI-shaped command locally: `nx affected --target=vitest --configuration=coverage --base=main`.

<!-- openwiki: broken internal link [../.agents/skills/testing-strategy/SKILL.md] file "../.agents/skills/testing-strategy/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
See the [testing-strategy skill](../.agents/skills/testing-strategy/SKILL.md) for the full gate table and coverage practices.

## Mocking Conventions

The workspace standardizes on `@golevelup/ts-vitest`'s `createMock<T>()` for all injectable classes and interfaces. It returns a fully-typed `DeepMocked<T>` where every method is a `vi.fn()` and properties are recursively mocked via `Proxy`. **Never write manual stub objects** — `createMock` stays in sync with the source type automatically.

```ts
import { createMock } from "@golevelup/ts-vitest";
import type { DeepMocked } from "@golevelup/ts-vitest";

const mockService = createMock<MyService>();
```

**Core patterns:**
- Declare service variables at `describe` scope using `let`, instantiate inside `beforeAll`/`beforeEach` using `module.get()` or `await module.resolve()`.
- Put mocks in `providers:[]`, never in `imports:[]`.
- For TypeORM repositories, use `getRepositoryToken(Entity)` as the provider token.
- Annotate mocks with `DeepMocked<T>` for type safety and ESLint compliance (`satisfies DeepMocked<T>` prevents `unsafe-call`/`unsafe-assignment` false positives).
- Use `vi.hoisted()` for mocks that must exist before module import (e.g., `vi.mock()` at file top level).
- Configure mock return values per test using `mockResolvedValue()`, `mockRejectedValue()`, `mockReturnValue()`.
- Reset mocks with `mockClear()` if test contamination occurs.

<!-- openwiki: broken internal link [../.agents/skills/testing-mocks/SKILL.md] file "../.agents/skills/testing-mocks/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
See the [testing-mocks skill](../.agents/skills/testing-mocks/SKILL.md) for complete patterns, anti-patterns, and NestJS DI integration examples.

## Shared Test Helpers

Two shared packages export testing utilities used across projects:

### `@codebase/interface/testing`

Exports GraphQL mock server and pagination oracle:

| Export | Purpose |
|--------|---------|
| `graphqlMockServer` | MSW server for client tests; answers GraphQL requests with typed handlers from GraphQL Code Generator. |
| `startGraphqlMockServer()` | Starts MSW with `onUnhandledRequest: "error"` — any request without a handler fails the test. |
| `resetGraphqlMockServer()` | Calls `resetHandlers()`, leaving only base handlers. |
| `stopGraphqlMockServer()` | Stops MSW (`close()`). |
| `paginateArray(items, { after, before, first, last, getCursor })` | Slices an array per Relay pagination args — the **in-memory oracle** that SQL-backed pagination must match on every boundary. |
| `expectedPage(ids, request, cursorOf?)` | Returns a `PageSummary` (ids, cursors, hasNext/PreviousPage, totalCount) for a given request. |
| `paginationMatrix(ids, outsiderId, options?)` | Generates a comprehensive matrix of cursor/count combinations worth testing (first/middle/last cursors, outsider ID, undecodable cursors, non-canonical encodings, ordered/equal/crossed `after`/`before` pairs, combined with various limits). |
| `summarize(connection)` | Reduces a GraphQL connection to observable `PageSummary`. |

**Client test pattern:**
```ts
import {
  graphqlMockServer,
  startGraphqlMockServer,
  resetGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";
import { mockSearchLatinQuery } from "../graphql/generated/mocks";

beforeAll(() => startGraphqlMockServer());
afterEach(() => resetGraphqlMockServer());
afterAll(() => stopGraphqlMockServer());

graphqlMockServer.use(
  mockSearchLatinQuery(() => HttpResponse.json({ data: { searchLatin: answer(latin) } }))
);
```

**Server pagination test pattern:**
```ts
import { expectedPage, paginationMatrix, summarize } from "@codebase/interface/testing";
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

### `@codebase/persistence/testing`

Exports Testcontainers-based Postgres harness for integration tests:

| Export | Purpose |
|--------|---------|
| `startPostgresContainer({ migrations, project, images? })` | Starts a throwaway `postgres:18-alpine` container (with Docker Hub mirror fallback) laid out exactly like the local Docker dev environment: a `<project>_username` role owning a `<project>_testing` database with a `<project>` schema; runs the project's real migrations before tests begin. Returns `{ connection, environment }` for `ConfigModule`/`PostgresqlModule`. |
| `startDatabaseTestingModule({ project, entities, migrations, imports, providers, database?, namingStrategy?, validate?, images? })` | Wraps `startPostgresContainer` and compiles a Nest testing module with: global `ConfigModule` reading container env vars, `PostgresqlModule.forRoot` (or project's own database module), `TypeOrmModule.forFeature(entities)`, and any additional `imports`/`providers`. Returns `{ module, repository, dataSource, container, close }`. The `close()` method tears down everything and restores `process.env`. |

**Integration test pattern:**
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

**Key behaviors:**
- Every integration suite exercises the project's **real migrations**, catching schema drift early.
- Container runs migrations as the project's role (not admin), then disconnects.
- Falls back through `POSTGRES_CONTAINER_IMAGES` when one image fails to pull.
- Fails with the migration's own error when a migration fails.
- Requires Docker to be running.

## Lexico-Web GraphQL Codegen

The `lexico-web` project uses GraphQL Code Generator to produce typed client artifacts from the `lexico-api` schema. The configuration lives in `projects/lexico/lexico-web/codegen.ts` and delegates to `@codebase/interface/client`'s `createGraphqlCodegenConfig`.

**Output artifacts** (generated into `src/graphql/generated/`):
- **`operations.ts`** — Typed operation documents (TypeScript + `typescript-operations` + `typed-document-node`). Every `.graphql` file under `src/graphql/operations/**` becomes a typed `TypedDocumentNode` with inferred variables and result types.
- **`validation.ts`** — Zod v4 schemas for each operation's variables and result, emitted via `typescript-validation-schema` with `withOperationType: true`. Import path: `./operations`.
- **`mocks.ts`** — MSW handlers for each operation, emitted via `typescript-msw`. Provides `mock<OperationName>Query`/`Mutation` helpers that accept a resolver returning `HttpResponse.json({ data: ... })`.

**Scalars** are mapped to wire representation: `DateTime` and `ID` both serialize as `string` in JSON.

```ts
// projects/lexico/lexico-web/codegen.ts
import { createGraphqlCodegenConfig } from "@codebase/interface/client";

const config = createGraphqlCodegenConfig({
  schema: "../lexico-api/src/schema.gql",
});

export default config;
```

Run generation:
```bash
nx run lexico-web:codegen           # one-shot
nx run lexico-web:codegen-watch     # watch mode
```

The generated MSW mock helpers are consumed via `@codebase/interface/testing` (see **Shared Test Helpers** above).

## CI Test Sharding

The Continuous Integration workflow (`.github/workflows/continuous-integration.yml`) splits the test target into **four parallel shards** to avoid long-running jobs and resource contention:

| Shard | NX Exclude Pattern | Projects Covered |
|-------|-------------------|------------------|
| **general** (default `test-code` job) | `meanderaw-cli,projects/caelundas/**,projects/ic-suite/**` | All other projects |
| **caelundas** | `*,!projects/caelundas/**` | `projects/caelundas/**` (requires ephemeris download) |
| **meanderaw** | `*,!meanderaw-cli` | `meanderaw-cli` (heavy integration suite) |
| **ic-suite** | `*,!projects/ic-suite/**` | `projects/ic-suite/**` (37 packages) |

Each shard runs `nx affected --target=vitest --configuration=coverage` with its exclude pattern. A shard with no affected projects runs nothing. The `postgres-client` tool is installed only for the `test-code` target (the general shard); other shards inherit it through their setup.

## References

<!-- openwiki: broken internal link [../.agents/skills/testing-strategy/SKILL.md] file "../.agents/skills/testing-strategy/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Testing Strategy Skill](../.agents/skills/testing-strategy/SKILL.md) — test types, naming, Nx commands, coverage gates, mocking patterns
<!-- openwiki: broken internal link [../.agents/skills/test-driven-development/SKILL.md] file "../.agents/skills/test-driven-development/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Test-Driven Development Skill](../.agents/skills/test-driven-development/SKILL.md) — TDD rules, red-green-refactor cycle, verification checklist, common rationalizations
<!-- openwiki: broken internal link [../.agents/skills/testing-mocks/SKILL.md] file "../.agents/skills/testing-mocks/SKILL.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Testing Mocks Skill](../.agents/skills/testing-mocks/SKILL.md) — `createMock<T>()` patterns, NestJS DI integration, anti-patterns
- [Integration Testing Patterns](integration.md) — detailed Testcontainers and GraphQL mock server usage
- [Affirmancy Testing](affirmancy.md)
<!-- openwiki: broken internal link [caelundas.md] file "caelundas.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Caelundas Testing](caelundas.md)
- [Lexico Testing](lexico.md)
- [Meanderaw Testing](meanderaw.md)
