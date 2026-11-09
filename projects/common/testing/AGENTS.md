# Testing: Shared Test Code Package

## Quick Start

**Type**: TypeScript library package (`@codebase/testing`)

**Purpose**: The test boilerplate and utilities every project shares, so
tests stop copying setup files, temporary directories, and capture code. See
[README.md](README.md) for each entry's API.

## Architecture Overview

### Entries

```text
src/
  index.ts          # @codebase/testing: the core, no workspace dependencies
  setup.ts          # @codebase/testing/setup: the shared Vitest setup file
  nestjs.ts         # @codebase/testing/nestjs: module builder, module assertions, Nx tree
  react.ts          # @codebase/testing/react: route render and stand-ins
  react-setup.ts    # @codebase/testing/react/setup: the shared jsdom setup
  modules/          # One folder per helper, each with its unit test
```

## Development

### Rules this package holds

- **Import only `@codebase/observability` from the workspace, and only from
  `/nestjs`.** The module builder needs its `LoggerService` token and
  `LoggerServiceContract` type; every other entry stays free of workspace
  imports. Owner-specific adapters belong to their owning packages and are
  exported from those packages' `/testing` entries.
- **Never let observability's build wait on this one.** Observability imports
  `/nestjs` back, and its `implicitDependencies: ["!testing"]` is what keeps
  that edge out of the task graph; this package's own `^build` waits on
  observability's, which is the one direction the graph keeps.
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
nx run testing:type-coverage
```

`route-render.utilities.tsx` is left out of type coverage, as each web
application's own `render-route.tsx` was: TanStack Router's router types are
built on `any`.
