# 0025: Make the Workspace Configuration an Nx Project, Out of Releases

## Context

The root `project.json` had grown to about 1,200 lines. Roughly three quarters of it was one kind of target: the commands that run a tool over the repository's own files — ESLint, oxfmt, knip, fallow, cspell, gitleaks, the commit hooks, and the three IC-suite publishers — each pointing at a file in a top-level `configuration/` folder that belonged to no project but the root.

Making that folder an Nx project means every project depends on it. Each project's `eslint.config.ts`, `vite.config.ts`, and `vitest.config.ts` imports from it. Nx records an edge for an import into a nested project, though it records none for an import into the root project, which is why the arrangement had worked. Measured with `nx graph`, the folder gave every one of the 52 other projects a dependency on it. It also imports six IC-suite packages for their types, and those edges closed 13 cycles through each package's `core` layer.

An edge is also how Nx release decides which packages a commit touches, under [ADR 0023](0023-version-packages-by-everything-a-commit-affects.md). A project that every package depends on would patch-bump all 28 for any commit that edits it, including a hook script.

## Decision

**The folder moves to `projects/configuration` and becomes the `configuration` project**, with the targets that run the tools, a README, and an AGENTS file.

**It stays in the graph.** Every project depends on it, which is what they do. The six edges it has to the packages it imports are removed with `implicitDependencies` in its `project.json`, which removes the cycles. It carries the tag `name:configuration`, each `allow` rule in `codependix.config.ts` names that tag as a permitted target, and the `*-is-a-leaf` rules reach every project but it.

**A release ignores it.** `scripts/release/version-packages.sh` appends `projects/configuration/` to `.nxignore` for the one `nx release` command and restores the file on exit. Nx drops ignored files from the changes it reads for a commit and from the graph, so a commit that edits only configuration releases nothing, and a commit that edits a package still releases that package. CI and local runs never see the ignore, so `nx affected` still reaches every project when configuration changes.

The moved targets read workspace-root paths, so each sets `cwd` to `{workspaceRoot}` and lists `{workspaceRoot}` globs as inputs. The `workspace-files` named input stands for every file no other project owns, which is what `default` meant for the root project. A target with no `inputs` would inherit a `default` covering only `projects/configuration`, so every cached target declares them.

**It carries no `language:*` tag.** The `language:typescript` target defaults would merge into the commands written here, and the root project avoids that the same way: the tags in `nx.json`'s `projects` block never reach the project graph. The `@nx/vite`, `@nx/eslint`, and `@nx/vitest` plugins exclude the project, since the config files it holds would otherwise infer targets for it.

## Consequences

- A change to `projects/configuration` affects every project in `nx affected`, through the graph, and the cache keeps the unchanged tasks cheap. Its own targets still run when a root file they read changes, through their `{workspaceRoot}` inputs. Narrowing an input silently stops a check running in CI.
- Every reference to the old folder changed: the relative imports in each project, the `--config` flags, `{workspaceRoot}` inputs, the conformetry templates, and the docs. References are workspace-root-relative with `projects/` inserted, rather than shortened, so a template's `{{workspaceRelativePrefix}}` still resolves from any depth.
- The root project keeps what concerns the repository as a whole: the typecheck, the lockfile and manifest checks, the pull request validators, the database and Terraform targets. Its `lint-code` and `format-code` shrink to the SQL targets.
- Knip's Nx plugin reads only the root workspace's `project.json`, and `projects/configuration` has no `package.json` to make it a knip workspace, so `knip.config.ts` names that file under the root workspace's `nx.config`. Without it, cspell, fallow, license-checker, lint-staged, and syncpack report as unused.
- Callers name `configuration:<target>` for every moved target. That includes the text codependix writes above each README's graphs, which comes from a constant in `codependix-output`.
- `core.hooksPath` is set by `husky projects/configuration/.husky` in `prepare`. Git runs no hooks, and says nothing, when that directory is missing, so a checkout installed before this change keeps committing unprotected until its next install. `scripts/git/validate-session-hooks-path.sh` reports that at every agent session start and prints the repair.
- No tool is assumed to look in a configuration folder. `@conformetry/cli` defaults to `conformetry.config.ts` in the working directory, the callidescope and codependix plugins drop their `configuration/…` search entry, and every command in this project passes its config and ignore files explicitly. The two files whose tools would discover them by name, `markdownlint-cli2.config.jsonc` and `.shellcheck.rc`, have non-dot names for that reason.
