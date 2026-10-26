# Testing: Shared Test Code Package

## Quick Start

**Type**: TypeScript library package (`@codebase/testing`)

**Purpose**: The test boilerplate and utilities every project shares, so
tests stop copying setup files, Nest testing modules, temporary directories,
and capture code. See [README.md](README.md) for each entry's API.

## Architecture Overview

### Entries

```text
src/
  index.ts          # @codebase/testing: the core, no workspace dependencies
  setup.ts          # @codebase/testing/setup: the shared Vitest setup file
  nestjs.ts         # @codebase/testing/nestjs: module builder, assertions, Nx tree
  graphql.ts        # @codebase/testing/graphql: the pagination oracle
  postgres.ts       # @codebase/testing/postgres: container and database testing module
  react.ts          # @codebase/testing/react: route render and stand-ins
  react-setup.ts    # @codebase/testing/react/setup: the shared jsdom setup
  modules/          # One folder per helper, each with its unit test
testing/
  fixtures/         # Sample Nest classes and Postgres fixtures the tests build on
```

## Development

### Rules this package holds

- **Keep the core free of workspace imports.** `src/index.ts` and
  `src/setup.ts` must reach nothing under `projects/`, so every project can
  use them.
- **Each adapter depends only on what it wraps.** The Nest entry on
  `observability`, GraphQL on `interface`, Postgres on `persistence`.
- **Depend only on the common packages.** `observability`, `persistence`, and
  `interface` may import this package back, and the cycles that closes are
  allowed only among them: the `name:testing` boundary rule keeps every other
  project out of reach.
- **Undo every global change when the test finishes.** Register the undo with
  `onTestFinished` (or a `beforeAll` teardown) inside the helper, never in the
  caller.
- **Test each helper through its public interface**, by what a caller
  observes: files on disk, captured text, resolved instances, thrown
  assertions.
- **Never add a `framework:*` tag.** A framework tag pulls the package into
  that framework's conformetry templates and module-boundary rules.

### Key Commands

```bash
nx run testing:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run testing:vitest:unit
nx run testing:vitest:integration   # Docker must be running
nx run testing:type-coverage
```

`route-render.utilities.tsx` is left out of type coverage, as each web
application's own `render-route.tsx` was: TanStack Router's router types are
built on `any`.
