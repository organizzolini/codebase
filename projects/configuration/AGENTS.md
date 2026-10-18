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

## The tools find no configuration

Every ic-suite CLI requires `--config` and every Nx plugin requires its
`configurationPath` option: there is no default file, filename search, or upward
walk for the main configuration. This repository names
`projects/configuration/<tool>.config.ts` in `nx.json` and in the targets here,
and each project's codometer target names its own `codometer.config.ts`.

## Pass every config and ignore file explicitly

No target relies on a tool finding a file by walking up the directory tree.
Each command names its config (`--config`, `-c`, `--rcfile`, `--ignore-path`,
`--ignorefile`, `--gitleaks-ignore-path`), and the editor settings in
`.vscode/settings.json` name the same files. Two files whose tools would
otherwise discover them by name have different names for that reason:
`markdownlint-cli2.config.jsonc` and `.shellcheck.rc`. Give a new tool's file a
name its tool does not auto-discover, and pass the path.

## What stays at the repository root

Only files a tool insists on finding there: `nx.json`, `package.json`,
`pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.json` (compatibility shim
for tools that require a root entrypoint), `.gitignore`, `.gitattributes`,
`.gitmodules`, `.editorconfig`, `.nxignore`, `.openwikiignore`,
`.node-version`, `.nvmrc`, `skills-lock.json`, and
`validate-branch-name.config.cjs`, whose tool takes no config path.

## In the graph, and out of releases

Every project depends on `configuration` in the Nx graph, because each project's
tool configs import it. Keep that: it is true, and `nx affected` uses it.

- **Outbound edges are cut.** This project imports six packages for types, and
  edges back to them would close cycles. `implicitDependencies` in
  `project.json` removes them. Check with `nx graph --print` that no cycle
  appears and that no project is missing from the inbound list.
- **The boundary rules know it.** The project carries the `name:configuration`
  tag. Each `allow` rule in `codependix.config.ts` lists it as a permitted
  target, and the `*-is-a-leaf` rules reach every project but it. A new rule
  must do the same, or every project's `codependix-gate` fails.
- **Releases ignore it.** A change here would otherwise patch-bump every
  package. the `publication` project's `version-packages` command appends this folder to
  `.nxignore` for the `nx release` command and restores the file on exit. Do not
  run `nx release` by hand without the same ignore, or it will version every
  package.

## Where each caller names these targets

| Caller                       | Targets                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `continuous-integration.yml` | `lint-code`, `format-code`, `deprecate-code`, `guard-code`, `secure-code`, `build-projects` through `nx affected` |
| `continuous-deployment.yml`  | `callidescope:write`, `codependix:write`, `codometer:write`                                                       |
| `lint-staged.config.ts`      | `sherif`, `syncpack` through `nx run-many`, the rest through `nx affected`                                        |
| `.husky/*`                   | `commitlint`, `validate-branch-name`, `lint-staged`, invoked directly                                             |
