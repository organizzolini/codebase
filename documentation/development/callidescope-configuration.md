# Callidescope workspace configuration

The design notes that used to sit in `configuration/callidescope.config.ts` as comments. Each section is the full account behind one short comment in that file.

## The starting point every project writes down and then overrides

The starting point every project in this repository writes down and then
overrides.

**Defaults, never ceilings, and never inheritance.** Nothing resolves a
number out of this object at run time any more: a project's own file is the
complete statement of how that project is traced and judged, and these
numbers reach it by being spread into it, where a reader can see them. A
project declaring a number _higher_ than one of these keeps its own —
nothing clamps it. That has to be true for the numbers below to mean
anything: a workspace limit is pinned by the single worst stack anywhere in
the repository, so reading it as a ceiling would hold every project to the
worst one's allowance, which is the arrangement the per-project gate exists
to replace.

A project's own `callidescope.config.ts` spreads `projectDefaults` — the
second export below — and declares `limits` explicitly beside it, both
fields named and both real numbers now that every traced project gates
breadth as well as depth: `{ maximumBreadth: 8, maximumDepth: 6 }` is the
shape every one of them takes. The spread and the explicit `limits` object
are not doing the same job: the spread carries `entryPoints`, `exclude`,
`write`, and whatever `limits` a project does not restate forward
unchanged, and `limits` is what a project overrides. Leaving a field out of
either is a refusal naming the project and the field — see
`documentation/adr/0007-complete-project-configurations.md`.

A project's file also carries no type annotation, and so no import of
`CallidescopeConfiguration`. An `import type` is still an Nx dependency
edge: it puts `@callidescope/configuration` into that project's graph, it
widens what the project's own `callidescope-restrict` target has to trace, and it
asks the manifest of a project like `logging` to declare a toolchain package
that project does not use. What it would buy is a second check of something
already checked: the four fields a project may set are validated when the
file is read and a fifth is refused by name, and every project's
`tsconfig.json` names its own file, so the object literal is compiled either
way. `projects/ic-suite/callidescope/callidescope-examples` is the annotated exception on purpose:
its two configuration files are the worked examples of this shape, and it
depends on the configuration package for real.

### The projects that used to override nothing

Every traced project holds a complete file now — see
`documentation/adr/0007-complete-project-configurations.md`. There used to be a
class of project that took the number below without a file of its own, and
consolidating the conformetry Languages removed the last of it: six leaf
analyzers — `conformetry-typescript`, `-json`, `-jupyter`, `-markdown`,
`-python`, `-text` — each held real code that rooted nothing, because every
one of them was entered from above rather than directly, so each measured
zero however much it did. They are now modules of `conformetry-languages`,
and what was a call between packages is a call inside one, so a scoped run
finally enters at a surface of its own and measures four rather than zero.
That package spreads `projectDefaults`, declares `limits.maximumDepth: 4`
beside it, and gates like any other — breadth included, since a callable's
own fan-out counts whether or not anything ever calls it.

The dependency closure a scoped run traces did fix this for
`codometer-changes`, which measured zero before it and ten after. The ten
with no caller are a different phenomenon and the closure does not reach
them: it supplies the callees a stack descends into, and what these are
missing is a caller.

### The projects traced by nothing

Eight projects are not measured at all, rather than taking the number
below — so they hold no configuration file either, being no project's file
to write. The five skill packages — `callidescope-agents`,
`codependix-agents`, `codometer-agents`, `coinagerie-agents`,
`conformetry-agents` — hold barely
a callable between them, the same landmine a real project would avoid by
declaring its own number rather than being gated at zero, except these have
no real code underneath to ever grow into. And
`codependix-examples`, `codometer-examples`, and `conformetry-examples` are
fixture corpora rather than libraries: a depth number over one reports on a
corpus's incidental shape instead of on production code, the same reason
`projects/ic-suite/callidescope/callidescope-examples` is excluded below in favor of its own
report-freshness gate.

A project cannot exclude itself this way — discovery finds a project's
`tsconfig.json` before that project's own `callidescope.config.ts` is ever
read, so removing a project from tracing has to happen at the workspace's
own file. `configuration/.callidescopeignore` is where all eight are named,
beside `projects/ic-suite/callidescope/callidescope-examples` and the other exclusions this
workspace declares.

Six application and tool projects under `projects/` declare their own measured
depth the same way — but two more things sit outside what either task covers
and still need writing down rather than left implicit.

`configuration/` measures depth 3 and breadth 2 and holds its own
`tsconfig.json`, so it appears as a traced root — but it is not an Nx
project, so no target can ever be inferred onto it, and it is gated by
nothing. It is also the one traced project that writes no configuration of
its own, this file being the file at its root: a run cannot read one file as
both its own workspace configuration and a project's, and no second file may
sit beside it under a name discovery would find. So it is judged by
`workspaceLimits` directly — the one export below that carries a real
`maximumBreadth` of its own, since it is the number this project itself is
measured against — and it keeps being traced and published by the
workspace `write` run.

`projects/JimmyPaolini` and `projects/affirmancy` have no
`callidescope-restrict` target at all — a different fact from taking the default. Taking the default
means a gate that runs and passes against the number below; these two have no
gate to pass. `JimmyPaolini` holds only a `package.json`, being the git
submodule this repository leaves deliberately uninitialized everywhere (see
`AGENTS.md`'s `### Git Worktrees`); `affirmancy` is a Python Jupyter
notebook application holding no `tsconfig.json`, and the plugin infers its
targets only onto a project that holds one
(`projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:353`).

Imported by the six conformetry leaf analyzers above, which name
`maximumDepth: workspaceLimits.maximumDepth` explicitly rather than
spreading it, so a number lowered here still reaches them; every other
project's own boundary-tested number would otherwise be mistaken for one
still tracking this file.

## What a project's own `callidescope.config.ts` spreads, and then overrides

The second of this file's two exports, and the second of its two roles. The
default export below is the _workspace run's_ own configuration — the
directories it traces, the ignore file it reads, and the destinations it
writes — and is what a run loads. This object is what one _project_ is held
to, and nothing here belongs to the run: a project spreading it cannot
accidentally adopt the workspace's own output destinations, because none of
them is in here to adopt.

```ts
import { projectDefaults } from "../../../configuration/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: { maximumBreadth: undefined, maximumDepth: 4 },
};
```

A relative import resolved by the configuration loader when it reads the
file, rather than a package dependency, so spreading this adds no edge to a
project's dependency graph — the same arrangement forty-nine
`codometer.config.ts` files in this repository already run on.

**Spreading this is what makes a complete file cheap.** A project's
configuration must set every field — that is what lets it be read as the
whole statement of how the project is traced and judged — and writing eleven
members out by hand in forty-two files would be a tax nobody pays twice.
The spread costs one line, and what a reader then sees in the project's own
file is the complete set: the tool's own decorator list, its entry-point
switches, the default depth, and a markdown destination pointing at that
project's own README.

Every traced project spreads it, each writing its own `limits` beside the
spread the way the example above shows.
`projects/ic-suite/callidescope/callidescope-examples/callidescope.config.ts` is outside that count
altogether: the package is excluded from workspace tracing by
`.callidescopeignore`, and its own file is the annotated worked example this
file names above, standing alone with a full type import and its fields
spelled out inline precisely so a reader can see every field a project must
set without also having to resolve this file's export.

## The report is published on main, and only the depth gate runs on a branch

A generated block in a tracked file has to be regenerated by whoever changes
the thing it describes, and this one changes on nearly every pull request.
Codometer already documents where that leads — every branch rewrites the same
block and conflicts with every other one — which is why it measures on main
instead. A call-stack block inherits that, and something worse: staleness
would fail every pull request whose call graph moved until the author reran
the writer, burying the depth findings the gate exists to surface.

So the two are split at the mechanism rather than by leaving the destination
unset. Depth — and, wherever a project declares `limits.maximumBreadth`,
breadth too — is gated by the inferred per-project `callidescope-restrict`
target, an executor of its own rather than a flag on this one, scoped by
`nx affected` to whatever a change touched. It reads no destination at all,
so its exit code is purely the depth (and, where judged, breadth) verdict.
`nx run configuration:callidescope:write` passes `--write`, and the release
workflow runs it on main. That is the only configuration this target
carries now: `lint-code` does not depend on it, so no run of it ever
forwards `write` here, and `defaultConfiguration` is `write` for the same
reason — there is nothing else left to default to.

Every rule and finding this configuration turns on has a worked example in
`projects/ic-suite/callidescope/callidescope-examples`, which also demonstrates the opposite half
of the split above: it gates `reports` rather than `depth`, because its
traced source is frozen fixture code. `.callidescopeignore` keeps it out of
this run, because its fixtures exist to breach the limits set here.

- `projects/ic-suite/callidescope/callidescope-examples/README.md` — how to read a stack, and how
  to act on a depth or breadth finding.
- `projects/ic-suite/callidescope/callidescope-examples/AGENTS.md` — a "callidescope reported X →
  open this example" table, for an agent handed a failing run.
