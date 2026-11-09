# 🔭🧬 Callidescope Nx

[![npm](https://img.shields.io/npm/v/@callidescope/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@callidescope/nx)

**An Nx plugin that traces call stacks per project, following the Nx dependency graph.**

Canonical documentation for call-stack tracing, configuration, depth and breadth analysis, and report formats is in the
[`@callidescope/cli` README](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/callidescope/callidescope-cli#readme).
`@callidescope/cli` is Nx-free on purpose: it takes `--directories`, each one a path holding its own `tsconfig.json`, so it
works in any TypeScript workspace whether or not Nx is anywhere near it. This
package is the one place in the toolchain that knows Nx exists, and the only
one that depends on `@nx/devkit`.

It adds two things the core CLI cannot know about:

- **A target on every project**, so the workspace's task runner does the
  selecting — `nx affected`, `--projects=tag:…`, caching, and all.
- **Dependency-aware scope**, so a run over one project is scoped to everything
  that project depends on rather than to the project alone.

## Install

```bash
npm install --save-dev @callidescope/nx
```

Register it in `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "@callidescope/nx",
      "options": {
        "configurationPath": "configuration/callidescope.config.ts"
      }
    }
  ]
}
```

| Option | Meaning |
| ------ | ------- |
| `configurationPath` | Required. Where the workspace callidescope configuration lives. Nothing is searched for: a registration that omits it is refused, naming this option. The refusal is decided by `@callidescope/configuration`, which every surface shares |
| `traceTargetName` | Name of the inferred trace target. `callidescope-trace` when omitted |
| `depthTargetName` | Name of the inferred depth target. `callidescope-depth` when omitted |
| `breadthTargetName` | Name of the inferred breadth target. `callidescope-breadth` when omitted |
| `gateTargetName` | Name of the inferred gate target. `callidescope-restrict` when omitted |

All inferred targets default to `callidescope-*` names to avoid generic task
labels in Nx lists. Rename any of them from the registration if a workspace
already uses one.

## Usage

Four targets are inferred onto every project holding a `tsconfig.json`, so
selection is Nx's job rather than a flag of this package's own:

```bash
nx run callidescope-nx:callidescope-trace                      # one project, with its dependencies
nx run-many -t callidescope-trace                              # the workspace
nx run-many -t callidescope-trace --projects=tag:type:package  # a category
nx affected -t callidescope-trace                              # only what changed
```

```bash
nx run callidescope-nx:callidescope-depth --addresses="projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts#ProjectsService.resolveDependencyClosure"
nx run callidescope-nx:callidescope-breadth --addresses="src/foo.service.ts#FooService.bar"

# Several at once, which is what a rename spanning a handful of them needs
nx run callidescope-nx:callidescope-depth --addresses="src/a.service.ts#A.b,src/c.service.ts#C.d"
```

| Target | Answers |
| ------ | ------- |
| `callidescope-restrict` | Whether anything in the project broke the limits it is held to |
| `callidescope-trace` | Every call stack in the project, and which ones broke a limit |
| `callidescope-depth` | Every stack above and below each callable — callers up to a root, callees down to a leaf |
| `callidescope-breadth` | Each callable's direct callers and callees, side by side |

`depth` and `breadth` take the same `<file>#<qualified-name>` addresses the
`callidescope` command does — the form every printed stack already uses — and
the same comma-separated `--addresses` flag it takes them through. Through the
plugin they resolve against the project and its dependencies rather than the
whole workspace, which is both faster and the set the addresses belong to.

**Every address must resolve, or the task prints nothing.** A report covering
only the addresses that were understood, under a task Nx recorded as
successful, is worse than a failed one; each unmatched address is named and
the task fails. Under `--format=json` the report is always an array, whatever
the address count, matching what the command line prints.

Unlike the command line, a missing `--addresses` is **refused rather than
prompted for**: a task runner has nobody to ask.

### The gate

`gate` is the one of the four a pipeline is meant to read an exit code from,
and the only one that prints nothing but its findings — the stacks and callables that
decided the verdict, rather than every stack in the project. `nx affected -t gate`
therefore gates a branch by the projects it changed, and the task that fails is
named after the project that regressed, which one workspace-wide task never
could.

**A dependency's breach is that dependency's gate's business.** The trace
reaches into the projects a gate's project depends on, because a stack that
stops at a package boundary measures the wrong thing — but the verdict covers
only the projects the task was scoped to. This is the line the publishing side
already draws, one step further along: measurement reaches into dependencies,
publishing does not, and judging does not either. Nothing escapes a verdict,
because `nx affected` selects a changed dependency too and its own gate names
it. `trace` narrows its verdict the same way, so the two targets on one project
can never disagree about whose regression it was; its report still shows the
whole closure, since only the verdict narrows.

**Depth is gated always, breadth wherever a limit exists.** Not two modes to be
selected between: `maximumDepth` has a default, so every project has a number
and is judged by it, while `maximumBreadth` has none at any level — so a project
that declared no breadth limit is judged against `Infinity` and can produce no
breadth finding at all.

**A gate that opened none of the judged project's own files fails.** A project
reporting zero files of its own is not a clean project — it is a project
nothing looked at, and a green task there would say the opposite with nothing
in the output to correct it. The `callidescope` command fails the same case for
the same reason.

**`trace` prints that same block and passes on it** — the one rule the two
targets act on differently, and the only place their verdicts part. A project
the configuration excludes reads nothing of its own by definition and is given
no `gate` for exactly that reason, so failing its `trace` as well would leave
the one target it has permanently red for being configured as it was asked to
be, and a red task that is always red is one a reader learns to ignore. It
still prints, because whether a project's own code was read is a fact about the
run either way and a reader has to be able to see it. Everything else — a stack
over a depth limit, a callable over a breadth limit, a run that read nothing at
all — fails both.

**Asked per judged project, not of the whole run**, because narrowing the
verdict made those two different questions. A project with dependencies has a
non-empty run whatever became of its own sources, so an `exclude` that
over-matches — which a project's own `callidescope.config.*` may write — leaves
it owning no report content, owning no finding, and passing green over code
nothing read. Demonstrated: `projects/ic-suite/codometer/codometer-output` given
`{"exclude": ["**"]}` of its own traces its dependency's 102 callables and
contributes none, which is a green gate on the run-wide question and a red one
on this. The projects that went unread are named back, since `--projects` may
judge several.

**Files rather than callables**, which is the weaker question and the right
one. A project can hold files that declare no callable at all — one whose
`tsconfig.json` names only its own configuration files and its tests is the
shape, and this repository has five — and those files were read, so a verdict
on them is a verdict on something. Asking for a callable fails all five for
holding no functions, which is a finding about nothing. The cost, stated
plainly: a project whose sources are excluded while a configuration file of its
own survives counts as read.

Two adjacent cases fail alongside it, each saying what happened rather than
failing mutely: a run that read **nothing at all**, which is what an unread
leaf project looks like, and an Nx selection that resolved to **no directory**.

Its cache key names the project's own `callidescope.config.*` alongside the
workspace configuration, so editing one project's limits re-runs that project's
gate and no other project's. A dependency's sources are covered by `^default`,
because a run measures its dependencies even though it does not judge them.

Two projects are deliberately skipped by all four targets: the **workspace-root
project**, whose targets would trace everything under one uncacheable task, and
any project with **no `tsconfig.json`**, whose targets would be permanently
empty. A project the configuration **excludes** — `exclude` or `excludeFrom` in
the workspace file — additionally gets no `gate`: its own code is never traced,
so a gate there would own no finding at all and report green for code it never
read. It keeps the three that print something, `trace` included, which is what
the unread exemption above is there to preserve: `projects/ic-suite/callidescope/callidescope-examples`
is the case, and its stacks are still a report a reader can open.

### Why the trace follows dependencies

`nx run callidescope-cli:trace` traces `callidescope-cli` **and
everything it depends on**, resolved transitively from the Nx project graph.

A call stack runs downward — a command calls into the service it was injected
with, which lives in a package it depends on — so a trace that stopped at a
project's own boundary would measure the wrong thing.

**A trace does not stop there without this plugin.**
[`@callidescope/cli`](../callidescope-cli/README.md) builds a TypeScript
program for every project the directories it was given transitively import, so
a call into a dependency resolves to a real frame whether or not Nx is
involved. Measured on this package,
`callidescope --config configuration/callidescope.config.ts --directories projects/ic-suite/callidescope/callidescope-nx` and
`nx run callidescope-nx:trace` report the same 575 callables across 185 files
in 7 projects.

What the Nx graph decides is which projects the run is **scoped to** rather
than merely reaches. This executor writes nothing anywhere — it renders one
report and prints it — so the distinction costs nothing here, and widening the
selection changes only which projects seed the closure. It is the command-line
host that acts on it: a `--write` run there publishes a `## 🔭 Callidescope`
section into a scoped project's `README.md` and leaves a reached one's to the
run that is scoped to it. The graph also names dependencies no import closure
can find — an implicit dependency, or an edge that exists only at run time.

The two sets are not the same. The Nx graph gives `callidescope-nx` six
projects; the import closure reaches seven, adding `codometer-configuration`,
which this project's `tsconfig.json` pulls in through its own
`codometer.config.ts` — a file the manifest has no reason to mention.

Dependencies, never dependents: a project's dependents call _into_ it and add
no frames below it.

Pass `--withDependencies=false` to scope the run to the selected projects
alone. The closure below them is built either way, so what changes is which
projects the run calls its own — not how far a stack runs.

### Executor options

```bash
nx run logging:trace --tags=type:package
nx run logging:depth --addresses="a.ts#A.b" --projects=callidescope-cli
```

All three executors take the same scoping options.

| Option | Meaning |
| ------ | ------- |
| `addresses` | `depth` and `breadth` only, and required: the callables to look up, comma-separated |
| `projects` | Nx project names to resolve against, replacing the target's own project |
| `tags` | Nx project tags, selecting every project carrying **any** of them |
| `withDependencies` | Widen along the Nx dependency graph. `true` by default |
| `format` | `markdown`, `mermaid`, or `json` |
| `configuration` | Required, and written onto every inferred target from the registration's `configurationPath`. A hand-written target must name it itself, or is refused naming this option |

`--projects` and `--tags` union rather than intersect, and a project reached
both ways is still traced once. `--tags` matches **any** of the tags given,
because Nx tag families are mutually exclusive on a single project — nothing is
both `type:application` and `type:package`, so requiring all of them would
select nothing.

Prefer Nx's own `--projects=tag:…` on `run-many` for ordinary selection; these
options exist for a target that wants to declare a fixed scope in its
`project.json`.

### Nothing resolves silently to less

A project name the workspace does not have, or a tag no project carries, fails
the task and names the workspace's actual vocabulary. Narrowing the run instead
would let it pass while measuring less than it was asked to — and a report of
what a run did cover cannot show you what it did not.

## As a library

The Nx-graph reading is a NestJS provider, for a host that would rather import
it than run a task:

```ts
import { resolveProjectsService } from "@callidescope/nx";

const projectsService = await resolveProjectsService();
const graph = await projectsService.readProjectGraph();
const names = projectsService.resolveDependencyClosure({
  graph,
  projectNames: ["callidescope-cli"],
});
const directories = projectsService.toDirectories({ graph, projectNames: names });
```

`readProjectGraph` is the only method that touches Nx at run time; every
resolution rule takes the graph as an argument, so it can be exercised without
a workspace to build one from.

## Packages

| Package | Role |
| ------- | ---- |
| [`@callidescope/nx`](.) | Nx plugin: per-project trace targets, resolved through the Nx graph |
| [`@callidescope/cli`](../callidescope-cli/README.md) | Orchestrates a run: traces the workspace, plans what to check, and reports |
| [`@callidescope/configuration`](../callidescope-configuration/README.md) | Reads `callidescope.config.ts` and resolves the limits |
| [`@callidescope/graph`](../callidescope-graph/README.md) | Builds the call graph from traced source and measures depth and breadth |
| [`@callidescope/output`](../callidescope-output/README.md) | Renders findings into markdown, mermaid, and JSON |

## Test

```bash
nx run callidescope-nx:vitest
```

## Contributing

```bash
nx run callidescope-nx:lint-code --configuration=check
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run callidescope-nx:coinagerie-check:write`.

- **batch**: Group of gate tasks Nx hands to one executor call, which traces the workspace once and judges each project from that trace.
- **breadth**: Width measurement of a traced project, reported by the breadth executor and gated against maximumBreadth.
- **callable**: Function, method, or class member that a trace or query names by its file and qualified name in an address.
- **explain**: Produce a reason for why an address or verdict failed to match, printed as a block the reader can follow.
- **gamma**: Placeholder project name for a third fixture dependency, as in an alpha-beta-gamma chain in tests.
- **restrict**: Target name, callidescope-restrict, given to the gate executor that restricts a run to the selected projects.
- **trace**: Executor that builds call stacks for a project and its dependencies, printing the same verdict block a gate prints.
- **unread**: Project whose own files a run reads nothing from, which makes its gate fail rather than pass silently.

<!-- coinagerie:end -->
