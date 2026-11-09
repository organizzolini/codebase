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
