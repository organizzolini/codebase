# ↔️ Synchronization

**Keep the derived files derived.**

Some files in this workspace are not really written — they are copies of, or
tables generated from, something else. The generator table in `AGENTS.md` comes
from the conformetry configuration. The cloud devcontainer shares most of its
fields with the local one. The PR template appears verbatim inside a skill.

Every one of those is a place where two files can quietly disagree.
Synchronization is the NestJS CLI that regenerates them, and the CI check that
fails when someone edits the copy instead of the source.

## Usage

Every synchronization command is its own Nx target on this project, run
directly rather than through a shared aggregate — the same way
[`configuration:codometer`](../ic-suite/codometer/codometer-cli/README.md) and
[`configuration:callidescope`](../ic-suite/callidescope/callidescope-cli/README.md) are named
by their own callers instead of looping through one process:

```bash
nx run synchronization:conformetry-generators          # check (the default)
nx run synchronization:conformetry-generators:write     # regenerate
```

Every command runs in one of two modes:

| Mode    | Does                                                           |
| ------- | -------------------------------------------------------------- |
| `check` | Compares, writes nothing, exits non-zero on drift. The default |
| `write` | Regenerates the derived file from its source                   |

`start` runs every synchronization command in one process instead of one at a
time — the only target that does. No workflow or `lint-staged` pattern names
it; it exists purely for a human at a terminal who wants to check or write
everything in one command:

```bash
nx run synchronization:start          # check every synchronization
nx run synchronization:start:write    # write every synchronization
```

## Where each synchronization's drift is answered

Which runs check which synchronization is a property of the caller, not a
taxonomy the commands declare about themselves. Five of the six — every one
except `pull-request-labels` — are **derivations**: committed files derived
from configuration a pull request can also change, so `check` runs on a pull
request and `write` runs on the default branch's release. The
[🧑‍🔧 Lint Codebase](../../.github/workflows/lint-code.yml) workflow and
[`configuration/lint-staged.config.ts`](../../configuration/lint-staged.config.ts)
each name every derivation target directly alongside `lint-code` in one
`nx affected` invocation, rather than reaching them through
[`lint-code`](../../AGENTS.md#code-quality)'s `dependsOn` — Nx forwards an
explicit configuration down `dependsOn`, so an edge there would let
`lint-code --configuration=write` publish from a branch.

`project-ports` is the odd one out: nothing derives a port from configuration,
because the project's name is the source. It has no caller of its own yet, so it
runs only by name (`nx run synchronization:project-ports[:write]`), not in `start`.

`pull-request-labels` needs credentials: its destination is GitHub's label set
rather than a file in the tree, so reaching it needs a token that neither a
fork nor a developer's `lint-code` run has. It must not run in
`lint-code`, and it must not wait for the default branch either — a change
introducing a new scope needs that scope's label to exist before 🧾 Validate
Pull Request Metadata runs on the very same pull request. So the one caller
holding a token, [comply-code.yml](../../.github/workflows/comply-code.yml),
runs its `write` mode directly through `node` rather than through this Nx
target, on `opened`/`reopened`, and nothing else names it.

## What it synchronizes

| Command                      | Source                                  | Destination                                                                                           |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `conformetry-generators`     | `configuration/conformetry.config.ts`   | The generator table in `AGENTS.md`, between marker comments                                           |
| `conventional-config`        | `configuration/conventional.config.cjs` | The commit type and scope tables, commitlint, and release configuration                               |
| `devcontainer-configuration` | `.devcontainer/local/devcontainer.json` | The shared fields of `.devcontainer/cloud/devcontainer.json`                                          |
| `installed-skills`           | `skills-lock.json`                      | The installed skills in `.agents/skills/`, restored from their sources. Run by `postinstall`          |
| `project-ports`              | Each `*-api` and `*-web` name           | The port in `vite.config.mts` or `.env.default`, and the lines about it in the domain folder          |
| `pull-request-labels`        | `configuration/conventional.config.cjs` | This repository's `type:`, `scope:`, and `source:` labels on GitHub. Needs credentials                |
| `pull-request-template`      | `.github/PULL_REQUEST_TEMPLATE.md`      | The template embedded in the PR skill files                                                           |
| `skill-exclusions`           | `skills-lock.json`                      | Installed skills and their vendored files, in six tool files                                          |
| `vscode-extensions`          | `.vscode/extensions.json`               | The `extensions`, `recommendations`, and `unwantedRecommendations` lists of both devcontainer configs |
| `vscode-settings`            | `.vscode/settings.json`                 | The VS Code Machine settings in a devcontainer. Left out of `start`: only a devcontainer has them     |

### Pull request labels

`pull-request-labels` is the odd one out: its destination is GitHub rather than
a file. It reads `configuration/conventional.config.cjs` and reconciles the
repository's labels against it — every `type:<name>`, every lowercased
`scope:<name>`, and the three `do-not-merge`, `source:agent`, and
`source:human` labels that no configuration derives. It creates what is missing
and edits whatever color or description drifted.

It never deletes. A label the configuration dropped may still be on open pull
requests, and removing it there loses information no run can put back, so a
stale `type:`, `scope:`, or `source:` label is reported with the
`gh label delete` command that would remove it, for a human to decide on. This
repository has one standing already, which is why "nothing needed creating or
updating" is said explicitly rather than inferred from an empty report — the
report is never fully empty even on a perfectly reconciled run.

It also always succeeds. A missing label is a fact about the repository under
review rather than a defect in the pull request, and a `gh` that is absent,
read-only on a fork, or rate-limited is an environment rather than an answer —
both are warnings, so this can never be why a pull request goes red. Reads and
writes both go through the `gh` client, which already resolves the repository
from the checkout and the token from the environment.

Run it on its own through its own Nx target:

```bash
nx run synchronization:pull-request-labels:write
```

## Why callers name targets directly

Every synchronization command used to be selected through a shared aggregate's
`--kinds` flag, so a caller asked for a set of kinds rather than for the
commands it actually wanted. That flag needed a taxonomy describing which
commands each caller wanted, and the taxonomy kept stretching every time a new
caller's requirements did not fit the existing values.

Each command is its own Nx target instead, run directly the way
[`configuration:codometer`](../ic-suite/codometer/codometer-cli/README.md) and
[`configuration:callidescope`](../ic-suite/callidescope/callidescope-cli/README.md) are named
by their own callers. Which commands a caller wants is a property of the
caller — the list of `--target` flags it passes — rather than something the
commands declare about themselves centrally. Each target declares its own
sources as `inputs`, so `nx affected` only reruns it when a file it actually
reads has changed, and each caller decides for itself which targets belong in
which invocation:

- [🧑‍🔧 Lint Codebase](../../.github/workflows/lint-code.yml) and
  [`configuration/lint-staged.config.ts`](../../configuration/lint-staged.config.ts)
  each name every derivation target directly alongside `lint-code` in one
  `nx affected` invocation, so a pull request and a commit both check drift.
- The release workflow runs every derivation's `write` configuration through
  `nx run-many`, so one command still publishes everything.
- [comply-code.yml](../../.github/workflows/comply-code.yml)
  runs `pull-request-labels write` directly through `node`, bypassing Nx
  entirely, since it is the one caller with a token and needs no project graph.

None of these callers reach for `start`. `SynchronizationCommand` still exists
and still loops over every command in one process — that part of the old
design was never the problem, and Nx's own `run-many` gives no way to run a
plain Node command with no target of its own — but nothing selects a subset
through it, so it needs no taxonomy: `start` always means all of them.

## Adding a synchronizer

1. Generate a module: `nx g conformetry:nestjs-command-module --name=<domain> --project=synchronization`
2. Implement `SynchronizableCommand` — a `synchronizationLabel` and a
   `synchronize(mode)` returning whether the destination was already current.
3. Add a top-level target for it in `project.json`, with `check`/`write`
   configurations and its own source paths as `inputs`, the same shape as the
   existing six. That target is the whole declaration of where the command
   runs: name it directly wherever it belongs — `lint-code`'s dependents
   for a derivation, the release workflow's `run-many` for a report, or a
   caller with its own credentials for anything needing them.
4. Register the command in `SynchronizationCommand.getCommands()`, and import
   its module in `SynchronizationModule`, so `start` still drives it alongside
   every other synchronization.

## Start

```bash
nx run synchronization:start
```

## Test

```bash
nx run synchronization:vitest
```

## Development

```bash
nx run synchronization:repl
nx run synchronization:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
```

## License

MIT — see [LICENSE](../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.
