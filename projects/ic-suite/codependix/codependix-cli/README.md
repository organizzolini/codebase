# 🕸️ Codependix CLI

[![npm](https://img.shields.io/npm/v/@codependix/cli?logo=npm&label=npm)](https://www.npmjs.com/package/@codependix/cli)

**Exports a project's dependency graphs — Nx, NestJS, and file-level imports — as JSON and Markdown diagrams, and gates the rules those graphs are judged against.**

Codependix reads what each project depends on and renders it four ways: the
Nx project graph, a NestJS project's module graph, a TypeScript project's own
file-level import graph, and a Python project's own file-level import graph.
Each graph is delivered to whichever destinations
`codependix.config.ts` names for that project — a JSON file, a Markdown anchor
block spliced into an existing file such as a `README.md`, or both. The same
built graphs are then judged against whatever rules the configuration
declares — see [`@codependix/boundaries`](../codependix-boundaries/README.md).

```bash
pnpm add --filter <project> --save-dev @codependix/cli
```

```bash
codependix map --write --config configuration/codependix.config.ts
```

## Usage

One command, `map`, and no per-graph-type subcommand. Which graphs run for a
project, where its export lands, and which rules judge it is entirely a
function of the configuration file, which every run names with `--config`
because nothing searches for it and there is no default; see
[`configuration/codependix.config.ts`](../../../configuration/codependix.config.ts)
for this repository's own.

| Flag | Meaning |
| ---- | ------- |
| `--check [check]` | Fail on a comma-separated set drawn from `boundaries` and `reports` |
| `--config <config>` | **Required.** Path to the codependix configuration file. Omitting it fails the run, naming the flag; nothing is searched for |
| `--dependencies` | Build `--check boundaries` over the dependencies of the projects `--projects` or `--tags` named, reporting their findings as notes (default). No effect without `--projects` or `--tags` |
| `--no-dependencies` | Build `--check boundaries` over only the projects `--projects` or `--tags` named, not their dependencies. No effect without `--projects` or `--tags` |
| `-d, --directory [directory]` | Workspace root whose Nx project graph this run reads. Defaults to the working directory |
| `--exclude [exclude]` | Comma-separated globs overriding the configured `exclude`. Refused when `exclude` was never configured |
| `--file-imports` | Build, check, and write the `fileImports` graph type for this run |
| `--no-file-imports` | Skip the `fileImports` graph type for this run |
| `-f, --format [format]` | What to print to standard output, one of `json` and `markdown` (default: `markdown`). A graph type prints only when the run also configured a workspace destination for it, even if its own toggle flag enabled it. A `--check boundaries` run adds its findings, under a `boundaries` key in `json` and a `Boundaries` section in `markdown` |
| `--include [include]` | Comma-separated globs overriding the configured `include`. Refused when `include` was never configured |
| `--json-output [jsonOutput]` | Write every active graph type's data, combined into one JSON file at this path, keyed by graph type name. A type appears only when the run also configured a workspace destination for it. A `--check boundaries` run adds its findings under a `boundaries` key |
| `--markdown-output [markdownOutput]` | Write every active graph type's rendered diagram, combined into one Markdown file at this path. A type appears only when the run also configured a workspace destination for it. A `--check boundaries` run adds its findings as a `Boundaries` section |
| `--nestjs-modules` | Build, check, and write the `nestjsModules` graph type for this run |
| `--no-nestjs-modules` | Skip the `nestjsModules` graph type for this run |
| `--nx-projects` | Build, check, and write the `nxProjects` graph type for this run |
| `--no-nx-projects` | Skip the `nxProjects` graph type for this run |
| `--projects [projects]` | Comma-separated project names or roots to export for, as globs, beyond those `include` already selects. Also narrows the Workspace Graph to the named set, and `--check boundaries` to failing only on findings charged to it |
| `--tags [tags]` | Comma-separated Nx tags to export for, beyond what `include` already selects. Narrows the Workspace Graph and `--check boundaries` to the tagged projects, as `--projects` does |
| `--write` | Writes every configured export |

### The two `--check` names

`--check` names which finding fails the run, because the two findings belong
on opposite sides of a pull request.

| `--check` value | What fails the run |
| --------------- | ------------------ |
| `boundaries` | An edge, or a cycle, breaking a declared rule |
| `reports` | A configured destination no longer holding what a fresh run would write |

A boundary violation is caused by the branch and fixed by the branch, so it
gates every pull request, one project at a time — see
[The per-project gate](#the-per-project-gate). A stale export moves with the
workspace it describes and would fail every branch that changed a project
graph rather than anything the branch itself did, so it is published on the
default branch and gated nowhere. That is the same split
[`callidescope`](../callidescope-cli/README.md) makes between `--check depth`
and `--check reports`, and `reports` is deliberately spelled the same in both:
it is the same finding, and two names for it would make the two reports
unreadable together.

- `--check boundaries` reads no destination and writes nothing, so it leaves
  every committed export exactly as it found it.
- `--write --check boundaries` is legal — a boundary has no destination to be
  stale.
- `--write --check reports` is refused: an export cannot be stale in the run
  that just wrote it.
- A bare `--check`, or one whose value is only separators, is refused. Read as
  "gate nothing" it would be a gate that cannot fail, which is worse than no
  gate at all because it looks like protection.

### Which project a boundary finding fails

Every finding is charged to the project or projects it belongs to: a cycle to
every project owning a node on it, a forbidden edge to the project owning its
source, a file- or NestJS-level finding to the project whose graph it was
found in, and a container that cannot boot to that container's project — its
message naming the project that owns the class it failed on, when the stack
shows another one.

`--projects` and `--tags` name the projects a run judges. Graphs are built
over those projects and everything they transitively depend on, and a finding
fails the run only when it is charged to a named project. One charged only to
a dependency is logged as a note, "in dependency", without failing:
the named project is built on it, but it is not that project's to fix.
`--no-dependencies` builds over the named projects alone. With neither flag
every project is judged. A `--projects`/`--tags` selection that matches no
project at all — a misspelled name, a tag nobody carries, or the workspace
root — is refused as a rejected command line rather than run as a gate that
judges nothing.

### When no mode is named

Naming neither `--check` nor `--write` is asked about, as a three-item menu —
`boundaries`, `reports`, `write`.

There is no flag that turns the prompt off, because there is nothing to turn
off where it cannot be answered: a run whose stdin is not a terminal fails
immediately, naming the flag it wanted, rather than drawing a menu. That
refusal is load-bearing rather than defensive — `prompts` does not fail on a
non-terminal stdin. It renders the menu, never resolves, and lets the process
exit 0, which would turn a scripted run that forgot its mode flag into a
silent success that wrote nothing. Dismissing the menu at a terminal is
reported the same way, as a rejected command line rather than a crash.

No mode is ever inferred, which is the rule `codometer`'s and
`callidescope`'s flags follow too.

In an Nx workspace the gate is a per-project `codependix-bound` target, and
publishing is the one workspace-wide `write` run. This repository's `guard-code`
reaches the first on every pull request, and its release workflow runs the
second on the default branch:

```bash
nx run <project>:codependix-bound
nx run configuration:codependix:write
```

One project failing — a missing anchor, or a NestJS project that fails to
boot its container — is reported and does not stop the rest: `--write` either
fully succeeds or names exactly which projects failed while still completing
every other one.

### The per-project gate

`--check boundaries --projects <name>` is a gate for one project, and needs no
task runner. [`@codependix/nx`](../codependix-nx/README.md) infers it for an
Nx workspace as a cached `codependix-bound` target on every project but the
workspace root, so `nx affected -t codependix-bound` selects the projects a
change touched and a failure names the project it is charged to rather than
one workspace-wide task. The target declares no configurations, so
`guard-code --configuration=check` falls through to its defaults, as
`callidescope-restrict` does.

Publishing stays workspace-wide: one `--write` run produces every project's
anchor blocks, which must reflect one commit, so `configuration:codependix` is
`write`-only and is not part of `guard-code`.

### Where the output goes

Printing and delivering are separate. `--format` decides what reaches standard
output; the destinations under `workspace` in the configuration and
`--json-output`/`--markdown-output` decide what reaches a file.

Markdown is the console default because it is the one rendering that reads in a
terminal and pastes into an issue. `--format json` is for a machine reading
standard output, so every diagnostic goes to standard error — keeping standard
output clean and parseable as data.

### The boundary report

`--check boundaries` logs its findings to standard error and, given
`--format`, `--json-output`, or `--markdown-output`, also prints them as a
report: under a `boundaries` key in JSON, and as a `### Boundaries` section in
Markdown. A `--check boundaries`-only run, which exports nothing, prints just
that report; a run that also exports carries both in one document. Without one
of those flags a boundaries-only run prints nothing, and a run that also
exports prints its graphs exactly as it did before.

The JSON holds `judgedProjects` (the projects whose findings fail the run),
`violations` (`level`, `rule`, `message`, `source`, `target`, `cycle`, the
charged `projects`, and a `verdict` of `fail` or `note`) and `failures`
(`level`, `error`, the charged `projects`, an `ownerProject` when the failing
code belongs to another project, and a `verdict`). A `note` is a finding that
lives in a dependency of a judged project and does not fail the run. The
Markdown lists the same findings under each project they are charged to, a
note marked as not failing.

Who a finding is charged to is worked through, with the report each case
prints, in four examples:
[a cycle](../codependix-examples/examples/boundary-cycles/README.md),
[a forbidden edge](../codependix-examples/examples/boundary-forbidden-edges/README.md),
[a dependent of either](../codependix-examples/examples/boundary-dependency-notes/README.md),
and [a container that cannot boot](../codependix-examples/examples/boundary-boot-failures/README.md).

## Packages

| Package | Role |
| ------- | ---- |
| [`@codependix/cli`](.) | Orchestrates the four graph builders and delivers their exports |
| [`@codependix/boundaries`](../codependix-boundaries/README.md) | Builds each level's graph for a workspace, judges it against the declared rules, and reports what breaks them. `--check boundaries` delegates to it wholesale |
| [`@codependix/configuration`](../codependix-configuration/README.md) | Reads `codependix.config.ts` and resolves per-project export destinations and boundary rules |
| [`@codependix/examples`](../codependix-examples/README.md) | Twenty-one subjects built to be graphed, each with the guide codependix renders from it |
| [`@codependix/nx`](../codependix-nx/README.md) | Nx plugin: infers a per-project `codependix-bound` target that runs `--check boundaries` over the project and its Nx dependencies |
| [`@codependix/nx-projects`](../codependix-nx-projects/README.md) | Builds a project's Nx Neighborhood and the whole-workspace Workspace Graph |
| [`@codependix/nestjs-modules`](../codependix-nestjs-modules/README.md) | Explores a NestJS project's container and builds its module graph |
| [`@codependix/file-imports`](../codependix-file-imports/README.md) | Builds a project's file-level import graph — a `typescript` module walking its own `ts.Program`, and a `python` module parsing `import`/`from ... import` statements |

## Agent skills

Agent skills for coding agents working with codependix are published in
[`@codependix/agents`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-agents):

| Skill | Description |
| ----- | ----------- |
| [`codependix-export`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-agents/skills/codependix-export) | Export dependency graphs and run boundary checks |
| [`codependix-configure`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-agents/skills/codependix-configure) | Configure graph types, export destinations, and boundary rules in `codependix.config.ts` |
| [`codependix-navigate`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-agents/skills/codependix-navigate) | Query dependency paths and navigate package relationships |
| [`codependix-triage`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-agents/skills/codependix-triage) | Triage boundary violations and report drift |

## Examples

Every behavior described above — and every one that is not, because it lived
only in a JSDoc comment until now — has a worked example rendered by the real
tool in
[`@codependix/examples`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-examples):

- [README](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-examples) — one directory per example, each
  readable on its own, plus configuring a first export destination and adopting
  codependix in a workspace with no anchor blocks anywhere yet
- [AGENTS.md](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-examples/AGENTS.md) — a "codependix said X → open
  this example" table, weighted toward the refusals and toward `--check`
  staleness

## Start

```bash
nx run codependix-cli:start
```

## Test

```bash
nx run codependix-cli:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codependix-cli:coinagerie-check:write`.

- **acyclic**: Rule kind string in the nxProjects configuration that fails a run whenever a named set of projects forms a cycle.
- **anchor**: Config key naming the marker inside a Markdown destination where a graph section is spliced in place.
- **boundary**: Rule-checked constraint on project dependencies; the check command fails the run when an edge breaks a declared rule.
- **breadth**: Count of direct callees of one callable, which callidescope measures and limits with maximumBreadth.
- **forbid**: Rule kind string in the nxProjects configuration that fails a run when a from-selected project depends on a to-selected one.
- **restrict**: Verb naming callidescope-restrict, the inferred gate target that fails when a project breaks its own depth or breadth limits.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-4346-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-203.09_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-5-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-32-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-5.89_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-32-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-2-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-39-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-45-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-1-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-10-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-19-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-6-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-232-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-46-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-178-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-100-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-158-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-116-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-12-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-138-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-255-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

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

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-186-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-41-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-12-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-118-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-106-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-7-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-45-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-167-dc2626?style=flat-square)
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

![Module Files](https://img.shields.io/badge/Module_Files-3-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-0-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-2-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-3-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-2-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-7-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-2-7c3aed?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-4-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-1464-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-81-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-106-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-370-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-92-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-325-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-6-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-48-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-34-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-35-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-196-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
