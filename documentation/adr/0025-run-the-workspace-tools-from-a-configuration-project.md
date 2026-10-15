# 0025: Make the Workspace Configuration an Nx Project, and Hide It From the Graph

## Context

The root `project.json` had grown to about 1,200 lines. Roughly three quarters of it was one kind of target: the commands that run a tool over the repository's own files — ESLint, oxlint, oxfmt, knip, fallow, cspell, gitleaks, the commit hooks, and the three IC-suite publishers — each pointing at a file in a top-level `configuration/` folder that belonged to no project but the root.

Making that folder an Nx project looks like the whole refactor, and it is not. Every project's `eslint.config.ts`, `vite.config.ts`, and `vitest.config.ts` imports from it, and it imports the IC-suite packages in turn. Nx records an edge for an import into a nested project, though it records none for an import into the root project, which is why the arrangement had worked. Measured with `nx graph`, a project owning that folder gave every one of the 52 other projects a dependency on it, and the codependix `no-project-cycles` rule found 13 cycles through each package's `core` layer. A change to the folder would also have marked every ic-suite package affected, and `nx release` reads that affected set to decide what to republish.

## Decision

**The folder moves to `projects/configuration` and becomes the `configuration` project**, with the targets that run the tools, a README, and an AGENTS file.

**A local plugin, `projects/configuration/nx-plugin.cjs`, gives every other project `implicitDependencies: ["!configuration"]`.** Nx removes a negated edge even when it detected the import, so no project depends on `configuration`, while the edges `configuration` has to the packages it imports stay. One plugin covers every project, present and future. The alternative, the same line in each of the 52 `project.json` files and in every generator template, fails silently the first time a project is added without it.

The moved targets read workspace-root paths, so each sets `cwd` to `{workspaceRoot}` and lists `{workspaceRoot}` globs as inputs. The `workspace-files` named input stands for every file no other project owns, which is what `default` meant for the root project. A target with no `inputs` would inherit a `default` covering only `projects/configuration`, so every cached target declares them.

**It carries no tags.** The `language:typescript` target defaults would merge into the commands written here, and the root project avoids that the same way: the tags in `nx.json`'s `projects` block never reach the project graph. The `@nx/vite`, `@nx/eslint`, and `@nx/vitest` plugins exclude the project, since the config files it holds would otherwise infer targets for it.

## Consequences

- `nx affected` selects `configuration` when a file one of its targets reads changes, through those `{workspaceRoot}` inputs, so the checks that used to run for the root project still run for it. Narrowing an input silently stops a check running in CI.
- Every reference to the old folder changed: the relative imports in each project, the `--config` flags, `{workspaceRoot}` inputs, the conformetry templates, and the docs. References are workspace-root-relative with `projects/` inserted, rather than shortened, so a template's `{{workspaceRelativePrefix}}` still resolves from any depth.
- The root project keeps what concerns the repository as a whole: the typecheck, the lockfile and manifest checks, the pull request validators, the database and Terraform targets. Its `lint-code` and `format-code` shrink to the SQL targets.
- Knip's Nx plugin reads only the root workspace's `project.json`, and `projects/configuration` has no `package.json` to make it a knip workspace, so `knip.config.ts` names that file under the root workspace's `nx.config`. Without it, cspell, fallow, license-checker, lint-staged, and syncpack report as unused.
- Callers name `configuration:<target>` for every moved target. That includes the text codependix writes above each README's graphs, which comes from a constant in `codependix-output`.
- `core.hooksPath` is set by `husky projects/configuration/.husky` in `prepare`. Git runs no hooks, and says nothing, when that directory is missing, so a checkout installed before this change keeps committing unprotected until its next install. `scripts/git/validate-session-hooks-path.sh` reports that at every agent session start and prints the repair.
- No tool is assumed to look in a configuration folder. `@conformetry/cli` defaults to `conformetry.config.ts` in the working directory, the callidescope and codependix plugins drop their `configuration/…` search entry, and every command in this project passes its config and ignore files explicitly. The two files whose tools would discover them by name, `markdownlint-cli2.config.jsonc` and `.shellcheck.rc`, have non-dot names for that reason.
