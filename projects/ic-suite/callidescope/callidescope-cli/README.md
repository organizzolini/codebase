# 🔭 Callidescope

[![npm](https://img.shields.io/npm/v/@callidescope/cli?logo=npm&label=npm)](https://www.npmjs.com/package/@callidescope/cli)

**Traces call stacks across a TypeScript monorepo and flags the ones that got too deep.**

Callidescope builds one call graph for the whole workspace, measures how deep a
stack can get below each entry point, and reports the paths that exceed a limit
you set — with every frame's file and line, so the next step is opening one.

It follows calls through **NestJS injected dependencies**. When a command calls
`this.someService.load()`, the hop into `SomeService.load` is the whole point:
that edge is invisible to anything reading one file at a time, and it is where
most of this kind of codebase's control flow actually lives.

```bash
npm install --save-dev @callidescope/cli
```

```bash
callidescope --config configuration/callidescope.config.ts
```

```text
Stack #1 | 🚨 [DEPTH ≥ 10 > 6] (decorated-method)
🚀 CodometerCommand.run(_passedParameters: string[], options: CodometerCommandOptions): Promise<void> [.../codometer.command.ts:220]
   ↳ Measure the repository and write every configured output.
  └─> CodometerService.measure(args: MeasureArguments): CodeStatisticsResult [.../codometer.service.ts:115]
     ↳ Measure aggregated repository statistics for the provided directory.
    └─> LanguagesService.analyze(args: AnalyzeLanguagesArguments): LanguageResults [.../languages.service.ts:54]
       ↳ Analyze every language present in the discovered files.
      └─> JsonService.countArrayNode(node: unknown[], stats: JsonResult, depth: number): void (cycle) [.../json.service.ts:89]
         ↳ Count array nodes and their child values.
```

## Why

A deep call stack is not automatically wrong, but it is always worth looking at.
Ten frames between a command and the work it does usually means a layer that
exists only to forward arguments, and the tools that would tell you are the ones
that read a file at a time — so they see the forwarding and never the depth.

Two questions this answers that reading code does not:

- **How deep does this actually get?** Following an injected dependency by hand
  means opening the module, finding the provider, and opening that — for every
  hop. The tool does it with the type checker, which is what makes it exact.
- **How much does this one callable reach?** Breadth counts the distinct
  callables a function calls directly, which no file-at-a-time reader can
  resolve through an injected dependency or a structurally satisfied
  interface.

## Usage

Tracing the workspace is the **default command**, so the flags below sit
directly on `callidescope`:

```bash
npx callidescope --config configuration/callidescope.config.ts --check depth
```

`callidescope callidescope --config configuration/callidescope.config.ts --check depth` is the same run written out, which is
what a task runner that always names a command spells. `depth`, `breadth`, and
`limits` are matched by name before anything falls through to the default, so
they are unaffected — and a word that names none of them is refused rather than
quietly traced.

| Flag | Meaning |
| ---- | ------- |
| `--config` | Required. Path to the workspace `callidescope.config.ts`. Nothing is searched for, and a run without it is refused naming the flag |
| `-d, --directories` | Comma-separated project directories to trace, each holding its own `tsconfig.json`. The projects their imports reach are traced too. Every such directory under the working directory when omitted |
| `--entry-point-addresses` | Comma-separated `path#name` roots, overriding `entryPoints.addresses` |
| `--entry-point-decorators` | Comma-separated decorator names, overriding `entryPoints.decorators` |
| `--exclude` | Comma-separated globs, overriding an authored `exclude`. The tool's own default globs are kept, exactly as they are under a configured `exclude` |
| `--exclude-callees` | Comma-separated callee patterns, overriding `excludeCallees` |
| `-f, --format` | `markdown`, `mermaid`, or `json`, for what it prints. Markdown by default. Anything else is refused rather than rewritten |
| `--include-exported-functions` | `true` or `false`, overriding `entryPoints.includeExportedFunctions`. The bare flag means `true` |
| `--include-orphans` | `true` or `false`, overriding `entryPoints.includeOrphans`. The bare flag means `true` |
| `--include-tests` | `true` or `false`, overriding `entryPoints.includeTests`. The bare flag means `true` |
| `--json` | Where the machine-readable report goes. Overrides the path of a declared `write.json`, and nothing else about it. Needs `--write` or `--check reports` |
| `-m, --markdown` | Where the markdown block goes. Overrides the path of a declared `write.markdown`, and nothing else about it. Needs `--write` or `--check reports` |
| `--maximum-breadth` | A number, overriding `limits.maximumBreadth` wherever a project declared one. Refused against a configuration declaring none, because breadth has no default to override |
| `--maximum-depth` | A number, overriding `limits.maximumDepth` wherever a project declared one |
| `--mermaid` | Where the diagram goes. Overrides the path of a declared `write.mermaid`, and nothing else about it. Needs `--write` or `--check reports` |
| `--check` | Fail on a comma-separated set drawn from `breadth`, `depth`, and `reports` |
| `--write` | Write every configured destination |

Every flag but `--check`, `--write`, `--format`, and `--config` (which is
required) is an
**override**: it may change a value the configuration already declares and may
not supply one it does not, so no flag can make an under-configured run legal.
`excludeFrom` is the one configured field with no flag — it names the ignore
files a run _reads_, which is what the run is rather than a value it judges by.
A list flag written empty reads as absent, so a configured list cannot be
cleared from the command line.

### Three findings, named separately

A stack that runs deeper than the configured limit, a callable that calls more
others directly than its project allows, and a report that no longer matches the
code are separate findings, and `--check` names them separately. `depth` is
callidescope's own word for the magnitude it measures — `limit` belongs to
codometer, and blurring the two makes the messages unreadable.

| `--check` value | What fails the run |
| --------------- | ------------------ |
| `breadth` | A callable calling more callables directly than `limits.maximumBreadth` |
| `depth` | A call stack deeper than `limits.maximumDepth` |
| `reports` | A configured destination no longer holding what a fresh run would write |

`--check` refuses a value it does not recognize, and refuses a flag carrying no
value at all. A set with nothing in it looks exactly like the flag having been
left off, so it is a mistake rather than a shorthand: read as "gate nothing" it
would be a gate that cannot fail. Every traced project's own configuration is
complete, so `limits.maximumBreadth` is always there to judge `--check
breadth` against — there is no project left to leave it undeclared, and so
nothing left for `--check breadth` to be refused over.

`depth` and `reports` are separate because they belong on opposite sides of a
pull request. Depth is the gate — a stack got longer in this change, and this
change is what fixes it. In this workspace neither flag is invoked directly
for that: the callidescope Nx plugin infers a `gate` target onto every project
it does not exclude, judging depth always and breadth wherever a project
declares `limits.maximumBreadth` — the same rules `--check depth` and
`--check breadth` apply, reached through the plugin's own executor rather than
a subprocess — scoped to just the projects a change touched:

```bash
nx affected --target=gate
```

Staleness is not, because a report goes stale whenever the call graph moves
anywhere, which is nearly every change. The report is published on the default
branch instead, where nothing else is competing to rewrite the same block:

```bash
nx run configuration:callidescope:write
```

Nothing writes unless it is asked to. A run given neither `--write` nor
`--check reports` reads no destination and rewrites none, so a gate on a pull
request leaves every committed report exactly as it found it.
`--write --check reports` is refused outright: a report cannot be stale in the
run that just wrote it.

Those two configurations are the whole target — there is no third one for the
release, because nothing forwards a configuration to it. `lint-code` does
not depend on `callidescope`: Nx forwards an explicit configuration down
`dependsOn`, so if it did, `lint-code --configuration=write` would publish
the report from a branch. `configuration:codometer` sits outside that list for the
same reason. The depth gate is therefore named directly, alongside
`lint-code` and inside the same `nx affected` invocation, in both places
that gate: the
[🧑‍🔧 Lint Codebase](../../../../.github/workflows/lint-code.yml) workflow, so it
runs on every pull request, and
[`configuration/lint-staged.config.ts`](../../../configuration/lint-staged.config.ts),
so it runs on every commit. Depth reads source and needs no build, which is
what keeps it in the commit path where codometer's limits — read from compiled
output — cannot go.

### Two failures no flag turns off

`--check` chooses which findings about the code fail the run. Two failures are
not findings about the code at all, and neither waits to be asked:

| Failure | What it means |
| ------- | ------------- |
| `🔭 Rejected a project it could not read` | A project's `tsconfig.json` could not be parsed, or a named directory holds none |
| `🔭 Traced nothing` | The run collected no callables at all |

Both exist because the alternative is a green gate over a workspace nobody
looked at. A run reports what it found, so a run that found nothing reports
nothing — which reads exactly like a clean workspace.

A `tsconfig.json` that will not parse **ends the run where it happens**, before
anything is printed and before any destination is touched. It is tempting to
step over the project and trace the rest, and that is wrong here: destinations
are written before findings are weighed, so a partial graph would publish
depths measured through a workspace that was missing a project, and only then
fail. On the default branch that means committing wrong numbers into every
project README, which exiting non-zero afterwards does not take back. Ending
the trace leaves the checkout exactly as the run found it.

A directory named on `--directories` that holds no `tsconfig.json` at all ends
the run the same way, and for the same reason. Naming a directory is the caller
saying it should be traced, so quietly tracing one fewer project than was asked
for reports depths for a workspace nobody described — and a typo in the list
passes every gate for having looked at less. The whole-workspace walk cannot
reach this, since it only ever yields directories a `tsconfig.json` was found
in.

A project that should not be read at all is a different question, and
exclusions answer it. They are applied to the `tsconfig.json` itself, before it
is opened — excluding a project's _files_ is too late, because opening its
configuration is the step that fails. This repository's own
[`.callidescopeignore`](../../../configuration/.callidescopeignore) names one such
project: a fixture in `codependix-examples` written not to parse.

### Where the report goes

Printing and writing are separate. `--format` decides what reaches the terminal;
the destinations under `output` in the config decide what reaches a file, and
both can be on at once.

Markdown is the console default because it is the one rendering that reads in a
terminal, pastes into an issue, and is already what the files hold. `--format
json` is for a machine reading standard output, and `--format mermaid` prints
diagram source to paste somewhere that draws it.

Three destinations, each independent:

| `write` key | What it writes |
| ----------- | -------------- |
| `json` | The whole run as JSON, at one path |
| `markdown` | The whole run, spliced between anchors in one file |
| `mermaid` | The same report with its stacks drawn instead of printed |

A project's own section is not among them. Each project declares its own
`write.markdown` in its own `callidescope.config.ts`, so where a section lands
is that project's to say — see
[Project Configuration](../callidescope-configuration/README.md#project-configuration).

### The diagram

`mermaid` is its own destination rather than a mode on `markdown`, so a
repository can publish both. They answer different questions: the tree says
what each frame takes, returns, and documents; the diagram says what shape they
make together.

Both anchored destinations render the same report, so a diagram draws exactly
what the markdown one prints: the run's call stacks over the depth limit. The
committed example of one is
[`projects/ic-suite/callidescope/callidescope-examples/output/diagram.md`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-examples/output/diagram.md),
where five stacks over that package's limit are drawn as 38 callables and 34
arrows. This repository publishes no diagram at all — its deepest stack sits
exactly at the limit, so there is nothing over it to draw, and a `--format
mermaid` run here prints `None.` under that heading.

All the stacks are drawn as **one** flowchart, not one apiece. A single stack is
a straight line, and a straight line is a list with extra steps. Drawn together
the shared tails converge — every command reaching the same repository, every
resolver ending in the same service — and that convergence is the thing a
picture shows and an indented tree cannot.

Entry points are drawn as stadiums and everything below them as boxes. Shape
rather than color, because the diagram is read in whichever theme the reader
has and only one of those is the one it was authored in. Labels carry the
callable's name alone: a diagram trying to also carry signatures is unreadable
at any size, and the tree already has room for them.

A diagram stops at 300 callables — GitHub refuses a mermaid block past 50,000
characters. Whole stacks are dropped rather than trimmed, so the diagram never
contains an edge into something it did not draw, and it says how many it left
out. The cap is generous against one project's worth of stacks and tight against
a workspace's: this repository's widest project, `caelundas`, has 96 call stacks
spanning 263 distinct callables, 27 of them called from more than one place, so
a set that size fits whole; the 554 stacks its 53 projects hold between them
would reach the 300 and leave 451 out. Neither set is drawn here — nothing in
this workspace is over the depth limit — but they are the scale the cap is set
against.

The `## 🔭 Callidescope` section at the bottom of every package in this
repository is that package's own declaration rather than anything the run fans
out. Each project's file names the document its section lands in, and the run
publishes what it finds declared:

```ts
write: { markdown: { heading: "## 🔭 Callidescope", path: "README.md" } }
```

Each section carries that project's stacks and findings rather than the
workspace's, the first three stacks openly and the rest behind a disclosure —
`previewCount` on the destination is what decides how many, because it is a
fact about the document rather than about the run.

Under `--check reports` a stale section fails and names every file that drifted,
rather than stopping at the first. This repository does not run that on a pull
request: `nx run configuration:callidescope:write` writes the sections on the
default branch, and the release commits them.

Narrowing with `--directories` is the difference between a whole-workspace
analysis and a check that finishes in seconds, because each project needs its
own TypeScript program. What such a run measures — and what it deliberately
leaves out — is [its own section below](#what-a-scoped-run-measures).

## Depth and breadth for named callables

`callidescope` reports the whole workspace; `depth` and `breadth` answer a
narrower question about callables you name, addressed the way a Python
traceback or an ESLint rule id points at a symbol — the file path and the
qualified name callidescope already prints in every stack, joined by `#`:

```bash
callidescope depth --config configuration/callidescope.config.ts --addresses src/foo.service.ts#FooService.bar
callidescope breadth --config configuration/callidescope.config.ts --addresses src/foo.service.ts#FooService.bar
```

`--addresses` is comma-separated, so one run can report on several callables —
which is what a rename spanning a handful of them actually needs:

```bash
callidescope depth --config configuration/callidescope.config.ts --addresses src/foo.service.ts#FooService.bar,src/bar.service.ts#BarService.baz
```

**Every address has to resolve, or the run prints nothing.** A report covering
the addresses that were understood, under an exit code claiming success, is
worse than no report; a run naming an address it cannot match reports each
failure and exits non-zero.

A file holding more than one declaration under the same qualified name — two
overloads, two callbacks bound to the same property — is disambiguated with a
trailing `:<line>`, and both commands print every candidate's line when they
cannot tell which one was meant.

**`--addresses` is prompted for when omitted.** At a terminal, both commands
offer every callable the trace found as an autocompleting multiselect, so the
flag is something to skip rather than something to look up. With no terminal
there is nobody to ask, so the run is refused by name and exits non-zero
rather than drawing a menu nothing can answer.

Both accept every graph-shaping flag `callidescope` itself does, since
resolving an address still means tracing the workspace first:
`--directories`, `--entry-point-addresses`, `--entry-point-decorators`,
`--exclude`, `--exclude-callees`, `--include-exported-functions`,
`--include-orphans`, and `--include-tests`, plus the required `--config` and
`--format`.
Each means exactly what it means above.

Neither takes `--check`, `--write`, `--json`, `--markdown`, `--mermaid`,
`--maximum-breadth`, or `--maximum-depth`: a lookup gates nothing and writes
nothing, so a limit or a destination has no value here to override. It only
ever prints, to whichever format `--format` names.

Under `--format json` both print **an array**, whatever the address count, so
one run is one document `JSON.parse` accepts without first counting how many
addresses were asked about.

**`depth`** prints every path above the callable and every path below it —
every caller chain up to a root, every callee chain down to a leaf — rather
than folding each direction into the single deepest one `callidescope`'s own
report keeps. A callable reached from a dozen places, or reaching a dozen
leaves, is exactly the shape this is asked to show in full, capped at 200
paths per direction so a widely-called utility cannot make the walk run away;
a capped run says so.

**`breadth`** prints the callable's direct callees and direct callers side by
side — what it calls, and what calls it — the two questions a refactor or a
rename needs answered together before either one is safe.

## What a scoped run measures

`--directories` narrows a run to the project directories it names. The trace
still follows calls out of them: a scoped run builds a TypeScript program for
each named project **and for every project those projects' imports transitively
reach** — the named projects' **dependency closure**.

That closure is what makes a scoped depth a measurement rather than an
approximation. A project's own `tsconfig.json` never lists the packages it
imports, so without it a call leaving the named directory landed in code no
traced project owned — and a call into unowned code is treated as external, a
leaf, exactly like a call into an installed package. The stack ended at the
package boundary and reported a plain number, with nothing in the report saying
it had stopped early.

Scoped to `projects/ic-suite/codometer/codometer-changes`, this repository traces 3 projects, 33
files, and 102 callables, in about 1.7 seconds. The same command before the
closure traced 1 project, 8 files, and 31 callables.

A closure is derived from what the compiler really read — every file in a
project's program — rather than from the dependency list a `package.json`
declares. A manifest says what a package may import; the program says what it
did. So a type-only import widens a closure, and a declared dependency nothing
imports does not.

### What a closure does not reach

**Dependents, deliberately.** The walk runs downward only: a project that
imports a scoped one is not built, and its stacks do not appear. A call stack
runs downward too, so a dependent contributes no frames below anything the run
measures — and leaving it out is what stops an edit in a dependent from moving
the scoped project's numbers.

**A project root holding no `package.json`.** A manifest is what makes a
directory something another project can depend _on_. A root holding only a
`tsconfig.json` is where a repository keeps shared settings, and shared settings
are read by every project rather than depended on by any. Without this rule one
such directory drags the whole workspace in: each package's `tsconfig.json`
includes its own tooling configuration files, each of those imports out of the
shared directory, and that directory's program then reaches every toolchain the
repository configures.

**The workspace root.** A project whose root contains every other project cannot
be a meaningful dependency of any of them, whatever else it holds.

Both rules refuse a _destination_ only. Naming a directory is the caller saying
it should be traced, and a run naming no directory names every project — so
either kind is still traced in full when asked for directly, and a
whole-workspace run's findings are exactly what they were. What the rules cost
is that a call into a refused directory resolves to no frame, the way every call
out of a package did before closures existed.

### Numbers that do not move with the scope

A file is owned by the **deepest project root containing it**, whichever program
pulled it in — not by whichever program happened to read it first. That is what
makes two runs agree: the same callable measures the same depth whether the run
was scoped to its own project, scoped to something that depends on it, or scoped
to nothing at all — provided each of those runs builds the project declaring it,
which a refused destination's is not.

Both findings survive a downward-only scope, which is worth saying because it is
not obvious: depth and breadth both fold over a callable's **callees**, which
run downward — precisely what a closure holds in full. Neither needs the
dependents a scoped run leaves out.

**Publishing does not widen with measurement.** A run publishes a section only
for the projects it was scoped to, so a scoped run never rewrites a section in a
dependency it merely measured — and a whole-workspace run still publishes every
project's, because a run naming no directory has every project as a scoped one.

[`dependency-closure`](../callidescope-examples/examples/dependency-closure/README.md)
works all of this through on a real call that leaves its package, with the
projects it reaches and why listed one by one.

## Scoping by Nx project name

`--directories` takes paths, because callidescope has no idea what workspace
tool you use — a directory holding a `tsconfig.json` is the whole contract, and
it holds in a monorepo, a single package, or neither.

An Nx workspace can hand the selecting to Nx instead, through
[`@callidescope/nx`](../callidescope-nx/README.md) — a plugin that infers a
trace target onto every project:

```bash
nx run-many -t trace --projects=tag:type:package
nx affected -t trace
nx run callidescope-graph:depth --addresses="src/foo.service.ts#FooService.bar"
```

It infers a `trace`, a `depth`, and a `breadth` target onto every project, so
`callidescope`, `depth`, and `breadth` all become tasks — with Nx's own project
selection, caching, and affected-detection for free, none of which a flag here
could offer. It also resolves each project's **Nx dependencies** into
directories of their own, which makes them projects the run is _scoped_ to
rather than ones it merely measures — so their sections are published too, and
the selection comes from the declared graph rather than from whatever the
compiler happened to read. A stack is not truncated at a package boundary either
way: the dependency closure above is what stops that, and it needs no Nx graph.

It is a separate package rather than a flag here on purpose: this CLI depends
on nothing Nx-shaped, and a flag that only worked when an optional package
happened to be installed would advertise in `--help` something that silently
did nothing without it.

## What it reports

**Deep call stacks.** The single deepest path below each entry point, when it
exceeds `maximumDepth`. Only one path per entry point is ever built — the deepest —
so a wide graph costs no more than a narrow one.

**Wide callables.** A callable calling more distinct callables directly than
`maximumBreadth` allows, reported per project the same way depth is.

A depth printed as `≥ 10` is a floor rather than a measurement: something on
that path could not be followed — a callback invoked through a parameter, a
computed member name — and the run says so rather than quietly under-reporting.
Narrowing a run is never what causes one: a scoped run builds its dependencies'
programs too, so a stack leaving the named package keeps going and reports a
plain number like any other.

## What a frame carries

Every frame is annotated from the type checker, because a stack of bare names
is a list of places to go look rather than something you can read:

- **The signature** — parameter names and types, and the return type. On this
  repository that is all 1,338 reported frames.
- **The documentation summary** — the JSDoc prose, collapsed to one line. 801
  of those 1,338 have one.
- **Tags**, including `@deprecated`, which marks the frame inline.

Both come from the checker rather than the comment trivia, which is what makes
them right on the shapes this repository writes. An overload's documentation
lives on the signature rather than the implementation the graph points at; an
arrow-typed property's lives on the property rather than the arrow; a
destructured parameter has no name at all in the syntax. The checker resolves
all three.

A signature longer than 80 characters collapses to `(…): ReturnType`. That is
almost always a NestJS constructor taking a dozen injected services — which
services those are is noise at the point where you are reading a stack, and a
440-character line destroys the indentation that makes the stack legible.

A summary longer than 120 characters prints only its opening sentence. Comments
here state what a callable does and then explain why, and the first half is the
half that orients someone reading a stack. It prints unmarked, because a whole
sentence is a complete thought rather than an elision and the frame's
`file:line` already points at the rest. Only a single sentence with no boundary
to find is cut on a word and marked `…`, which across this repository is 51 of
those 801 summaries.

**Shortening applies to the printed tree only.** The JSON report carries every
comment in full, because a machine reading it has no line width to respect —
the longest in the workspace runs 1,507 characters.

Annotations are read only for the frames a report actually prints, not for all
4,727 callables. Rendering a type is the one genuinely costly thing the checker
does, and reports touch a few hundred frames.

## How it follows a call

The TypeScript type checker resolves each call site. A call on a
constructor-injected property needs no special handling: the parameter property
carries the service's type, and the checker follows it.

| Written as | Resolved by |
| ---------- | ----------- |
| `helper()` | The symbol at the callee, unwrapped through import aliases |
| `this.service.load()` | The symbol at the member name — the injected-dependency case |
| `provider.ingest()` | Every class structurally satisfying the interface, capped by the implementation-candidate cap |
| `super.run()` | The base declaration the checker resolves to |
| `new Thing()` | The constructor, when it has a body |
| `list.map(callback)` | The callback, as its own frame — `map` itself is external |
| `target[key]()` | Nothing. Recorded as unfollowable rather than guessed |

Calls into **installed** dependencies are leaves. Whether `Array.prototype.map`
is deeply implemented says nothing about whether _your_ layering is too deep,
and counting it would make every number move on an unrelated upgrade. A call
into another project of the same workspace is not one of these: it resolves to a
real frame, because a scoped run builds that project's program too — see
[what a scoped run measures](#what-a-scoped-run-measures).

Structural matching is not optional: classes here routinely satisfy an interface
without writing `implements`, and its members are usually arrow-typed properties
rather than method signatures. A nominal-only index finds none of them.

## Recursion

Cycles are collapsed before depth is measured, so a mutually recursive cluster
of three contributes three frames once — an honest floor on a stack that has no
ceiling. The alternative, detecting a repeat visit mid-walk, makes the answer
depend on which path arrived first, so the same function reports different
depths from different entry points and between runs. A linter whose numbers move
on their own is not usable as a gate.

## Entry points

Depth is only meaningful relative to a root, and most code here is called by a
framework rather than by the repository. Roots are therefore configurable:
decorated methods, lifecycle hooks, `main.ts` bootstraps, and every `src/index.ts`
export.

Anything left with no caller is promoted to an **orphan root**. That is the
safety net: without it, a missing rule silently removes a whole subtree from
every measurement instead of showing up.

## Agent skills

Agent skills for coding agents working with callidescope are published in
[`@callidescope/agents`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-agents):

| Skill | Description |
| ----- | ----------- |
| [`callidescope-trace`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-trace) | Trace the workspace or inspect depth and breadth for named callables |
| [`callidescope-configure`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-configure) | Configure callidescope flags, rules, and `callidescope.config.ts` |
| [`callidescope-triage`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-triage) | Triage and resolve depth limit breaches and gate failures |

## Examples

Every rule, finding, and output on this page has a worked example in
[`@callidescope/examples`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-examples) — a small
codebase written to be traced, with its rendered reports committed. Its
[`AGENTS.md`](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-examples/AGENTS.md) is a "callidescope reported X
→ open this example" table, so a failing `gate` has somewhere to go.

## Non-goals

**Control flow graphs.** Intra-procedural branching is already capped by this
repository's ESLint rules (`complexity`, `max-depth`, `max-statements`), and a
CFG is not what call-stack depth needs. Building one would duplicate ESLint at
much higher cost.

**Clone detection.** Repeated call-stack shapes are not a useful signal in a
dependency-injected codebase — the shared suffix _is_ the service layer, so
every resolver ends the same way. `jscpd` already covers real duplication.

## Packages

| Package | Role |
| ------- | ---- |
| [`@callidescope/cli`](.) | Orchestrates a run: traces the workspace, plans what to check, and reports |
| [`@callidescope/configuration`](../callidescope-configuration/README.md) | Reads `callidescope.config.ts` and resolves the limits |
| [`@callidescope/graph`](../callidescope-graph/README.md) | Builds the call graph from traced source and measures depth and breadth |
| [`@callidescope/nx`](../callidescope-nx/README.md) | Nx plugin: per-project `trace`/`depth`/`breadth` targets, scoped through the Nx dependency graph |
| [`@callidescope/output`](../callidescope-output/README.md) | Renders findings into markdown, mermaid, and JSON |
| [`@callidescope/examples`](../callidescope-examples/README.md) | A traced fixture codebase carrying one worked example of everything above |

## Start

```bash
nx run callidescope-cli:start
```

## Test

```bash
nx run callidescope-cli:vitest
```

## Contributing

```bash
nx run callidescope-cli:lint-code --configuration=check
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run callidescope-cli:coinagerie-check:write`.

- **breadth**: The number of distinct callables a single callable calls directly, which the maximumBreadth limit gates and the breadth command prints.
- **callable**: A function, method, or constructor that the call graph treats as one node, named by file and qualified name in addresses.
- **canonical**: Substring of getCanonicalFileName, a TypeScript host function in the test program fixtures, not a term of this project.
- **permit**: Fragment of ProjectConfigurationFieldNotPermitted, the error for a field a project may not set in its own config.
- **quiet**: Describes a project that has no files of its own to read, as in the limits test naming the quiet project's file.
- **refusal**: A command's deliberate rejection of input or a destination, printed with a headline and advice rather than a stack trace.
- **trace**: The act of following calls from one callable through its callees to report the call stacks the tool measures.

<!-- coinagerie:end -->
