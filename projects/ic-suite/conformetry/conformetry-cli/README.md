# 👔 Conformetry

[![npm](https://img.shields.io/npm/v/@conformetry/cli?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/cli)

**Scaffold from a template, then hold the result to it.**

Conformetry is a code generation toolchain whose templates keep working after
generation. The same template folder that produces a new module is the
specification that module is later checked against, so scaffolding conventions
and enforcing them are one artifact instead of two that drift apart.

```bash
npm install --save-dev @conformetry/cli
```

```bash
# Scaffold a new module from the `nestjs-service-module` template
conformetry generate --config configuration/conformetry.config.ts --template nestjs-service-module --name billing

# Check every existing instance still matches the template it came from
conformetry validate --config configuration/conformetry.config.ts
```

## Why

Scaffolding tools stop caring the moment the files are written. A month later
a module has lost its `constants.ts`, a service dropped its section comments,
and nobody notices until someone reads it. Linters can't help — the convention
isn't a rule about syntax, it's a rule about the shape of a template that only
exists in a generator's output directory.

Conformetry closes the loop. Templates are rendered twice: once to create
files, and again — with the same substitutions, by the same renderer — to
compare against the files that already exist. A file that would not be
regenerated the way it is written today is a finding.

Comparison is **structural, not textual**. A TypeScript instance is compared as
a syntax tree, markdown as an mdast tree, Python through Python's own `ast`
module. Reformatting a file, renaming a local, or adding a method does not fail
validation; deleting a required export, dropping a declared file, or losing a
section comment does.

## Install

| Package | Install when |
| ------- | ------------ |
| `@conformetry/cli` | You want the `conformetry` command |
| `@conformetry/nx` | Your workspace is an Nx monorepo |
| `@conformetry/generation` + `@conformetry/validation` | You are embedding conformetry in your own tool |

```bash
npm install --save-dev @conformetry/cli
# or
pnpm add --save-dev @conformetry/cli
```

Node.js 20 or newer. Validating Python or Jupyter instances additionally needs
`python3` on `PATH` — the Python validator compares through the interpreter's
own `ast` module rather than reimplementing a parser.

## Commands

### `conformetry generate`

Renders one template folder into a target directory.

| Flag | Purpose |
| ---- | ------- |
| `--template [name]` | Which template from the registry to render. Asked for when omitted |
| `--config <path>` | Configuration file to read. Required: the run is refused without it, and no filename is searched for |
| `--directory [path]` | Where to write the rendered files. Required: the run is refused without it |

A blank `--config` is refused by `@conformetry/configuration` with a
`ConfigurationPathRequiredError` naming the `--config` flag; commander refuses a
missing one before that.

A template's own inputs are passed as flags alongside these:

```bash
conformetry generate --config configuration/conformetry.config.ts --template react-component-folder --name search-bar
```

**Omitting `--template` at a terminal offers a picker** — an autocomplete over
every configured template, each shown with its description, filtering as you
type. A name like `nestjs-service-module` is long by design, and typing
`service` is what makes it cheap to reach; nobody has to break off and run
`conformetry templates` to look one up. Passing `--template` skips the picker
entirely, because supplying a value is itself how a caller opts out of being
asked.

With no terminal, a missing template is **refused** — listing every available
name — rather than waited on, so a CI job fails immediately instead of hanging
until it times out.

**`--generator` was removed rather than kept as an alias**, and passing it is
refused by name. Unknown flags are accepted here so a template's own inputs can
be passed as flags, which means commander would otherwise read `--generator` as
an input nothing declares and drop it silently — the "appears to work" the
rename set out to avoid.

Unknown flags are accepted deliberately. Which inputs exist is not known until
the template is chosen, so they are matched against that template's schema
rather than declared ahead of time. This is also why the template is selected
with `--template` and not `--name`: almost every template takes a `name`, and
reserving that flag would leave no way to supply it.

**Missing inputs are prompted for whenever stdin is a terminal**, and there is
no flag to turn that off — an attached terminal is the whole condition, so a
script, a hook, or a CI job is never prompted.

**Every input a template declares is required.** A template substitutes each
of its placeholders, and mustache renders a missing one as an empty string
rather than failing, so an optional input would quietly produce a hole in the
generated file. `nx g conformetry:<template>` has always taken that line; this
command now does too, so the same template asks for the same values whichever
way it is run.

With no terminal, a missing input is therefore **refused** — naming the flag to
pass — and the run exits non-zero. That refusal is the load-bearing half.
`prompts` does not fail on a non-terminal stdin: it draws its menu, never
resolves, and lets the process **exit 0 having generated nothing**, which is how
this command used to hang in CI. It now asserts a terminal before prompting at
all and reports a rejected command line instead.

### `conformetry templates`

Names every template the loaded configuration declares, with its description
and folder. `generate` and `validate` both offer that list as a picker now, so
this command is for reading it rather than for looking a name up before typing
one.

| Flag | Purpose |
| ---- | ------- |
| `--config <path>` | Configuration file to read. Required |
| `--instances [globs]` | Comma-separated paths or globs; report only the templates that explain them |
| `--json` | Write the listing as JSON |

With `--instances` it answers the other direction — which templates explain a
given path:

```bash
conformetry templates --config configuration/conformetry.config.ts --instances packages/billing/src/modules/billing
```

```text
  nestjs-service-module (nsm)
    Generate a NestJS service module
    Template: configuration/conformetry-templates/nestjs-service-module
    Instances:
      packages/billing/src/modules/billing 5/5 files 100%
  nestjs-command-module (ncm)
    Generate a NestJS command module
    Template: configuration/conformetry-templates/nestjs-command-module
    Instances:
      packages/billing/src/modules/billing 3/5 files 60%
```

**Every template that explains the path is listed**, because a path can belong
to more than one. Nothing records where an instance came from — attribution is
inferred from how much of a template's structure the path already has — so a
single verdict would hide the tie that makes an ambiguous instance ambiguous.

A bare listing omits the instances; they appear only when you narrow by path, so
the registry stays readable.

### `conformetry instances`

Lists every instance the configured globs find, and which templates explain each
one. The complement of the command above: that one asks what standard a path
answers to, this one asks what generated code exists.

```bash
conformetry instances --config configuration/conformetry.config.ts --templates nestjs-service-module
```

```text
  packages/billing/src/modules/billing
    Templates:
      nestjs-service-module 5/5 files 100%
```

| Flag | Purpose |
| ---- | ------- |
| `--config <path>` | Configuration file to read. Required |
| `--json` | Write the listing as JSON |
| `--templates [names]` | Comma-separated template names; report only the instances they explain |

Each path printed is usable as the `--instances` argument above, so the two
compose without reformatting. `--templates` is how you find every instance a
template change would affect.

Note that instances located by **project tags** rather than globs are invisible
here: tag resolution belongs to the Nx plugin, and the command-line host locates
instances by glob alone.

### `conformetry validate`

Expands the configured instance globs and compares everything it finds against
the template it was generated from.

| Flag | Purpose |
| ---- | ------- |
| `--config <path>` | Configuration file to read. Required |
| `--instances [globs]` | Comma-separated globs to validate, overriding the configuration |
| `--languages [names]` | Comma-separated languages to run — `typescript`, `markdown`, `python`, `json`, `jupyter`, `text` |
| `--templates [names]` | Comma-separated template names to narrow the run to, or `all` for every one |
| `--threshold [ratio]` | Lowest conformance score an instance may have, 0 to 1. The weakest of the three threshold levels |

Every flag but `--config` is optional; an absent filter means "everything". The command exits
non-zero when any instance scores below its threshold, which is what makes it
usable as a pre-merge gate.

**`--templates` and `--instances` are two independent filters**, and a run
is their intersection — each removes candidates from one side before templates
and instances are paired:

| `--instances` | `--templates` | What is validated |
| ------------- | ------------- | ----------------- |
| absent | `all`, or absent with no terminal | Every template against every configured instance |
| present | `all`, or absent with no terminal | The globbed instances against every applicable template |
| absent | named | Every instance belonging to those templates, against them |
| present | named | The globbed instances narrowed to those templates' instances |

Omitting `--templates` at a terminal offers the same picker `generate` does,
ticking more than one, with `all` offered alongside the names. With no terminal
it falls back to every template rather than asking — which is exactly what an
invocation predating this flag already did, so scripts and CI jobs are
unaffected. `all` is reserved: a configuration cannot declare a template of
that name.

**A template whose instances are scoped by project tags cannot be located by
this host**, and a narrowed run says so rather than reporting nothing found. A
group carrying `tags` reads its globs _inside each project the tags select_, so
`src/modules/*` has no meaning until a project root is joined to it — which
only a host with a project graph can do. Such a group is left out rather than
expanded from the working directory, where it would match whatever happened to
sit at the same relative path and measure it against a template scoped to other
projects. Run those through [`@conformetry/nx`](../conformetry-nx/README.md),
or pass `--instances` with the paths to check.

Naming a template that does not exist is **refused**, listing the real names,
rather than silently narrowing to nothing. A selection that matches no
instances is reported as _"no instances belong to …"_ rather than as a clean
report, so "nothing to check" can be told apart from "everything checks out".

## Scoring

Validation reports **how much** of its template an instance honours, not just
whether it does. Every template element the comparison weighs is one
requirement, and a missing element costs the whole subtree it stood for — so
deleting a class costs far more than dropping an import, without anyone
maintaining a table of weights.

The same three numbers — met, total, percentage — are reported at every level:

```text
Conformance scores:
  ✗ projects/common/observability/src/modules/logger (nestjs-service-module) — 149/151 requirements met (98.7%), below threshold 100.0%
  ✗ projects/common/observability/src/modules/logger/logger (nestjs-service-file) — 108/109 requirements met (99.1%), below threshold 100.0%
  Total — 257/260 requirements met (98.8%) across 2 instance(s), 2 below threshold

  1. file: logger.types.ts — 1/2 requirements met (50.0%)
     Instance: projects/common/observability/src/modules/logger/logger.types.ts
     Template: configuration/conformetry-templates/nestjs-service-module/{{nameKebabCase}}/{{nameKebabCase}}.types.ts

     1. Missing comment // 🏷️ Types
        Template: Line 1, Column 1
        Expected: `// 🏷️ Types`
        Weight  : 1 of the 2 requirements in this file
        Fix     : Add the comment // 🏷️ Types to the instance file.
```

| Level | Answers |
| ----- | ------- |
| File | How much of _this file_ drifted — a small file can lose half of itself to one finding |
| Instance | Whether this instance clears its threshold; this is the level thresholds apply to |
| Total | How the whole run did, across every instance/template pair |

The fraction is printed alongside the percentage because a percentage hides its
own scale: 99.3% reads the same whether one requirement of 151 went missing or
thirty of four thousand did, and only the first is a five-minute fix.

The total is counted in instance/template pairs rather than files. A file
governed by two templates owes both of them, so its requirements genuinely
count once per template.

A finding that stands in for more than itself says so, which is what tells the
expensive drift from the trivial — a missing class carries the weight of every
member it held.

An instance must score at or above its **threshold** to pass. The default is
`1` — a perfect match, which is what conformetry has always demanded — so
adding scoring changes nothing until a threshold is lowered deliberately.

Three levels set it, narrowest first:

| Level | Where | Applies to |
| ----- | ----- | ---------- |
| Instance group | `instances[].threshold` | Only the paths that group's globs locate |
| Generator | `threshold` on the generator | Every instance of that template |
| Run | `--threshold` | Every instance the run touches |

That is what makes introducing a template bearable. A new template can be
adopted with the directory still being migrated held to `0.75` while every
other instance of it stays strict, instead of having to bring the whole
workspace over in one change.

Findings print either way. A lowered threshold is permission to ship the drift,
not a reason to stop showing it.

Differences are grouped by file and each one carries the location on **both**
sides — where the instance is wrong and where the template says so — plus the
expected value and a concrete fix:

```text
1. file: billing.service.ts
   Instance: packages/billing/src/modules/billing/billing.service.ts
   Template: configuration/conformetry-templates/nestjs-service-module/…

   1. Missing required comment
      Instance: line 24
      Template: line 31
      Expected: `// 🌎 Public Methods`
      Fix     : Add the `// 🌎 Public Methods` section comment above the first public method.
```

The `fix` field is the point of the format: reports are meant to be actionable
by whoever — or whatever — has to make the file conform.

## Configuration

A single `conformetry.config.ts` declares every generator: the template folder
it renders, the inputs it takes, and the paths its output already occupies.

```ts
import { type ConformetryConfiguration } from "@conformetry/configuration";

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description: "Generate a NestJS service module",
    inputs: {
      name: { description: "Module name in kebab-case", type: "string" },
    },
    instances: [{ patterns: ["packages/*/src/modules/*"] }],
    name: "nestjs-service-module",
    templatePath: "templates/nestjs-service-module",
  },
];

export default conformetryConfiguration;
```

`instances` is what makes validation possible: it says where this generator's
output already lives, so validation knows what to check without being told
twice. The full field reference — instance groups, tag selectors, input
schemas, discovery, and the supported file formats — is in
[**@conformetry/configuration**](../conformetry-configuration/README.md).

## Templates

A template is an ordinary folder of ordinary files. Both file contents and file
_paths_ are rendered with [mustache](https://mustache.github.io), so a folder
named `{{nameKebabCase}}` becomes `billing` and a file named
`{{namePascalCase}}.tsx` becomes `SearchBar.tsx`:

```text
templates/nestjs-service-module/
└── {{nameKebabCase}}/
    ├── {{nameKebabCase}}.constants.ts
    ├── {{nameKebabCase}}.module.ts
    ├── {{nameKebabCase}}.service.ts
    ├── {{nameKebabCase}}.service.unit.test.ts
    └── {{nameKebabCase}}.types.ts
```

Every generator's `name` input is expanded into four case variants
automatically, so a template never has to case-convert by hand:

| Placeholder | `search bar` becomes |
| ----------- | -------------------- |
| `{{nameCamelCase}}` | `searchBar` |
| `{{nameKebabCase}}` | `search-bar` |
| `{{namePascalCase}}` | `SearchBar` |
| `{{nameSnakeCase}}` | `search_bar` |

An explicit input of the same name always wins over the derived variant. Full
mustache is available — sections, inverted sections, partials — with HTML
escaping disabled so substituted values cannot corrupt source code.

> **Supply every placeholder a template uses when generating.** An
> interpolated placeholder nobody supplied fails `generate` with
> `MissingSubstitutionError`, naming the placeholder and the template file.
> Mustache would otherwise render it as an empty string. `validate` instead
> reads the value from the instance — the text where the template first uses
> the placeholder — and reports `Could not infer {{…}}` when nothing there
> reveals it.
>
> Sections are the exception, and are how a template asks for something
> optional: `{{#owner}}Owner: {{owner}}{{/owner}}` renders nothing when `owner`
> is absent, rather than refusing.

## Validators

Which validator handles a file is decided by its extension, and only the
packages a run actually needs are loaded.

| Validator | Extensions | Compares |
| --------- | ---------- | -------- |
| `typescript` | `.ts`, `.tsx` | Syntax tree structure and required section comments |
| `markdown` | `.md` | mdast structure — headings, lists, tables — rather than prose |
| `python` | `.py` | Structure via Python's own `ast` module |
| `json` | `.json`, `.jsonc` | Key structure and values |
| `jupyter` | `.ipynb` | Notebook envelope, delegating cells to the markdown and Python validators |
| `text` | everything else | Duplicate-aware line conformance — the floor, so no extension goes unchecked |

Before any of them runs, every file the template declares is checked to
**exist**. That pass covers extensions no validator claims — `.gitignore`,
`.env.default`, `pyproject.toml` — which would otherwise be deletable without
failing anything. A missing directory is reported once rather than as twenty
missing files.

A template comment containing `TODO` is treated as a prompt rather than text to
copy, so any instance comment satisfies it.

## Nx workspaces

[`@conformetry/nx`](../conformetry-nx/README.md) is a second host over the same
runtime. It adds two things the standalone CLI cannot offer:

- **A `conformetry-validate` target inferred onto every project** that holds
  instances, so validation is cached and participates in `nx affected`.
- **Generators addressed by name** — `nx g conformetry:nestjs-service-module` —
  with Nx prompting for inputs and writing through its virtual `Tree`.

Because which generators exist is a property of _your_ configuration rather
than of the package, the plugin exposing them is emitted at install time rather
than shipped:

```json
{ "scripts": { "postinstall": "conformetry-nx-bootstrap-generators" } }
```

Instance groups may additionally select projects by Nx tag, with their globs
read inside each matching project:

```ts
instances: [{ patterns: ["src/modules/*"], tags: ["framework:nestjs"] }];
```

## Packages

Conformetry is deliberately split so that embedding it does not mean depending
on a CLI. `@conformetry/core` is the leaf — it depends on nothing else in the
graph — and every other package declares exactly which siblings it may import.

### Hosts

| Package | Role |
| ------- | ---- |
| [`@conformetry/cli`](README.md) | The `conformetry` command: expands globs, prompts for inputs, prints reports |
| [`@conformetry/nx`](../conformetry-nx/README.md) | Nx plugin: inferred validation targets, tag-scoped instances, emitted generators |

### Runtime

| Package | Role |
| ------- | ---- |
| [`@conformetry/core`](../conformetry-core/README.md) | Contracts leaf: the structured difference shape, the score, the inventory, and the language validator contract |
| [`@conformetry/configuration`](../conformetry-configuration/README.md) | Config loading, template discovery, instance matching, input resolution, placeholder rendering |
| [`@conformetry/generation`](../conformetry-generation/README.md) | The generator lifecycle, rendering each template through the configuration layer |
| [`@conformetry/validation`](../conformetry-validation/README.md) | Validation orchestration, language routing, finding deduplication |
| [`@conformetry/languages`](../conformetry-languages/README.md) | Every Language module, the facade that resolves extensions to them, the existence check for every declared file, and the difference and scoring primitives they share |
| [`@conformetry/output`](../conformetry-output/README.md) | Every render target: the validation report and the template and instance inventory |

### Languages

`@conformetry/languages` holds one module per Language, all reached through its
single `LanguagesModule` facade rather than as separate packages.

| Module | Extensions |
| ------ | ---------- |
| `typescript` | `.ts`, `.tsx` |
| `markdown` | `.md` |
| `python` | `.py` |
| `json` | `.json`, `.jsonc` |
| `jupyter` | `.ipynb` |
| `text` | the fallback for everything else |

Nothing depends on `@conformetry/cli`. Embedding conformetry means depending on
the runtime packages directly — the CLI is one host among others, and holds no
logic of its own.

## Embedding

Both runtimes are NestJS providers, so a host wires them the way it wires
anything else:

```ts
import { GenerationService } from "@conformetry/generation";

const result = await generationService.runGenerator({
  configurationDirectoryPath: "/workspace/configuration",
  definition: {
    name: "nestjs-service-module",
    templateDirectoryPath: "templates/nestjs-service-module",
  },
  inputs: { name: "billing" },
  instancePath: "packages/billing/src/modules",
});
```

Filesystem and formatter access go through adapters, which is how
`@conformetry/nx` reuses this runtime unchanged against a virtual `Tree`.
Rendering deliberately is _not_ an adapter: validation must substitute exactly
as generation does, or validation would flag the files the generator itself
produced.

## Agent skills

Agent skills for coding agents working with conformetry are published in
[`@conformetry/agents`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-agents):

| Skill | Description |
| ----- | ----------- |
| [`conformetry-generate`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-agents/skills/conformetry-generate) | Scaffold code from templates using conformetry generators |
| [`conformetry-configure`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-agents/skills/conformetry-configure) | Configure generators, templates, and validation rules in `conformetry.config.ts` |
| [`conformetry-validate`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-agents/skills/conformetry-validate) | Run structural conformance checks against templates |

## Examples

Worked examples and sandboxes are in
[`@conformetry/examples`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-examples) — twelve self-contained
examples covering template authoring, case variants, structural comparison, drift detection, generator hooks, and Nx integration. An agent arriving from a conformance report can use
[`AGENTS.md`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-examples/AGENTS.md) to find the example that explains each finding.

## Start

Run the CLI from source:

```bash
nx run conformetry-cli:start
```

Pass a subcommand and its flags after `--`:

```bash
nx run conformetry-cli:start -- validate --config configuration/conformetry.config.ts --languages typescript
```

## Test

```bash
nx run conformetry-cli:vitest
```

## Build

```bash
nx run conformetry-cli:build
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run conformetry-cli:coinagerie-check:write`.

- **breadth**: The number of other callables one function calls directly, which callidescope reports in the Breadth table of this README and gates against a limit.
- **generation**: Rendering a template with resolved inputs to create new files, which the generate command performs through GenerationService.
- **inventoried**: Listed in a discovery result with its matched path and template pairings, as the InventoriedInstance type records.
- **inventory**: The list of templates and instances discovery found, which the instances and templates commands print for review.
- **stem**: The folder name a template instance is located by, stored as nameStem and joined onto the instance path to find its files.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-3596-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-198.40_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-7-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-38-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-6.55_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-38-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-5-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-27-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-62-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-8-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-18-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-10-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-181-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-52-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-125-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-108-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-113-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-140-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-25-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-200-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-382-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-185-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-41-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-12-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-117-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-105-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-7-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-45-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-166-dc2626?style=flat-square)
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

![Module Files](https://img.shields.io/badge/Module_Files-5-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-0-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-4-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-5-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-4-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-6-ca8a04?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-4-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-1555-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-81-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-107-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-441-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-94-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-399-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-6-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-56-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-32-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-32-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-242-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
