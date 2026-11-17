<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **anchor**: The pair of start and end comment markers that bracket a generated block in a file, so a write replaces only what lies between them.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **baseline**: The previous codometer report a changes run diffs against, joined per project to produce each row's base value and delta.
- **bullet**: Markdown list item the generated block emits for each instance of a custom statistic, naming the location it came from.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **counter**: Named measurement tally, such as a custom convention, that the pipeline produces and the badge block must always render.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **ic**: Five toolchains grouped as the suite, callidescope, codependix, codometer, coinagerie, and conformetry, that measure and gate this workspace.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **pipeline**: Ordered measurement stages a codometer run passes through, from parsing source files to producing the reports.
- **preamble**: Existing markdown content with trailing newlines trimmed and two newlines added, placed before a newly appended anchored block.
- **retire**: Metric that existed in the baseline but is missing from the current report, shown as removed with a zero value.
- **selector**: Per-instance key in a custom statistic's configuration, such as the comment selector, that splits its breaches by instance.
- **splice**: Method on DocumentsService that replaces the section between markers in a document, leaving everything outside them untouched.
- **statistic**: One measured value, such as a count or size, that a configuration names and the renderer groups into a badge.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **synchronization**: The synchronization project and its Nx target family, which keep VS Code settings, extensions, and devcontainer config matched to their source.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.

<!-- coinagerie:end -->
