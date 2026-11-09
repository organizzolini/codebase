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

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run synchronization:coinagerie-check:write`.

- **breadth**: Callidescope measure of how many direct callees a frame fans out to, gated for every traced project in the workspace.
- **corrupt**: Fake behavior flag corruptsLockfile that simulates a restore which damages the lockfile, testing the safety check.
- **preset**: Semantic-release preset configuration whose types list conventional-config appends missing commit types into.
- **rewrite**: Verb for sync replacing dropdown options, markdown tables, or scope arrays inside marked blocks of source files.
- **scenario**: Name field for each parameterized test case, such as scenarioName in the conformetry generator command tests.
- **synchronizable**: Interface implemented by each synchronizer command, such as conformetry generators, so one run can dispatch to all of them.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-12612-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-523.54_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-15-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-98-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-98-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-34-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-53-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-274-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-1-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-27-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-20-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-38-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-538-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-266-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-546-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-258-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-729-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-496-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-134-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-435-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-800-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-4-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-3-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-373-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-89-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-17-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-224-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-173-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-17-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-70-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-297-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-13-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-10-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-12-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-13-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-12-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-1-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-25-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-1-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-3-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-1151-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-9-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-20-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-80-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-6-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-36-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-6-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-160-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-14-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-37-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-674-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
