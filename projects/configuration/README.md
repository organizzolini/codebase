# 🛠️ Configuration

**The workspace's tool configuration, and the Nx targets that run it.**

Every linter, formatter, scanner, git hook, and IC-suite config lives here,
beside the base `tsconfig.json` every project extends. This project also owns
the Nx targets that run those tools over the repository's own files, so the root
`project.json` is left with what concerns the repository as a whole.

## Usage

Run a target by name, in `check` mode unless the target names another:

```bash
nx run configuration:eslint:check        # lint the workspace root
nx run configuration:knip:check          # unused files, exports, and dependencies
nx run configuration:codometer:write     # measure the repository and write the README badges
nx run configuration:local-registry      # a local Verdaccio registry for publish rehearsals
```

`lint-code`, `format-code`, `deprecate-code`, `secure-code`, and `guard-code` are
the aggregates every project declares. Here they gather the root-file checks
below, so `nx affected --target=lint-code` reaches them the way it reaches any
other project.

## What it owns

| Group            | Targets                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint and format  | `eslint`, `oxlint`, `oxfmt`, `prettier`, `markdown-lint`, `yaml-lint`, `shellcheck`, `spell-check`                                                 |
| Unused code      | `knip`, `fallow`, `fallow-dead-code`, `fallow-health`, `fallow-duplicates`, `fallow-audit`, `fallow-fix`, `jscpd`, `vulture`, `sherif`, `syncpack` |
| Security         | `gitleaks`, `trivy-config`, `license-check`, `pnpm-audit`                                                                                          |
| IC-suite         | `callidescope`, `codependix`, `codometer`, `build-projects`                                                                                        |
| Git hooks        | `commit-msg`, `commitlint`, `pre-commit`, `pre-push`, `lint-staged`, `validate-branch-name`                                                        |
| Local publishing | `local-registry`                                                                                                                                   |

## Nobody depends on it

Every project's `eslint.config.ts`, `vite.config.ts`, and `vitest.config.ts`
imports from this folder, and this folder imports the IC-suite packages in turn.
Left alone, Nx would record an edge from every project to this one, and those
edges would close cycles through each package's `core` layer. A change here
would also mark every ic-suite package affected, and `nx release` reads that
affected set.

[`nx-plugin.cjs`](nx-plugin.cjs) removes the edges: it gives every other project
`implicitDependencies: ["!configuration"]`, so a new project needs nothing added.
The edges this project has to the packages it imports stay.

## What this repository keeps outside it

The tools that locate their own file at the root stay there: `nx.json`,
`package.json`, the pnpm and uv workspace files, `tsconfig.json`, the git and
editor dotfiles, and `validate-branch-name.config.cjs`, whose tool takes no
path. Everything a tool can be told to read lives here, and every command
passes the path explicitly; see [AGENTS.md](AGENTS.md).

## Reading root paths

A project's `{projectRoot}` is `projects/configuration`, but the targets here
read workspace-root paths. So each sets its `cwd` to `{workspaceRoot}` and lists
its inputs as `{workspaceRoot}` globs. The `workspace-files` named input stands
for every file no other project owns.
