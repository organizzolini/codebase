# 🧪 Testing

The shared test code every project's tests can import.

## Purpose

Tests across the workspace repeated the same boilerplate: a Vitest setup file
copied into every project, hand-rolled temporary directories, output capture,
and environment edits. This package holds that code once, laid out as
subpath exports.

| Entry                           | Holds                                                                                                        | Depends on                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `@codebase/testing`             | Temporary directories, output and exit-code capture, environment overrides, the fixed clock, fixtures, mocks | nothing in the workspace  |
| `@codebase/testing/setup`       | The shared Vitest setup file                                                                                 | nothing in the workspace  |
| `@codebase/testing/end-to-end`  | Tarball sandbox and Verdaccio plugin runners that test packed packages as a consumer installs them           | `execa`, Verdaccio        |
| `@codebase/testing/file-system` | The `mockFileSystem` factory helper, kept free of `node:fs` imports                                          | nothing in the workspace  |
| `@codebase/testing/nestjs`      | The testing-module builder, module-wiring assertions, and the Nx workspace tree                              | `@codebase/observability` |
| `@codebase/testing/react`       | The route-render helper and the `createServerFn` and `matchMedia` stand-ins                                  | TanStack Router           |
| `@codebase/testing/react/setup` | The shared jsdom setup                                                                                       | Testing Library           |

## Usage

Add the package as a development dependency:

```jsonc
// package.json
"devDependencies": { "@codebase/testing": "workspace:*" }
```

A project whose shipped `testing/` files import it lists it under
`dependencies` instead.

### Core

```ts
import {
  captureExitCode,
  captureOutput,
  createTemporaryDirectory,
  mockDates,
  overrideEnvironment,
} from "@codebase/testing";

describe("the command line", () => {
  mockDates();

  it("writes its report", async () => {
    const directory = createTemporaryDirectory("report");
    const output = captureOutput();
    const exitCode = captureExitCode();
    overrideEnvironment({ LOG_LEVEL: "silent" });

    await run(["report", directory]);

    expect(output.stdout()).toContain("written");
    expect(exitCode()).toBeUndefined();
  });
});
```

`createFileTree({ "src/a.ts": "..." }, { git: true, symlinks: { "link": "src" } })`
writes a temporary tree and returns its root, removed with the test;
`writeFileTree(root, files)` writes into a directory you already hold.

Every helper that changes global state undoes it once the test finishes, so a
test cannot leak a directory, a stream spy, an exit code, or a variable into
the next. `useTemporaryDirectory` is the suite-level variant: one directory
from the suite's first test to its last.

`loadFixture(import.meta.url, "fixtures/page.html")` reads a fixture relative
to the test file. `mockChildProcess` and `mockPartially` build `vi.mock`
factories, `stubFetch` queues responses for `fetch`, and `answerPrompts`
queues answers for the `promptsMock` stand-in of the `prompts` package. The
shared setup file already mocks `prompts` with it, so a test needs no
`vi.mock("prompts")` of its own.

#### Mocking the file system

`mockFileSystem` builds the module a `vi.mock` factory returns, served as named
exports and as `default`, so code written either way reads one set of stubs.
`vi.mock` hoists above static imports, so the factory loads the helper from its
own entry, `@codebase/testing/file-system`, with `vi.importActual`. A
dynamic `import()` of the package makes `@nx/enforce-module-boundaries` forbid
every static import of `@codebase/testing` in the same project, but
`vi.importActual` is a call, not an import expression, so the rule passes
without a disable comment. The entry loads nothing that imports `node:fs`:

```ts
import fs from "node:fs";

import { vi } from "vitest";

import type * as FileSystemHelpers from "@codebase/testing/file-system";

vi.mock("node:fs", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem(); // bare stubs: no real function runs
});

vi.mock("node:fs/promises", async (importOriginal) => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem(await importOriginal()); // real, until a result is staged
});

it("reads the config", () => {
  vi.mocked(fs.readFileSync).mockReturnValue("name = 1");
});
```

### End to end

```ts
import {
  createTarballSandboxRunner,
  startVerdaccioPluginRunner,
} from "@codebase/testing/end-to-end";

const sandbox = await createTarballSandboxRunner({
  packages: ["@codometer/cli"],
  workspaceRoot,
});
const { exitCode } = await sandbox.command("codometer", ["--help"]).run();
sandbox.dispose();

const registry = await startVerdaccioPluginRunner({
  localScopes: ["@conformetry"],
});
await registry.publish({ packages: ["@conformetry/nx"], workspaceRoot });
const workspace = await registry.createWorkspace({
  dependencies: { nx: "22.0.0" },
  packages: ["@conformetry/nx"],
});
workspace.registerPlugin("@conformetry/nx");
await workspace.runTarget("project:gate");
await registry.stop();
```

`runSourceCommand({ entry, args, directory, tsconfig, environment, timeout })`
runs a TypeScript entry as a command line would run, through
`node --import @swc-node/register/esm-register`, and resolves
`{ exitCode, stdout, stderr }`. Color is forced off, the environment is
sanitized, the timeout defaults to 120 seconds, and a failing or stopped run is
a result (exit code 1 when it never exited), never a throw. `tsconfig` sets
`SWC_NODE_PROJECT`, which swc-node reads ahead of `TS_NODE_PROJECT`. Run it
from a directory inside the workspace: `@swc-node/register` resolves from the
working directory, so a `os.tmpdir()` one fails on Linux.

Both runners test packed artifacts: run the `pack` target first, so
`dist/tarballs` holds them. Commands receive only a sanitized environment, a
timeout, and captured output, and a failing command is a result with an
`exitCode`, never a throw. The registry takes a free port and temporary
storage, and publishes the tarballs as packed, under a dist-tag. Name the
scopes of the packages you publish in `localScopes`: the registry proxies
npmjs, and refuses a version npmjs already holds.

### Nest

```ts
import { buildTestingModule } from "@codebase/testing/nestjs";

const { instance, mock } = await buildTestingModule(ExportCommand, {
  mocks: [PostgresqlUtilitiesService],
});
mock(PostgresqlUtilitiesService).dump.mockResolvedValue(undefined);
```

`bootModule(MainModule)` compiles the root module with its real providers and
closes it once the test finishes, so "boots the root module" is one line.

`buildTestingModule` always provides a deep mock of observability's
`LoggerService`, and a dependency nothing provides fails the build, so
resolving the class is itself the wiring check an "is defined" test used to
stand in for. `@codebase/testing/nestjs` also exports `expectModuleProvides`,
`expectModuleExports`, and `expectModuleImports` to assert a module's
`@Module` metadata without reading it by hand. `expectLoggerContext`, which
builds the class the same way and asserts its logger context, comes from
[`@codebase/observability/testing`](../observability/README.md#testing-helpers).

### Recipes by test kind

| Kind               | Reach for                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Command            | `buildTestingModule`, `answerPrompts`, `captureOutput`, `captureExitCode`, `mockFileSystem`                                |
| Module             | `bootModule`, `expectModuleProvides`, `expectModuleExports`, `expectModuleImports`                                         |
| Integration        | `createFileTree`, `createTemporaryDirectory`, `overrideEnvironment`, `mockDates`                                           |
| End-to-end CLI     | `runSourceCommand` over a `createFileTree({ ... }, { git: true })` root, or `createTarballSandboxRunner` for packed output |
| Utilities          | `mockPartially`, `stubFetch`, `loadFixture`, `mockDates`                                                                   |

### Postgres

`startDatabaseTestingModule` starts a migrated throwaway Postgres and compiles
a Nest testing module connected to it; `startPostgresContainer` starts the
container alone. Both are exported by `@codebase/persistence/testing`. See
the [persistence README](../persistence/README.md#integration-tests) for the
options. Docker must be running.

### React

```ts
import { renderRoute } from "@codebase/testing/react";

await renderRoute(getRouter(), "/search");
```

`renderRoute` swaps the root route's document shell for one that renders the
page alone, so no test has to mock `__root`. A web application points
`createServerFn` at `createServerFunctionStandIn` from its setup file.

## Dependency rules

- The core, `/setup`, and `/react` entries import nothing from the
  workspace. `/nestjs` imports `@codebase/observability`, for the
  `LoggerService` token and `LoggerServiceContract` type its module builder
  mocks; it is the package's only workspace dependency.
- `@codebase/observability/testing` imports `/nestjs` back. The module-boundary
  rule allows that one cycle, and observability's `implicitDependencies:
["!testing"]` keeps it out of the task graph: this package's build waits on
  observability's, never the reverse. Observability lists this package's
  source as a `testing-source` named input, so its cached tasks still rerun
  when the builder changes.
- Adapters that need `interface`, `persistence`, or `observability` live with
  those packages and are exported from their `/testing` entries.
- A project tagged `framework:react` may import this package from its tests
  and `testing/` harnesses only.

## Test

```bash
nx run testing:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
