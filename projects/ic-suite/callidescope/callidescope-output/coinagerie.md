<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **anchor**: The pair of start and end comment markers that bracket a generated block in a file, so a write replaces only what lies between them.
- **callable**: Function, method, or constructor declaration that a report lists by display name, id, and stacks.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **documentation**: Folder holding the ADRs of this repository, agent configuration, guides, and generated OpenWiki pages, reached through the docs link.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **headroom**: Measure of how far a stack or callable sits below its limit, bucketed into labeled ranges for the report.
- **lookup**: Read-only callidescope query that traces a callable, prints its callers or callees, and never applies a depth or breadth gate.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **splice**: Replace the anchored region of a markdown file with freshly generated text, keeping everything outside it.
- **staleness**: Verdict that extracted anchored content has drifted from a fresh render, decided by comparing both blocks.
- **trace**: Call-stack walk recorded for an address or project, the traced paths the report renders.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unmeasured**: Headroom bucket and reading for a callable with no depth measurement, labeled no stacks in reports.
- **unread**: Project whose files a run never read, which a report flags rather than counting as clean.

<!-- coinagerie:end -->
