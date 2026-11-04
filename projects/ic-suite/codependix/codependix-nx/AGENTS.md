# CodependixNx: Nx Plugin

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
`codependix-nx-layer` rule in `configuration/codependix.config.ts`
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

## Architecture Overview

### Tech Stack

- **Framework**: NestJS application context (`NestFactory.createApplicationContext`),
  built once per process and cached on `globalThis`
- **Nx**: `@nx/devkit` — `createNodes`, an executor, and
  Nx's `logger` for warnings
- **Loader**: `@swc-node/register`, registered by this package's own shim
- **Language**: Strict TypeScript

There is no environment schema, no `codependix-nx.ts`, and no logger module: Nx calls
plugins from bare module-level functions, which bootstrap the context and
hand back a service.

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

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run codependix-nx:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run codependix-nx:type-coverage   # Strict, at 100
nx run codependix-nx:build           # Compile for publication
nx run codependix-nx:pack            # Tarball in dist/tarballs — never publish to rehearse
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
