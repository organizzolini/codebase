# 🕸️🧬 Codependix Nx

[![npm](https://img.shields.io/npm/v/@codependix/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@codependix/nx)

**An Nx plugin that checks codependix boundaries per project, built over each project's Nx dependency closure.**

Canonical documentation for graph exports, configuration, boundary rules, and
how a finding is charged to a project is in the
[`@codependix/cli` README](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli#readme).
`@codependix/cli` needs no Nx plugin: `--projects` and `--tags` already
narrow a `--check boundaries` run to the projects it judges, from a plain
shell. This package is the one place in the toolchain that depends on
`@nx/devkit`, and it adds what only a task runner can:

- **A gate on every project**, so `nx affected`, `--projects=tag:…`, and the
  task cache do the selecting.
- **A failure named after the project whose boundary broke**, rather than one
  workspace-wide task that fails for all of them.

## Install

```bash
npm install --save-dev @codependix/nx
```

Register it in `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "@codependix/nx",
      "options": {
        "configurationPath": "configuration/codependix.config.ts",
        "gateTargetName": "codependix-gate"
      }
    }
  ]
}
```

| Option | Meaning |
| ------ | ------- |
| `configurationPath` | **Required.** Where the codependix configuration lives. Registering the plugin without it fails inference, naming the option; there is no default path |
| `gateTargetName` | Name of the inferred gate target. `codependix-gate` when omitted |

The gate runs the command line under the `@swc-node/register` hooks, which
this plugin depends on and registers itself — the workspace does not need to
install them. The workspace root does need a `tsconfig.json` that emits
decorator metadata: the hooks read it from the working directory, the
boundary check boots NestJS containers from their TypeScript sources, and
constructor injection reads that metadata.

## Usage

The gate is inferred onto every project described by a `project.json`,
except the workspace root, whose dependency closure is the whole workspace. A
project Nx infers from a `package.json` alone gets no gate until it is given
a `project.json` as well.

```bash
nx run lexico-entities:codependix-gate          # one project
nx run-many -t codependix-gate                  # every project
nx affected -t codependix-gate                  # only what changed
```

### The gate

Each gate runs, from the workspace root:

```bash
node --import <file URL of @codependix/nx/loader> <@codependix/cli/main> \
  map --directory <workspaceRoot> --config <configuration> \
  --check boundaries --projects <project>
```

`@codependix/nx/loader` registers the `@swc-node/register` hooks resolved from
this plugin's own location. The hook's own `@swc-node/register/esm-register`
would resolve them from the working directory instead — the consumer's root,
where a package manager such as pnpm does not expose this plugin's
dependencies. The loader and the command line's entry are both resolved
through package exports, so the same gate runs the TypeScript sources inside
this workspace and the built `dist/` files from an installed copy. Its output
is streamed to the task as it arrives, and the task passes only when it exits
zero.

**A dependency's broken boundary is that dependency's gate's business.** The
graphs are built over the project and everything it depends on, so a cycle
reaching into a dependency is still seen — but only a finding charged to the
project fails its gate. One charged to a dependency is printed as a note, and
fails the dependency's own gate instead.

The target is cached. Its inputs are the project's own sources and its
dependencies' (`default`, `^default`), the workspace configuration the rules
live in, the project's own `codependix.config.*`, and the codependix command
line itself — because no judged project depends on the code that decides its
verdict, a change to that code would otherwise replay every cached pass:

- When `@codependix/cli` is a package of the same workspace, two
  `{workspaceRoot}` inputs for it and for every workspace package it reaches
  through `workspace:` dependencies: `<package>/package.json` and
  `<package>/src/**/!(*.test.*|*.spec.*)` — the sources without their tests,
  so a test-only edit to the command line invalidates no gate beyond that
  package's own and its dependents'. File globs
  rather than `{ "input", "projects" }` inputs, because Nx's affected
  computation follows `{workspaceRoot}` globs and ignores the latter — so a
  branch that changes the command line's sources selects every gate, and one
  that changes only its tests does not. The tests are excluded inside the
  glob rather than by a `!`-prefixed input, which the affected computation
  ignores.
- When it is installed from a registry, an `externalDependencies` input naming
  it and the `@codependix/*` packages it depends on, so a version bump
  invalidates the cache. Nx hashes an external dependency together with
  everything it depends on, so the `@codependix/*` packages beneath those are
  covered too.
- In either case, `{workspaceRoot}/tsconfig.json` and every tsconfig it
  `extends`. The loader (`@swc-node/register`) takes its compiler options —
  `emitDecoratorMetadata` among them, which decides how NestJS sources
  compile — from `SWC_NODE_PROJECT` or `TS_NODE_PROJECT`, else from the
  `tsconfig.json` in the gate's working directory, the workspace root, and
  never from a package's own. That file reaches its bases through `extends`,
  so inference follows the chain much as TypeScript resolves it — a string
  or an array, through every level, comments and trailing commas allowed,
  `.json` appended to a path naming no file, and a bare package name taken
  to its `tsconfig.json` or its `exports` (not to a `tsconfig` field in its
  manifest, which is rare):
  - A base in the workspace, by relative path or through a package of the
    same workspace, is another `{workspaceRoot}` input. So is one that is
    missing or cannot be parsed — the edit that fixes it invalidates the
    gate — though what it would extend cannot be followed, and Nx's logger
    warns naming it.
  - A base an installed package provides, such as `@tsconfig/node24` —
    named by package or by a path into `node_modules` — is named in an
    `externalDependencies` input, so a version bump invalidates the cache,
    but only when the root `package.json` declares the package from a
    registry. Nx fails every task whose `externalDependencies` names a
    package missing from its graph, so one declared only by another package,
    or through `workspace:`, `file:`, `link:`, or `portal:`, is skipped with
    a warning instead: declare it in the root `package.json` to have it
    hashed.
  - A base outside the workspace, or a package base that resolves to no file,
    cannot be named by any input, and is skipped with a warning.

  A `SWC_NODE_PROJECT` or `TS_NODE_PROJECT` pointing elsewhere is not
  followed: add that file to the target's inputs yourself. Nor does a
  gitignored base, such as a generated framework tsconfig, invalidate
  anything: it is named, but Nx's file map leaves ignored files out.

Each workspace package is resolved on its own, through its entry rather than
its manifest, so one that cannot be resolved costs only its own inputs: Nx's
logger warns naming it, and every other package keeps its inputs. If the
command line itself cannot be resolved while the graph is built, the tool
inputs are left out and the warning names it — never failing the graph. The
tsconfig chain is resolved apart from the command line, so either failing
keeps the other's inputs. The
target declares no `configurations`, so an aggregator run with
`--configuration=check` falls through to the defaults.

**A cached gate whose `projects` or `tags` select anything other than its own
project is refused.** Its inputs cover its own project and that project's
dependencies, not the projects such a run judges, so Nx could replay a pass
after an edit to the very project that now fails. Nx fixes `cache` per target,
so a target that sets `projects` or `tags` must also set `cache: false`; the
executor throws a message saying so, whether the selection came from the
command line, the target's options, or a configuration. A gate judging only
its own project — including one whose `projects` names exactly that project —
stays cached.

### Executor options

```bash
nx run lexico-api:codependix-gate --projects=lexico-entities,lexico-api
nx run logging:codependix-gate --tags=type:package --dependencies=false
```

| Option | Meaning |
| ------ | ------- |
| `projects` | Nx project names to judge, replacing the target's own project |
| `tags` | Nx project tags, judging every project carrying **any** of them |
| `dependencies` | Build over the judged projects' Nx dependency closure. `true` by default; `false` builds over the judged projects alone |
| `configuration` | Overrides the registered configuration path. Required if the registration names none; a blank value is refused |

Nx hands plugin options to inference and to nothing else, so a gate given no
`configuration` reads this plugin's `configurationPath` registration back out of
`nx.json`, so the file a gate reads is the file its cache inputs named. A gate
with neither fails, naming the option: no path is assumed. The executor option
is not Nx's own `--configuration` flag, which selects a target configuration
such as `check` or `write`.

## Packages

| Package | Role |
| ------- | ---- |
| [`@codependix/nx`](.) | Nx plugin: a per-project boundary gate, built over the Nx dependency closure |
| [`@codependix/cli`](../codependix-cli/README.md) | Orchestrates the four graph builders, delivers their exports, and runs `--check boundaries` |
| [`@codependix/boundaries`](../codependix-boundaries/README.md) | Builds each level's graph, judges it against the declared rules, and charges each finding to a project |
| [`@codependix/configuration`](../codependix-configuration/README.md) | Reads `codependix.config.ts` and resolves per-project export destinations and boundary rules |

## Test

```bash
nx run codependix-nx:vitest
```

## Contributing

```bash
nx run codependix-nx:lint-code --configuration=check
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  codependix_cli["codependix-cli"]
  codependix_configuration["codependix-configuration"]
  codependix_nx["codependix-nx"]
  configuration["configuration"]
  codependix_nx --> codependix_cli
  codependix_nx --> codependix_configuration
  codependix_nx --> configuration
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class codependix_nx subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  ConfigurationModule
  GateModule
  InputModule
  MainModule
  OverrideResolutionModule
  PluginModule
  ConfigurationModule --> InputModule
  ConfigurationModule --> OverrideResolutionModule
  GateModule --> ConfigurationModule
  GateModule --> PluginModule
  MainModule --> GateModule
  MainModule --> PluginModule
  PluginModule --> ConfigurationModule
```
<!-- codependix:end name="codependix-nestjs-modules" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_src_codependix_nx_module_ts["src/codependix-nx.module.ts"]
  file_src_executors_gate_executor_integration_test_ts["src/executors/gate/executor.integration.test.ts"]
  file_src_executors_gate_executor_ts["src/executors/gate/executor.ts"]
  file_src_executors_gate_executor_types_ts["src/executors/gate/executor.types.ts"]
  file_src_executors_gate_executor_unit_test_ts["src/executors/gate/executor.unit.test.ts"]
  file_src_executors_gate_loader_unit_test_ts["src/executors/gate/loader.unit.test.ts"]
  file_src_index_ts["src/index.ts"]
  file_src_index_unit_test_ts["src/index.unit.test.ts"]
  file_src_modules_gate_gate_constants_ts["src/modules/gate/gate.constants.ts"]
  file_src_modules_gate_gate_module_ts["src/modules/gate/gate.module.ts"]
  file_src_modules_gate_gate_service_ts["src/modules/gate/gate.service.ts"]
  file_src_modules_gate_gate_service_unit_test_ts["src/modules/gate/gate.service.unit.test.ts"]
  file_src_modules_gate_gate_types_ts["src/modules/gate/gate.types.ts"]
  file_src_modules_plugin_plugin_context_utilities_ts["src/modules/plugin/plugin-context.utilities.ts"]
  file_src_modules_plugin_plugin_context_utilities_unit_test_ts["src/modules/plugin/plugin-context.utilities.unit.test.ts"]
  file_src_modules_plugin_plugin_inputs_utilities_ts["src/modules/plugin/plugin-inputs.utilities.ts"]
  file_src_modules_plugin_plugin_inputs_utilities_unit_test_ts["src/modules/plugin/plugin-inputs.utilities.unit.test.ts"]
  file_src_modules_plugin_plugin_tsconfig_utilities_ts["src/modules/plugin/plugin-tsconfig.utilities.ts"]
  file_src_modules_plugin_plugin_tsconfig_utilities_unit_test_ts["src/modules/plugin/plugin-tsconfig.utilities.unit.test.ts"]
  file_src_modules_plugin_plugin_constants_ts["src/modules/plugin/plugin.constants.ts"]
  file_src_modules_plugin_plugin_module_ts["src/modules/plugin/plugin.module.ts"]
  file_src_modules_plugin_plugin_service_ts["src/modules/plugin/plugin.service.ts"]
  file_src_modules_plugin_plugin_service_unit_test_ts["src/modules/plugin/plugin.service.unit.test.ts"]
  file_src_modules_plugin_plugin_types_ts["src/modules/plugin/plugin.types.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vite_config_ts["vite.config.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_codependix_nx_module_ts --> file_src_modules_gate_gate_module_ts
  file_src_codependix_nx_module_ts --> file_src_modules_plugin_plugin_module_ts
  file_src_executors_gate_executor_integration_test_ts --> file_src_executors_gate_executor_ts
  file_src_executors_gate_executor_integration_test_ts --> file_src_executors_gate_executor_types_ts
  file_src_executors_gate_executor_ts --> file_src_executors_gate_executor_types_ts
  file_src_executors_gate_executor_ts --> file_src_modules_plugin_plugin_context_utilities_ts
  file_src_executors_gate_executor_types_ts --> file_src_modules_gate_gate_types_ts
  file_src_executors_gate_executor_unit_test_ts --> file_src_executors_gate_executor_ts
  file_src_executors_gate_executor_unit_test_ts --> file_src_modules_gate_gate_service_ts
  file_src_index_ts --> file_src_modules_plugin_plugin_context_utilities_ts
  file_src_index_ts --> file_src_modules_plugin_plugin_inputs_utilities_ts
  file_src_index_ts --> file_src_modules_plugin_plugin_tsconfig_utilities_ts
  file_src_index_ts --> file_src_modules_plugin_plugin_constants_ts
  file_src_index_unit_test_ts --> file_src_index_ts
  file_src_index_unit_test_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_index_unit_test_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_gate_gate_module_ts --> file_src_modules_gate_gate_service_ts
  file_src_modules_gate_gate_module_ts --> file_src_modules_plugin_plugin_module_ts
  file_src_modules_gate_gate_service_ts --> file_src_modules_gate_gate_constants_ts
  file_src_modules_gate_gate_service_ts --> file_src_modules_gate_gate_types_ts
  file_src_modules_gate_gate_service_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_gate_gate_service_unit_test_ts --> file_src_modules_gate_gate_service_ts
  file_src_modules_gate_gate_service_unit_test_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_plugin_plugin_context_utilities_ts --> file_src_codependix_nx_module_ts
  file_src_modules_plugin_plugin_context_utilities_ts --> file_src_modules_gate_gate_service_ts
  file_src_modules_plugin_plugin_context_utilities_ts --> file_src_modules_plugin_plugin_constants_ts
  file_src_modules_plugin_plugin_context_utilities_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_plugin_plugin_context_utilities_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_context_utilities_unit_test_ts --> file_src_modules_gate_gate_service_ts
  file_src_modules_plugin_plugin_context_utilities_unit_test_ts --> file_src_modules_plugin_plugin_context_utilities_ts
  file_src_modules_plugin_plugin_context_utilities_unit_test_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_plugin_plugin_inputs_utilities_ts --> file_src_modules_plugin_plugin_constants_ts
  file_src_modules_plugin_plugin_inputs_utilities_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_inputs_utilities_unit_test_ts --> file_src_modules_plugin_plugin_inputs_utilities_ts
  file_src_modules_plugin_plugin_inputs_utilities_unit_test_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_tsconfig_utilities_ts --> file_src_modules_plugin_plugin_inputs_utilities_ts
  file_src_modules_plugin_plugin_tsconfig_utilities_ts --> file_src_modules_plugin_plugin_constants_ts
  file_src_modules_plugin_plugin_tsconfig_utilities_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_tsconfig_utilities_unit_test_ts --> file_src_modules_plugin_plugin_tsconfig_utilities_ts
  file_src_modules_plugin_plugin_tsconfig_utilities_unit_test_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_module_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_plugin_plugin_service_ts --> file_src_modules_plugin_plugin_constants_ts
  file_src_modules_plugin_plugin_service_ts --> file_src_modules_plugin_plugin_types_ts
  file_src_modules_plugin_plugin_service_unit_test_ts --> file_src_modules_plugin_plugin_service_ts
  file_src_modules_plugin_plugin_types_ts --> file_src_modules_plugin_plugin_constants_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-3734-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-138.65_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-7-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-33-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-32-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-13-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-5-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-112-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-1-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-9-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-14-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-5-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-199-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-28-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-185-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-42-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-145-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-121-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-51-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-199-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-487-475569?style=flat-square)
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

![JSON Files](https://img.shields.io/badge/JSON_Files-6-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-227-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-52-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-15-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-148-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-126-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-48-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-202-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-5-ea580c?style=flat-square)

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
![Service Files](https://img.shields.io/badge/Service_Files-2-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-2-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-3-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-3-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-8-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-1-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-0-0284c7?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-2-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-403-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-38-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-47-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-86-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-44-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-75-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-20-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-4-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-53-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 68 |
| Files | 21 |
| Calls traced | 79 |
| Call stacks | 2 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `anonymous`** — depth ≥ 6 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/codependix/codependix-nx/src/index.ts:45]
  └─> resolveToolInputs(args: ResolveToolInputsArguments): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:65]
     ↳ The cache inputs that tie a gate to the codependix command line it runs.
    └─> resolveWorkspaceInputs(…): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:209]
       ↳ Globs over the sources and manifest of the command line and of every workspace package it reaches, sorted so the cache…
      └─> collectWorkspacePackages(cliDirectory: string): WorkspacePackages [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:103]
         ↳ Collects a workspace package and every workspace package it reaches, development dependencies included: a package this…
        └─> readDependencies(directory: string): [string, unknown][] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41]
           ↳ Every dependency a package's manifest declares, in either map.
          └─> readManifest(directory: string): Record<string, unknown> [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:173]
             ↳ Reads a package directory's manifest, or an empty one when there is none or it cannot be parsed — which leaves that…
```

**2. `gateExecutor`** — depth ≥ 6 · orphan-root

```text
🚀 gateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:21]
   ↳ Fails one project's task when a codependix boundary finding is charged to it.
  └─> GateService.run(args: RunGateArguments): Promise<boolean> [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:215]
     ↳ Runs one gate, and settles on whether it passed.
    └─> GateService.resolveConfigurationPath(args: { configuration?: string | undefined; workspaceRoot: string; }): string [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:161]
       ↳ Resolves the configuration path one gate runs with.
      └─> PluginService.resolvePluginOptions(args: ResolvePluginOptionsArguments): CodependixPluginOptions [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:156]
         ↳ Resolves the effective plugin options from an untrusted value. `configurationPath` is required and never searched for:…
        └─> ConfigurationService.requireConfigurationPath(configurationPath: string | undefined, surface: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:309]
           ↳ Returns the main configuration path, refusing one that is missing.
          └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:304]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GateService.run` | 5 | `GateService.resolveSelection`, `GateService.judgesOwnProject`, `GateService.buildCommandArguments`, `GateService.resolveConfigurationPath`, `GateService.spawnCommandLine` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:215` |
| `resolveToolInputs` | 5 | `locatePackage`, `warnUnresolved`, `isInsideWorkspace`, `resolveWorkspaceInputs`, `resolveExternalInputs` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:65` |
| `anonymous` | 5 | `resolvePluginService`, `PluginService.inferTargets`, `resolveToolInputs`, `resolveTsconfigInputs`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/index.ts:45` |

<details>
<summary>27 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PluginService.readRegisteredOptions` | 4 | `PluginService.toRecord`, `PluginService.isUnknownArray`, `PluginService.find(…)`, `PluginService.map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:134` |
| `GateService.resolveConfigurationPath` | 4 | `ConfigurationService.requireConfigurationPath`, `PluginService.resolvePluginOptions`, `PluginService.readRegisteredOptions`, `GateService.readNxConfiguration` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:161` |
| `collectWorkspacePackages` | 4 | `map(…)`, `filter(…)`, `readDependencies`, `locatePackage` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:103` |
| `followExtendsChain` | 4 | `readRegistryDependencies`, `readExtends`, `resolveExtendedBase`, `warnSkipped` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:89` |
| `resolveExtendedBase` | 4 | `resolvePathBase`, `resolvePackageBase`, `isInsideWorkspace`, `readInstalledPackageName` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:204` |
| `PluginService.selectProjectRoots` | 3 | `PluginService.filter(…)`, `PluginService.map(…)`, `PluginService.filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:65` |
| `PluginService.inferTargets` | 3 | `PluginService.resolvePluginOptions`, `PluginService.map(…)`, `PluginService.selectProjectRoots` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:99` |
| `PluginService.resolvePluginOptions` | 3 | `PluginService.toRecord`, `ConfigurationService.requireConfigurationPath`, `PluginService.readString` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:156` |
| `GateService.readNameList` | 3 | `GateService.filter(…)`, `GateService.map(…)`, `GateService.flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:70` |
| `GateService.anonymous` | 3 | `GateService.on(…)`, `GateService.on(…)`, `GateService.on(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:108` |
| `resolveExternalInputs` | 3 | `filter(…)`, `map(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:197` |
| `resolveWorkspaceInputs` | 3 | `collectWorkspacePackages`, `warnUnresolved`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:209` |
| `readRegistryDependencies` | 3 | `map(…)`, `filter(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:180` |
| `readDependencies` | 2 | `readManifest`, `toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41` |
| `resolveTsconfigInputs` | 2 | `followExtendsChain`, `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:42` |
| `gateExecutor` | 2 | `resolveGateService`, `GateService.run` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:21` |
| `PluginService.map(…)` | 1 | `PluginService.toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:142` |
| `GateService.spawnCommandLine` | 1 | `GateService.anonymous` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:104` |
| `GateService.resolveSelection` | 1 | `GateService.readNameList` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:187` |
| `resolveGateService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:16` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:23` |
| `locatePackage` | 1 | `readManifest` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:145` |
| `flatMap(…)` | 1 | `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:224` |
| `readExtends` | 1 | `filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:133` |
| `filter(…)` | 1 | `some(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:184` |
| `resolvePackageBase` | 1 | `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:247` |
| `warnSkipped` | 1 | `describeSkippedBase` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:291` |

</details>
<!-- callidescope:end -->
