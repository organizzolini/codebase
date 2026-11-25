# callidescope-nx

An Nx plugin. It infers `trace`, `depth`, `breadth`, and `gate` targets onto
every project holding a tsconfig at `projectTsconfigPath`, each backed by an executor that runs
callidescope over that project **and its Nx dependencies**, resolved from the
Nx project graph. `gate` is the one a pipeline is meant to read an exit code
from, and the only one a project the workspace configuration **excludes** does
not get: its own code is never traced, so a gate there would own no finding at
all. Both `gate` and `trace` **trace** the dependencies and **judge** only the
projects they were scoped to, so a dependency's breach fails the dependency's
own gate rather than every task downstream of it. A gate that opened none of
the judged project's own files fails rather than passing, because a verdict on
nothing is not a clean project — asked per project rather than of the whole
run, since a project with dependencies always has theirs to show. That one rule
is the only place the two verdicts part: `trace` prints the same block and
passes on it, because an excluded project reads nothing of its own by
definition and keeps its trace after losing its gate, so failing it there would
be permanently red. This is the
only package in the callidescope toolchain that depends on `@nx/devkit`:
`@callidescope/cli` and `@callidescope/graph` are deliberately Nx-free and take
plain `--directories`.

It deliberately ships **no CLI of its own**. Selecting projects is the task
runner's job — `nx affected`, `nx run-many --projects=tag:…` — so a second
binary would only duplicate it with flags that drift.

## Modules

- `address/` — Answers `depth` and `breadth` about the callables it is named, inside a resolved selection of Nx projects (`AddressService`). `address.utilities.ts` holds the one prologue its two executors share.
- `options/` — Narrows the untyped options object Nx hands a plugin (`OptionsService`).
- `plugin/` — Everything this plugin does, behind one injectable: inference, the trace, and the gate (`PluginService`).
- `projects/` — Resolves Nx project names to the directories a callidescope run traces (`ProjectsService`). It takes the Nx graph as an argument everywhere but `readProjectGraph`, so every resolution rule is testable without a workspace.
- `run-configuration/` — Answers which configuration file a run is judged by, the question every other module starts with (`RunConfigurationService`).
- `verdict/` — Decides whether a traced result passes, for every target that reads one (`VerdictService`).

`src/index.ts` is the plugin entry Nx loads.
