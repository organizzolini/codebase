# Configuration: Tool Configuration and the Targets That Run It

## Quick Start

**Type**: Nx project with no application source: config files, `project.json`,
and one plugin file.

**Purpose**: Hold every tool's configuration, and own the targets that run those
tools over the workspace-root files, so the root `project.json` stays small.

```bash
nx show project configuration     # every target
nx run configuration:knip:check
```

## Rules for editing `project.json`

- **Read root paths as `{workspaceRoot}`.** `{projectRoot}` here is
  `projects/configuration`. Every command sets `cwd` to `{workspaceRoot}`; every
  input is a `{workspaceRoot}` glob or the `workspace-files` named input.
- **A target with no `inputs` inherits a `default` that covers only this
  folder.** Declare inputs on every cached target, or a change to a root file
  replays a stale pass.
- **Inputs decide `nx affected`.** Nx marks this project affected when a changed
  file matches a target's `{workspaceRoot}` input, which is how a change to
  `docs/` or `.github/` reaches `lint-code` here. Narrowing an input silently
  stops that target running in CI.
- **Do not add a `language:*` tag.** Tagged projects pick up the
  `language:typescript` target defaults, which would overwrite the commands
  written here.
- **The three Nx plugins that infer targets exclude this project** in
  `nx.json`: `@nx/vite`, `@nx/eslint`, and `@nx/vitest` would otherwise infer a
  `vitest` run and an `eslint` target from the config files held here.

## Why no project depends on it

`nx-plugin.cjs` adds `implicitDependencies: ["!configuration"]` to every other
project. Without it, every project's config imports would record an edge to this
project, which imports the IC-suite packages in turn: 52 inbound edges and 13
cycles through the `core` layers. Check with `nx graph --print` after touching
the plugin; no project may list `configuration` as a dependency.

## Where each caller names these targets

| Caller                                  | Targets                                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `continuous-integration.yml`            | `lint-code`, `format-code`, `deprecate-code`, `guard-code`, `secure-code`, `build-projects` through `nx affected` |
| `continuous-deployment.yml`             | `callidescope:write`, `codependix:write`, `codometer:write`                                                       |
| `lint-staged.config.ts`                 | `sherif`, `syncpack` through `nx run-many`, the rest through `nx affected`                                        |
| `.husky/*`                              | `commitlint`, `validate-branch-name`, `lint-staged`, invoked directly                                             |
