# integration

**Purpose**: Everything that guards a change on its way to `main`, as tested commands. That is the local branch into its remote branch at commit and push, and a pull request into `main`. It holds the checks (catalog pins, the lockfile, the README's project rows), the derivations that keep generated files in step with their sources, and the Continuous Integration plumbing: the affected run, the Nx base and task-cache steps, codometer's baseline and pull-request report, and the weekly dependency upgrades. "Integration" in this project means that path, never the `vitest:integration` test kind. Commands only compute and print and set an exit code; services hold the logic behind injected file-system and process wrappers.

## Checks, derivations, and the aggregate

`src/modules/synchronization` holds what every check and derivation shares:
`SynchronizableCommand` (a `synchronizationLabel` and `synchronize(mode)`, which
reports success), the `check`/`write` mode service, the markers service that
splices generated blocks between marker comments, and the `start` aggregate. A
command with no `write` Nx configuration is just a check: `write` mode runs its
check. The aggregate runs every command, collects every failure, and prints the
command that fixes each: the command's own `fixCommand` (such as `pnpm install`),
else its own Nx target, `pnpm exec nx run integration:<label>`; a derivation sets `fixCommand` to its `:write` target.

Codometer caps a folder at 12 entries, and `src/modules/` already holds 11, so
each check and derivation lives under `src/modules/synchronization/modules/<command>/`,
never beside the CI commands. To put one in the aggregate, import its module in
`synchronization.module.ts` and add it to the `SYNCHRONIZABLE_COMMANDS` factory's
`inject` list; leave out any that must run only by name. Never raise the limit;
group further into `modules/` folders instead.

### Commands

Commands read their inputs from the environment, as the workflows and composite
actions set them, print what they decide, and set the exit code. Anything that
runs a child process goes through `ProcessRunnerService`, so a test replaces
one class.

| Command                                | Module                                                           | Called from                                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setup-codebase`                       | `src/modules/setup-codebase`                                     | the `setup-codebase` composite action, right after `pnpm install`; runs the four steps below it                                                                                                                                                                                                                 |
| `bound-base-to-push`                   | `src/modules/bound-base-to-push`                                 | `setup-codebase`, on a push with `nx-base: push-before`                                                                                                                                                                                                                                                         |
| `import-pr-task-cache`                 | `src/modules/import-pr-task-cache`                               | `setup-codebase`, in a merge group                                                                                                                                                                                                                                                                              |
| `verify-task-database`                 | `src/modules/task-database/modules/verify-task-database`         | `setup-codebase` and `cleanup-codebase`                                                                                                                                                                                                                                                                         |
| `adopt-task-database`                  | `src/modules/task-database/modules/adopt-task-database`          | `setup-codebase`                                                                                                                                                                                                                                                                                                |
| `cleanup-codebase`                     | `src/modules/cleanup-codebase`                                   | the `cleanup-codebase` composite action, before it saves the caches; runs the two steps below it                                                                                                                                                                                                                |
| `keep-task-database`                   | `src/modules/task-database/modules/keep-task-database`           | `cleanup-codebase`                                                                                                                                                                                                                                                                                              |
| `merge-task-cache`                     | `src/modules/task-database/modules/merge-task-cache`             | nothing in CI: `import-pr-task-cache` merges through the same service; run it by hand with a directory                                                                                                                                                                                                          |
| `run-affected`                         | `src/modules/run-affected`                                       | the Continuous Integration matrix legs, for every check but Secure                                                                                                                                                                                                                                              |
| `collect-codometer-baseline`           | `src/modules/collect-codometer-baseline`                         | the `report-integration` composite action, on a green `main` build                                                                                                                                                                                                                                              |
| `report-codometer-changes`             | `src/modules/report-codometer-changes`                           | the `report-integration` composite action, on a pull request's build                                                                                                                                                                                                                                            |
| `upgrade-dependencies`                 | `src/modules/upgrade-dependencies`                               | the `upgrade-dependencies` workflow                                                                                                                                                                                                                                                                             |
| `conventional-config`                  | `src/modules/synchronization/modules/conventional-config`        | the release workflow's `write` step; derives commit types and scopes, commitlint, release configuration. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                                      |
| `devcontainer-configuration`           | `src/modules/synchronization/modules/devcontainer-configuration` | the release workflow's `write` step and `test-devcontainer.sh`; derives the cloud devcontainer's shared fields. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                               |
| `package-manifests`                    | `src/modules/synchronization/modules/package-manifests`          | nothing in CI: run it by name; derives publishable package metadata. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                                                                          |
| `project-ports`                        | `src/modules/synchronization/modules/project-ports`              | `guard-code`; derives each `*-api` and `*-web` port. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                                                                                          |
| `skill-exclusions`                     | `src/modules/synchronization/modules/skill-exclusions`           | the release workflow's `write` step; derives installed-skill exclusion lists. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                                                                 |
| `vscode-extensions`                    | `src/modules/synchronization/modules/vscode-extensions`          | `guard-code` and `test-devcontainer.sh`; derives both devcontainers' extension lists. `check` by default, `write` rewrites; it sets `fixCommand` to its `:write` target                                                                                                                                         |
| `catalog-manifests`                    | `src/modules/synchronization/modules/catalog-manifests`          | `guard-code`; a check, no `write`: every workspace manifest pins externals as `catalog:` and internals as `workspace:*`. Collects every violation; has no `fixCommand`                                                                                                                                          |
| `lockfile`                             | `src/modules/synchronization/modules/lockfile`                   | `guard-code` and lint-staged; a check, no `write`: runs `pnpm install --frozen-lockfile --lockfile-only`. Sets `fixCommand` to `pnpm install`                                                                                                                                                                   |
| `readme-projects`                      | `src/modules/synchronization/modules/readme-projects`            | `guard-code`; a check, no `write`: the root README links every workspace project. Its `fixCommand` says to add a row for each missing project                                                                                                                                                                   |
| `skill-descriptions`                   | `src/modules/synchronization/modules/skill-descriptions`         | `guard-code`; a check, no `write`: every skill this repository authors (a skills folder the lockfile does not name, or a locked skill sourced here, read at its source) keeps its description within 64 words, and all of them within 12,500 characters. Its `fixCommand` says to shorten them                  |
| `agent-instructions`                   | `src/modules/synchronization/modules/agent-instructions`         | `guard-code` and the release workflow's `write` step; derives a `CLAUDE.md` symlink beside every project's `AGENTS.md`, because Claude Code loads `CLAUDE.md` and not `AGENTS.md`. `check` by default, `write` creates the links and never replaces a regular file; it sets `fixCommand` to its `:write` target |
| `synchronization` (the `start` target) | `src/modules/synchronization`                                    | a human at a terminal: `nx run integration:start` runs the eleven checks and derivations above in one process, `check` by default, or `:write`. The CLI name is internal: the conformetry template fixes it, and `conformetry-validate` requires it                                                             |

`setup-codebase` and `cleanup-codebase` run the services of the commands above
themselves, in a command of their own rather than a service: one more layer
would put the import's call stack over the depth limit. They read `NX_CACHE`
(and, for `setup-codebase`, `NX_SHAS`, `NX_BASE_SOURCE`, and `GITHUB_EVENT_NAME`)
to skip what the job did not ask for. The cache restores and saves, and the
artifact uploads, stay in the composite actions: they are actions, with no
command to replace them.

`run-affected` no longer drops spelling files: Nx's task-based affected
(`NX_LEGACY_AFFECTED=false`, set by `setup-codebase`) selects by each task's own
inputs, so a dictionary edit reaches only `spell-check`. What it still adds is
the conformetry config when a template changed, because `.nxignore` hides
templates from Nx.

`src/modules/process-runner` holds the wrapper over `node:child_process`
(`capture` returns the output, `captureSequence` runs several commands until one
fails, `captureAsync` does so without blocking, and `stream` inherits it). The `deployment` project keeps its own copy for the
release commands; the two are not shared
through a library yet. `src/modules/task-database` holds the service the three
task-database commands share; it reads `NX_WORKSPACE_DATA_DIRECTORY` and
`MACHINE_ID_FILES`, and opens the databases with the built-in `node:sqlite`, so
no `sqlite3` binary is needed.

`upgrade-dependencies` runs the steps listed in its constants one at a time. A
step is either a list of commands, run in order until one fails, or a task that
a service carries out: `upgrade-pnpm`, `upgrade-node` and `upgrade-python`, with
`package-manifest` editing the `package.json` fields the first two rewrite. A
task throws to say it failed, and returns the version it landed on, which the
pull request shows. No step uses a shell. Before each step the command records
the whole working tree as a git tree, untracked files included, and a step that
fails is undone by restoring that tree, which is what the previous step left, so
a later failure never undoes an earlier success. A skipped step is listed in the
pull request body the command writes to the OS temp directory and names in the
`body_path` output. Only a step that cannot be undone stops the run. To add an
upgrade, add a step to `UPGRADE_STEPS`: commands when nothing needs deciding, a
new task service when something does. A step that needs the environment rebuilt
after it is undone gives `recover` commands.

`upgrade-node` moves `.nvmrc` and `engines.node` to the newest release of the
major in use, read from nodejs.org, and never crosses a major or goes back.
`upgrade-python` never lowers the version: uv installs the newest stable Python
it knows, which can be older than one the repository already uses.

Run one locally with `nx run integration:start:<command>`, setting the
variables it reads (`TARGET`, `NX_BASE`, `NX_HEAD`, and so on).

### Executors

The project also holds Nx executors, registered in `executors.json` and resolved
by Nx as `integration:<name>`: the one place this repository keeps an executor
for a third-party tool. They exist to be **batched**. Nx only batches an executor
that names a `batchImplementation`, and `nx:run-commands` has none, so a tool run
once per project pays its start-up once per project.

| Executor      | Replaces                                    | Source                      |
| ------------- | ------------------------------------------- | --------------------------- |
| `knip`        | `knip --workspace <root>`, once per project | `src/executors/knip`        |
| `spell-check` | `cspell '<root>/**'`, once per project      | `src/executors/spell-check` |

`knip` runs one `knip --reporter json --workspace <root> --workspace <root> …` for
every task Nx batches, reads which workspace each issue's file sits in, and fails
a task only when an issue is in its own workspace. A failed task is run again by
itself to get knip's own report, and the batch executor prints each failure under
its task id, because Nx stores a batch task's output but never prints it. Nothing
is read as a pass it did not earn: output that is not a report, or a failing exit
with no issue in any workspace asked about, fails every task. A task asked to fix
(`-c write`) is run on its own. Each task is still hashed, cached and replayed by
itself, and `--batch=false` turns batching off.

`spell-check` runs one `cspell` over every task's root, reads the file each
finding names, and charges it to every root that holds it — a nested project's
files are also under its parent's, as they are when each is run alone. A clean
exit passes every task; a failing exit with no finding under any root asked about
fails every task. A failed task is run again by itself for cspell's own report,
which the batch executor prints under the task id.

Codometer's executor lives with its Nx plugin, `@codometer/nx`, the way
coinagerie's does; `codometer-limit` and `codometer-weigh` are inferred from it.

An executor here is plain functions rather than a NestJS service, since Nx calls
it directly, and it declares only the fields of Nx's context it reads, so this
project needs no dependency on `@nx/devkit`.

Steps that run before `pnpm install` cannot live here, because a command needs
the installed dependencies.
