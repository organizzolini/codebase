# 🧪 Testing

The shared test code every project's tests can import.

## Purpose

Tests across the workspace repeated the same boilerplate: a Vitest setup file
copied into every project, hand-built Nest testing modules, hand-rolled
temporary directories, output capture, and environment edits. This package
holds that code once, laid out as subpath exports so each layer depends only
on what it wraps.

| Entry                           | Holds                                                                                                        | Depends on                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `@codebase/testing`             | Temporary directories, output and exit-code capture, environment overrides, the fixed clock, fixtures, mocks | nothing in the workspace  |
| `@codebase/testing/setup`       | The shared Vitest setup file                                                                                 | nothing in the workspace  |
| `@codebase/testing/nestjs`      | The testing-module builder, the logger-context and module-wiring assertions, the Nx workspace tree           | `@codebase/observability` |
| `@codebase/testing/graphql`     | The MSW GraphQL mock server, and the pagination oracle a SQL-backed page is checked against                  | `@codebase/interface`     |
| `@codebase/testing/postgres`    | The Postgres container and the database testing module                                                       | `@codebase/persistence`   |
| `@codebase/testing/react`       | The route-render helper and the `createServerFn` and `matchMedia` stand-ins                                  | TanStack Router           |
| `@codebase/testing/react/setup` | The shared jsdom setup                                                                                       | Testing Library           |

## Usage

Add the package as a development dependency:

```jsonc
// package.json
"devDependencies": { "@codebase/testing": "workspace:*" }
```

A project whose `testing/` folder imports it lists it under `dependencies`
instead, because the dependency check counts `testing/` files as shipped code;
`interface` and `persistence` do.

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

Every helper that changes global state undoes it once the test finishes, so a
test cannot leak a directory, a stream spy, an exit code, or a variable into
the next. `useTemporaryDirectory` is the suite-level variant: one directory
from the suite's first test to its last.

`loadFixture(import.meta.url, "fixtures/page.html")` reads a fixture relative
to the test file. `mockChildProcess` and `mockPartially` build `vi.mock`
factories, `stubFetch` queues responses for `fetch`, and `answerPrompts`
queues answers for the `promptsMock` stand-in of the `prompts` package.

### Nest

```ts
import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

const { instance, mock } = await buildTestingModule(ExportCommand, {
  mocks: [PostgresqlUtilitiesService],
});
mock(PostgresqlUtilitiesService).dump.mockResolvedValue(undefined);

await expectLoggerContext(ExportCommand, {
  mocks: [PostgresqlUtilitiesService],
});
```

The builder always provides a logger mock, and a dependency nothing provides
fails the build, so resolving the class is itself the wiring check an "is
defined" test used to stand in for. `expectModuleProvides`,
`expectModuleExports`, and `expectModuleImports` assert a module's
`@Module` metadata without reading it by hand.

### Postgres

`startDatabaseTestingModule` starts a migrated throwaway Postgres and compiles
a Nest testing module connected to it; `startPostgresContainer` starts the
container alone. See the [persistence README](../persistence/README.md#integration-tests)
for the options. Docker must be running.

### React

```ts
import { renderRoute } from "@codebase/testing/react";

await renderRoute(getRouter(), "/search");
```

`renderRoute` swaps the root route's document shell for one that renders the
page alone, so no test has to mock `__root`. A web application points
`createServerFn` at `createServerFunctionStandIn` from its setup file.

## Dependency rules

- The core entries import nothing from the workspace, so any project can use
  them.
- This package depends only on the common packages: `observability`,
  `persistence`, `interface`, and `configuration`. Those may import it back,
  as `@codebase/persistence/testing` and `@codebase/interface/testing` do to
  re-export what moved here; the module-boundary and codependix rules allow
  those cycles and no others.
- A project tagged `framework:react` may import this package from its tests
  and `testing/` harnesses only: the Nest and Postgres adapters reach
  packages tagged `framework:nestjs`, which a React project's own code still
  may not.

## Test

```bash
nx run testing:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
