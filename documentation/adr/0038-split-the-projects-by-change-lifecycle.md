# 0038: Split the Projects by Change Lifecycle

Dissolves the `synchronization` and `validation` projects. It keeps [ADR 0029](0029-keep-the-ci-steps-in-the-integration-project.md)'s CI steps in `integration`, and [ADR 0030](0030-let-software-install-named-tools.md)'s tool installs in `installation`.

## Context

`synchronization` held twelve commands and `validation` held five. The split was by what a command did, not by when it ran. `synchronization` wrote generated files from their sources, such as the conformetry generator table, the commit vocabulary, and the devcontainer's shared fields, and it also moved state between the repository and its tools, such as the installed skills and the pull request template. Its eleven commands plus one aggregate that ran them made up its twelve. `validation` checked a change: the catalog pins, the lockfile, the README's project rows, and the session's branch and worktree names.

Neither name said when its commands ran. A contributor could not tell from the project list which checks guarded a commit, which guarded a push, and which guarded the pull request into `main`, and the session hooks and CI reached into both projects.

## Decision

**Each project owns the stage of a change it guards.** Four projects now hold the commands that were split, and the two dissolved projects are deleted.

- **`integration` owns everything that guards a change on its way to `main`**: the local branch into its remote branch at commit and push, and a pull request into `main`. That covers the Continuous Integration plumbing, the checks, and the derivations that keep generated files in step with their sources. The hooks and lint-staged that invoke them stay in `configuration`, which holds every tool's configuration.
- **`installation` owns the machine and the session**: the installed skills and the VS Code settings, which a devcontainer and `postinstall` restore, and the session branch and worktree names the session-start hook checks.
- **`compliance` owns the pull request template**, which the pull request check reads and which the skill files embed.
- **`persistence` owns the migration SQL.** `typeorm-migration-sql` depends on no `integration` project, so a database project can use it without an edge into the CI plumbing.
- **`deployment` takes nothing**: its release commands were already in their own project.
- **`configuration` and `infrastructure` host no commands.** Neither has a `src/`. Every project depends on `configuration` ([ADR 0025](0025-run-the-workspace-tools-from-a-configuration-project.md)), so a command there would give every project a dependency on a command-line application it does not use. `infrastructure` holds Helm charts and Terraform, which run as plain targets.

**The mapping.** Every command the two projects held has one new home. The aggregate is the one command that keeps its name, explained below.

| Former project    | Command                                    | Now in         |
| ----------------- | ------------------------------------------ | -------------- |
| `synchronization` | `synchronization` (aggregate, now `start`) | `integration`  |
| `synchronization` | `conformetry-generators`                   | `integration`  |
| `synchronization` | `conventional-config`                      | `integration`  |
| `synchronization` | `devcontainer-configuration`               | `integration`  |
| `synchronization` | `vscode-extensions`                        | `integration`  |
| `synchronization` | `skill-exclusions`                         | `integration`  |
| `synchronization` | `package-manifests`                        | `integration`  |
| `synchronization` | `project-ports`                            | `integration`  |
| `synchronization` | `installed-skills`                         | `installation` |
| `synchronization` | `vscode-settings`                          | `installation` |
| `synchronization` | `pull-request-template`                    | `compliance`   |
| `synchronization` | `typeorm-migration-sql`                    | `persistence`  |
| `validation`      | `catalog-manifests`                        | `integration`  |
| `validation`      | `lockfile`                                 | `integration`  |
| `validation`      | `readme-projects`                          | `integration`  |
| `validation`      | `session-branch-name`                      | `installation` |
| `validation`      | `session-worktree-name`                    | `installation` |

**The aggregate keeps its name.** The `synchronization` command-line name stays on the `integration` aggregate, which `nx run integration:start` runs. The conformetry template fixes that name: `integration:conformetry-validate` requires the module's literal, and renaming it failed that check. Humans run `integration:start`, and the name stays internal.

## Consequences

- `integration:start` runs the ten checks and derivations, in check mode unless told otherwise. The commands in `installation`, `compliance`, and `persistence` run by name, so `start` does not cover them.
- `integration` takes a call-stack depth limit of 10, up from 6. It is the depth the old `synchronization` project was held to, and the breadth gate is fixed in code rather than by raising a limit.
- The `scope:synchronization` and `scope:validation` labels have no scope left to name. Repository admins delete them by hand, after checking that no open issue or pull request still carries them.
- Two checks fail on `main` for reasons this split did not cause, and a follow-up fixes each:
  - `typeorm-migration-sql check` fails on SQL drift in the caelundas-db, lexico-db, and meanderaw-db migrations.
  - `pull-request-template check` fails because `.agents/skills/create-pull-request/SKILL.md` drifted from the template in #2484. The release job's `write` resyncs the skill.
- Old commits that used the retired scopes fail the scope rule if commitlint re-lints them. CI lints only the head commit and the pull request title, so nothing blocks on them.
- The generated pages that still name the removed projects (the callidescope and codependix reports, and the OpenWiki pages) refresh on the next release write.
