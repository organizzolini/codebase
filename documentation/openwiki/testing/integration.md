---
type: "Reference"
title: "Integration Testing"
description: "Documents cross-project integration testing patterns: Testcontainers Postgres harness, GraphQL mock server with MSW, Nx affected test runs, packed artifact end-to-end tests."
tags: ["testing", "integration", "testcontainers", "graphql", "nx", "ci"]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-25T18:55:00.444Z
sources:
  - id: openwiki-source-cb3df90b3af3b7ee2f16c98e
    resource: repo://.agents/skills/triage-integration/SKILL.md
  - id: openwiki-source-6a912425b229e5927e9f176b
    resource: repo://.agents/skills/validate-code/references/raising-coverage.md
  - id: openwiki-source-dbd25ad441b2f5c4f5cd1ba8
    resource: repo://.agents/skills/validate-code/SKILL.md
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-bbab45af4bebcbd50cf915b0
    resource: repo://integration/src/integration.main.end-to-end.test.ts
  - id: openwiki-source-fb04b392a5b00efed2344b4b
    resource: repo://projects/common/interface/testing/graphql-mock-server/graphql-mock-server.utilities.ts
  - id: openwiki-source-656ec5fd6b299f80e2256a7b
    resource: repo://projects/common/interface/testing/index.ts
  - id: openwiki-source-6bccd99d3ce37c9033902b3b
    resource: repo://projects/common/interface/testing/pagination/pagination.utilities.ts
  - id: openwiki-source-d43cf1b76d511df31f2fb62d
    resource: repo://projects/common/persistence/testing/database-testing/database-testing.utilities.ts
  - id: openwiki-source-c647017e373aa4231d115310
    resource: repo://projects/common/persistence/testing/postgres-container/postgres-container.utilities.ts
  - id: openwiki-source-d2bcabd613e9901cd5519864
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-run.command.integration.test.ts
generated: { by: "openwiki/0.9.0", at: "2026-11-25T18:55:00.444Z" }
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
- `database` — optional project-specific database module instead of `PostgresqlModule.forRoot`
- `migrations` — run against the container before the module compiles
- `imports` / `providers` — additional modules and providers for the test
- `validate` — optional Zod schema for `ConfigModule.forRoot`

The utility restores `process.env` on close so tests do not leak environment into each other.

## GraphQL Mock Server

The `@codebase/interface/testing` entry provides a ready-to-use MSW server (`graphqlMockServer`) configured to error on unhandled requests. Tests add handlers per file using `use(...)` and call the lifecycle utilities from the project's Vitest hooks.

### Lifecycle Utilities

```ts
import {
  startGraphqlMockServer,
  stopGraphqlMockServer,
  resetGraphqlMockServer,
} from "@codebase/interface/testing/graphql-mock-server";

// In the project's vitest.setup.ts or per test file:
beforeAll(startGraphqlMockServer);
afterEach(resetGraphqlMockServer);
afterAll(stopGraphqlMockServer);
```

- `startGraphqlMockServer()` — calls `listen({ onUnhandledRequest: "error" })` so any GraphQL request without a handler fails the test
- `resetGraphqlMockServer()` — calls `resetHandlers()` between tests to clear per-test handlers
- `stopGraphqlMockServer()` — calls `close()` to shut down the MSW server

### Handler Generation from GraphQL Codegen

Handlers are produced from GraphQL Codegen output. A test imports the generated document types and uses `graphqlMockServer.use(...)` with a request handler that matches the operation name and variables, returning typed data. This keeps mocks in sync with the schema and catches breaking changes at test time rather than in CI.

## Selective Mocking with `@golevelup/ts-vitest`

Integration tests combine a real Postgres via Testcontainers with selective mocking of external services using `@golevelup/ts-vitest`'s `createMock`. The pattern mocks filesystem and HTTP while keeping the database real:

```ts
import { createMock } from "@golevelup/ts-vitest";
import { vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

// In the test module:
{
  provide: DrawCodeService,
  useValue: createMock<DrawCodeService>(),
}
```

This is the standard pattern for `vitest:integration` targets: the database and migrations are real, filesystem I/O and external HTTP are mocked, and the test exercises the full NestJS command container wiring.

## Nx Affected Test Runs

CI runs tests through `nx affected` with the `run-affected` command from the `integration` project. The standard command in CI, pre-push hooks, and the `validate-code` skill is:

```bash
pnpm exec nx run integration:start:run-affected
```

This invokes `integration/src/integration.main.ts run-affected`, which executes:

```bash
nx affected --target=<TARGETS> --base=<NX_BASE> --head=<NX_HEAD> --parallel=4
```

The CI matrix passes different `TARGETS` per leg:
- **Static** — `typecheck-code,format-code,lint-code,deprecate-code` with `--configuration=check`
- **Guard** — `guard-code` targets
- **Test** — `test-code` with `--configuration=coverage` (for coverage gates) or `--configuration=check` (for fast feedback)
- **Build** — `build-projects`
- **End to End** — `end-to-end` target

`run-affected` also handles the `INCLUDE_TEMPLATES` flag for `conformetry-validate`, which adds template projects that `.nxignore` would otherwise exclude.

The `run-affected` command is the single entrypoint for all CI legs except `secure-code`, `plan-terraform`, and `build-devcontainer`.

## Packed Artifact End-to-End Tests

The CI `end-to-end` leg (matrix target `end-to-end`, name "End to End IC Suite") validates the real published artifacts:

1. **Packs the five CLIs and four Nx plugins** into tarballs via `pnpm pack`
2. **Installs the tarballs into a sandbox** outside the checkout — the CLIs directly, the plugins through a local **Verdaccio** registry started for the run
3. **Runs the real executable** in the sandbox, exercising the exact code a consumer would receive

This test never publishes; it validates that the `package.json` exports, entry points, and bundled dependencies are correct. The Verdaccio configuration lives at `configuration/repository/verdaccio.config.yml`.

## Triage Patterns for CI Failures

The `triage-integration` skill provides step-by-step procedures for diagnosing CI integration failures locally (lint-staged, husky hooks) and remotely (GitHub Actions), with fix guidance for each failing target type.

### Local Hook Failures

For `pre-commit` failures, the full output is in `last-lint-staged-output.log` at the workspace root. Each hook's checked targets are documented in `.github/references/hooks.md`.

### Remote CI Failures

Fetch the failing check logs:

```bash
gh run view <run-id> --log-failed
gh api "repos/{owner}/{repo}/commits/$(git rev-parse HEAD)/check-runs" \
  --jq '.check_runs[] | select(.conclusion == "failure") | "\(.name) \(.html_url)"'
```

In a cloud session without `gh`, use the GitHub MCP `get_job_logs` tool.

### Failure Identification

Name the **Nx target** (`oxfmt`, `eslint`, `typecheck`, `spell-check`, `codependix-bound`, …), the **project**, and the **tool's own message**. One import cycle can crash the Nx plugin worker and fail dozens of tasks at once; look for the first error, not the count.

### Fix Workflow

1. Run the failing target's `write` configuration where it has one — formatting, lint autofixes, knip, markdownlint, and every sync check:
   ```bash
   pnpm exec nx run-many --targets=<target> --projects=<project> --configuration=write
   ```
2. Everything else is a manual fix. `.github/references/tool-fixes.md` has each tool's configuration, the manual fix for each, the sync checks and what they keep in step, and common symptoms.

### Validation

Re-run the exact command that failed, with `--configuration=check`, and repeat until it passes. Then run `validate-code` over the change so the next push does not fail on a check the hook skipped.

### Reporting Format

```text
Errors Found
- <hook or CI check>: <target> (<project>) — <message>

Fixes Implemented
- <write command, or the manual change>
- Files changed: <list> (unstaged)

Validation
- <check command> — ✅ passed

Remaining Actions
- <none | what the user still has to do>
```

## Integration Project End-to-End Test

The `integration` project itself has an end-to-end test (`integration/src/integration.main.end-to-end.test.ts`) that spawns the real CLI entrypoint and verifies the NestJS command container boots and all commands are registered. It runs `--help` (which boots every command's providers in one spawn) and asserts:

- Exit code `0`
- No "Nest can't resolve" errors in output
- Each of the expected command names appears in the help output

This catches dependency-injection gaps that unit tests and the lint gate never exercise, since they never boot the real container.
