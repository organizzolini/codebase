<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **baseline**: Starting version a package is measured from when no earlier tag exists, placed on the commit before it was added.
- **batch**: Group of six tags pushed together by tag-packages, with a rejected batch retried, so pushes respect the remote's limits.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **ic**: Five toolchains grouped as the suite, callidescope, codependix, codometer, coinagerie, and conformetry, that measure and gate this workspace.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **mirror**: Publish step that copies each npm package to GitHub Packages as owner/project, exiting 1 when a mirror or input fails.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **quiet**: Git flag --quiet passed to fetch and diff in the release steps, suppressing output so the run logs stay readable.
- **rehearsal**: Dry-run release mode where packages are not really published, and which is refused if any would reach a real registry.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.

<!-- coinagerie:end -->
