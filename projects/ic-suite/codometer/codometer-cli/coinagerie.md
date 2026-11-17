<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **baseline**: The previously committed report that a fresh measurement is diffed against when checking for stale reports.
- **bundle**: The built JavaScript output that codometer measures for the package, with its size checked against a Bundle limit.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **codometerignore**: Ignore file at configuration/.codometerignore that tells codometer which paths to skip when it measures sizes and counts.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **staleness**: The condition of a committed report that differs from a fresh run, kept distinct from a limit breach.
- **statistic**: A custom measurement counter declared in configuration, keyed by its label and measured for each output.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.

<!-- coinagerie:end -->
