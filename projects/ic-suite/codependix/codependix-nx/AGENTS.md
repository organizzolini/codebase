# CodependixNx: NestJS Service Application

## Quick Start

**Type**: Nx plugin — one inferred target and its executor, built on a NestJS
application context

**Purpose**: Infers `codependix-bound` onto every `project.json` project but the
workspace root, so `nx affected -t codependix-bound` checks codependix
boundaries per project and fails the task named after the project whose
boundary broke.

The executor runs `codependix map --check boundaries --projects <project>
--config <configuration>`
**as a child process**, from the workspace root, under `node --import
<file URL of @codependix/nx/loader>`. A child process rather than an
in-process call, because the boundary check boots NestJS containers from
their TypeScript sources and constructor injection there needs the decorator
metadata only `@swc-node/register` emits — `tsx` and esbuild silently break
it. `src/executors/gate/loader.mjs` registers those hooks resolved from this
package's own dependencies, never the consumer's root. The command line's
entry is resolved through `@codependix/cli`'s `./main` package export, so an
installed copy runs `dist/src/codependix-cli.main.js`.

The command line builds over the project's Nx dependency closure and fails
only on a finding charged to the project; this plugin adds selection and
caching, not judgment. It deliberately ships **no CLI of its own**, and it
depends on `@codependix/cli` and `@codependix/configuration` alone, the second
only for the check that a configuration path was given — the
`codependix-nx-layer` rule in `configuration/ic-suite/codependix.config.ts`
holds it to that.

The executor is also a **batch executor**: `executors.json` names a
`batchImplementation` and sets `preferBatch`, so `nx affected -t codependix-bound`
hands Nx's whole batch to `BatchService` in one process. One gate per project
started the command line once per project, and most of a gate's cost is that
start. A batch runs `codependix map --check boundaries --format json` over the
projects of every task that judges only its own project, split round-robin
across up to four runs that go at once and never past `MAX_PROJECTS_ARGUMENT_BYTES`
in one argument. The JSON report names the projects each finding is charged to,
and a task fails only when a finding names its own project — a finding charged to
another project of the batch is that project's, and one in a dependency is a
note. A failed task is run again by itself to get exactly the report a single
gate prints, and Nx never prints a batch task's output, so the batch executor
prints each failure under its task id. Nothing is ever read as a pass it did not
earn: output that is not the report, or a failing exit that charges no task, fails
every task of that run. A task that judges other projects or tags runs on its own,
and `--batch=false` turns batching off. Each task is still hashed, cached and
replayed on its own.

**Type**: Node.js service application (NestJS + `NestFactory`)

**Purpose**: <!-- Briefly describe the specific purpose of this service application -->

## Architecture Overview

### Tech Stack

- **Framework**: NestJS application context (`NestFactory.createApplicationContext`),
  built once per process and cached on `globalThis`
- **Nx**: `@nx/devkit` — `createNodes`, an executor, and
  Nx's `logger` for warnings
- **Loader**: `@swc-node/register`, registered by this package's own shim
- **Language**: Strict TypeScript

- **Framework**: NestJS (modules, dependency injection, providers)
- **Bootstrap**: `NestFactory.create` (standard NestJS bootstrap)
- **Env validation**: `@nestjs/config` + `zod` (`environmentSchema` in `.constants.ts`)
- **Logging**: `@codebase/observability` — a `pino`-backed `LoggerService` (`Scope.TRANSIENT`)
- **Language**: Strict TypeScript

This plugin departs from the generic stack above in one way: it has no environment schema, no bootstrap file, and no logger module. Nx calls plugins from bare module-level functions, which bootstrap the context and hand back a service.

### Execution Flow

```text
src/index.ts — createNodes
  ├─ resolveToolInputs (plugin-inputs.utilities.ts)   ← the command line's cache inputs
  ├─ resolveTsconfigInputs (plugin-tsconfig.utilities.ts) ← the loader's tsconfig chain
  └─ PluginService.inferTargets                       ← one gate per project.json

src/executors/gate/executor.ts → GateService.run
  └─ node --import <loader URL> <@codependix/cli/main> map --check boundaries …

src/executors/gate/batch-executor.ts → BatchService.runBatch
  └─ the same command line, --format json, once per share of the batched projects
```

The generic service flow, for a package that bootstraps itself:

```text
src/main.ts
  └─ NestFactory.create(MainModule)
       └─ domain service modules            ← add under src/modules/
```

### Directory Layout

```text
src/
  index.ts                          # Plugin entry: createNodes, public exports
  codependix-nx.module.ts  # Root module: GateModule, PluginModule
  executors/gate/
    batch-executor.ts               # Nx batch executor → BatchService.runBatch
    executor.ts                     # Nx executor → GateService.run
    loader.mjs                      # Registers the swc hooks; passed to --import
    schema.json                     # Executor options; shipped as-is in the tarball
  modules/
    batch/                          # BatchService: judges many gate tasks from a few runs
    gate/                           # GateService: arguments, selection, spawn, hashing
    plugin/                         # PluginService: options and inference
      plugin-context.utilities.ts   # Builds and caches the NestJS context
      plugin-inputs.utilities.ts    # resolveToolInputs: the command line's inputs
      plugin-tsconfig.utilities.ts  # resolveTsconfigInputs: the root tsconfig's extends chain
testing/                            # Shared test setup
```

`executors.json` names the executor by package specifier
(`@codependix/nx/src/executors/gate/*`), which Nx resolves through this
package's exports — the TypeScript sources here, `dist/` in an installed copy.
The schema is named by path and listed in `files`, so the tarball ships it.

```text
src/
  main.ts                           # Bootstrap — do not modify
  main.module.ts                    # Root NestJS module (imports ConfigModule, LoggerModule)
  constants.ts                      # Zod environmentSchema for env validation
  modules/
    <domain>/                       # Add feature modules here
      <domain>.module.ts
      <domain>.service.ts
      <domain>.types.ts
      <domain>.constants.ts
      <domain>.<tier>.test.ts
testing/                            # Shared test utilities
```

## Development

### Caching rules

- **Tool inputs** (`resolveToolInputs`): inside this workspace, a
  `package.json` and `src/**/!(*.test.*|*.spec.*)` glob per package in
  `@codependix/cli`'s `workspace:` closure. Each package is located
  through its entry and the manifest that names it; one that cannot be
  located is named in an Nx `logger.warn` and skipped. An installed command
  line yields one `externalDependencies` input instead. Never throws.
- **Tsconfig inputs** (`resolveTsconfigInputs`): `@swc-node/register` reads
  its options from `tsconfig.json` in the gate's working directory (the
  workspace root) and every base it `extends`, never from a package's own
  tsconfig. Each workspace file in that chain is a `{workspaceRoot}` input,
  missing or unparsable ones included; a base under `node_modules`, named by
  package or by path, is an `externalDependencies` entry only when the root
  `package.json` declares its package from a registry, since Nx fails a task naming an
  external dependency outside its graph.
  Resolved apart from the tool inputs, so either failing keeps the other.
  What it cannot name, it warns about. Never throws.
- **Test exclusion lives inside the positive glob.** Nx's affected
  computation reads only positive `{workspaceRoot}` inputs and ignores a
  `!`-prefixed one, so a negated input would not stop a test-only edit from
  selecting every gate.
- **Selection runs are never cached.** `GateService.run` throws when a cached
  target's effective `projects` or `tags` select any project but its own; such
  a target must set `cache: false`.

### Adding Business Logic

1. **Add domain service modules** — create `src/modules/<domain>/` with a NestJS module, service, types, and constants.
2. **Register in root module** — import the new module in `main.module.ts`.
3. **Validate env vars** — extend `environmentSchema` in `constants.ts` with all required environment variables.

### Logging

`LoggerService` and `LoggerModule` come from `@codebase/observability` — this project does not define its own logger. Add `"@codebase/observability": "workspace:*"` to `dependencies`, then import `LoggerModule` once in the root module; it is `@Global()`, so feature modules inject `LoggerService` without importing it.

`LoggerService` is `Scope.TRANSIENT` — each injecting class gets its own instance. Always call `setContext` in the constructor:

```ts
constructor(private readonly logger: LoggerService) {
  this.logger.setContext(MyService.name);
}
```

Outputs structured JSON in production (`NODE_ENV=production`) and pretty-printed logs in development.

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run codependix-nx:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run codependix-nx:type-coverage   # Strict, at 100
nx run codependix-nx:build           # Compile for publication
nx run codependix-nx:pack            # Tarball in dist/tarballs — never publish to rehearse
```

```bash
nx run codependix-nx:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run codependix-nx:typecheck       # tsc --noEmit
nx run codependix-nx:oxfmt           # Formatting
nx run codependix-nx:build           # Compile for publication
```

### Testing

```bash
nx run codependix-nx:vitest:unit          # Services, the loader, tool and tsconfig inputs
nx run codependix-nx:vitest:integration   # The real executor against a fixture workspace
```

Fixtures live under this package's gitignored `tmp/`, never `os.tmpdir()`:
the swc loader resolves its helpers from the importing file's directory, so a
fixture outside the workspace passes on macOS and fails on Linux. The tool
input tests write a fixture closure with real `node_modules` links rather than
reading this repository's, whose size changes with every new dependency.

A consumer rehearsal needs a directory **outside** this repository: Node
resolves bare specifiers by climbing parent directories, so a consumer under
`tmp/` silently borrows this workspace's `node_modules`.

See the [testing-strategy skill](../../../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

Follow the codebase's strict three-tier testing strategy. Co-locate test files with the source they test.

```bash
nx run codependix-nx:vitest:unit          # Fast (<100ms) — pure logic, mocked DI
nx run codependix-nx:vitest:integration   # Moderate (1-2s) — real database/API I/O
nx run codependix-nx:vitest:end-to-end    # Slow (30-60s) — full service initialization
```

| Tier | File pattern | What to test |
| ---- | ------------ | ------------ |
| Unit | `*.unit.test.ts` | Pure functions, service methods with mocked deps |
| Integration | `*.integration.test.ts` | Database queries, external API clients |
| End-to-end | `*.end-to-end.test.ts` | Full `NestFactory.create()` execution |

See the [testing-strategy skill](../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

## Writing Modules

Use the generator to scaffold new domain modules, then implement the service:

```bash
nx g conformetry:nestjs-service-module --name=<domain>
```

This creates five files in `src/modules/<domain>/`:

| File | Purpose |
| ---- | ------- |
| `<domain>.module.ts` | Declares providers, imports, and exports |
| `<domain>.service.ts` | Business logic — the only place you write domain code |
| `<domain>.constants.ts` | Regex, enums, static config — never inline magic values |
| `<domain>.types.ts` | TypeScript types scoped to this module |
| `<domain>.service.unit.test.ts` | Unit tests bootstrapped with `Test.createTestingModule` |

### Module file

Register the service in both `providers` and `exports` so consumers can inject it:

```ts
@Module({
  controllers: [],
  exports: [MyDomainService],
  imports: [LoggerModule],
  providers: [MyDomainService],
})
export class MyDomainModule {}
```

Add a JSDoc comment on the module class describing what domain it owns.

### Service file

Follow the section-comment layout from the template — it keeps large services scannable:

```ts
@Injectable()
export class MyDomainService {
  // 🏗 Dependency Injection
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MyDomainService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods
}
```

Key rules:

- **Call `setContext` in every constructor** — always use `MyClass.name`, never a string literal.
- **Inject `LoggerService` as the last constructor parameter** (after repository/domain deps).
- **Private first** — keep internal helpers in the `🔏 Private Methods` section, expose only what callers need under `🌎 Public Methods`.
- **`readonly` everything in the constructor** — all injected deps must be `private readonly`.
- **One service per module** — if a service grows too large, extract a sub-domain into its own module.

### Constants file

Move all inline values to `.constants.ts` to keep services readable:

```ts
// ♟️ Constants
export const DEFAULT_PAGE_SIZE = 100;
```

### Types file

Put all module-local TypeScript types and interfaces in `.types.ts`:

```ts
// 🏷️ Types
export interface ParsedEntry {
  word: string;
  partOfSpeech: string;
}
```

Do not re-export types from `index.ts` unless they are part of the public API consumed by other modules.

### Registering in the root module

After generating a module, import it in `main.module.ts`:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    LoggerModule,
    MyDomainModule,   // ← add here
  ],
  providers: [],
})
export class MainModule {}
```

## Best Practices

- **Never** put business logic in `main.ts` — it bootstraps `NestFactory` only.
- **Validate at the boundary** — all env vars must be declared in `environmentSchema`; access via `ConfigService`, not `process.env`.
- **Type imports** — use `import { type Foo }` for type-only imports (enforced by ESLint).
- **No `any` types** — use `unknown` or proper typing; strict mode is enabled.

See the [write-typescript skill](../../.agents/skills/write-typescript/SKILL.md) for strict mode patterns.

## Troubleshooting

- **Dependency injection failure** — verify the service is `@Injectable()`, exported from its module, and that module is imported by the consuming module.
- **Env var validation error on startup** — add the missing variable to `environmentSchema` in `src/constants.ts` and to `configuration/.env.default`.

See the [triage-integration skill](../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

## Key Files

- [src/index.ts](src/index.ts): Plugin entry Nx loads
- [src/modules/gate/gate.service.ts](src/modules/gate/gate.service.ts): The gate run and its hashing
- [src/modules/batch/batch.service.ts](src/modules/batch/batch.service.ts): The batched gate run
- [src/modules/plugin/plugin-inputs.utilities.ts](src/modules/plugin/plugin-inputs.utilities.ts): Tool inputs
- [src/modules/plugin/plugin-tsconfig.utilities.ts](src/modules/plugin/plugin-tsconfig.utilities.ts): Tsconfig inputs
- [src/executors/gate/loader.mjs](src/executors/gate/loader.mjs): The `--import` shim
- [executors.json](executors.json): Executor and schema
- [project.json](project.json): Nx targets

See the [triage-integration skill](../../../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

- [src/main.ts](src/main.ts): Application bootstrap
- [src/main.module.ts](src/main.module.ts): Root NestJS module
- [src/constants.ts](src/constants.ts): `environmentSchema` (Zod)
- `@codebase/observability` (`projects/common/observability`): shared pino-backed `LoggerService` and `LoggerModule`
- [project.json](project.json): Nx targets (`build`, `vitest`, `typecheck-code`, `lint-code`, `format-code`)
- [configuration/.env.default](configuration/.env.default): Environment variable template
