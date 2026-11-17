<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **adopt**: Renaming the newest restored task database to this machine's id so the CI job reuses it.
- **adoption**: The AdoptionPlan that decides which restored task database to rename to this machine's id, if any.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **baseline**: The codometer report snapshot from a green main build, which later pull requests are compared against.
- **batch**: Group of knip tasks Nx hands to one executor call, which runs knip once from the workspace root and splits its findings by project.
- **bullet**: A single list item the upgrade-dependencies step adds to its pull request's details section.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **charge**: Assign a knip or cspell finding to the workspace root that owns its file, so only a finding charged to a project fails that project.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **corrupt**: A task database that fails its integrity check, which CI discards with a warning instead of restoring it.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **explain**: Produce the report of why a project failed, by running that project alone again to get exactly what a single run prints.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **probe**: Diagnostic experiment in diagnosing-bugs, which must map to a prediction and change one variable at a time.
- **rewrite**: Replacing a package.json field's value in place, as package-manifest does for each field it edits.
- **selector**: A path that narrows a conformetry run to one file, such as its template configuration.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unattributed**: Count of knip findings in files no project root owns, which no project's check can fail on and so are tallied apart.
- **unchanged**: A step outcome in which the upgrade left every file as it was, so nothing needs a pull request change.
- **unrestored**: An upgrade outcome where a failed step could not be undone, so the run stops and reports it.

<!-- coinagerie:end -->
