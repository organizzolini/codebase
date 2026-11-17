<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **ambient**: Module that NestJS marks as global, drawn as a rounded node and left out of edges because every module can inject it.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **caelundas**: The astronomical calendar product under projects/caelundas: a CLI that detects sky events from Swiss Ephemeris positions, and the database, API, and web calendar that store and show them.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **qualifier**: Separator slash joining a project name to a module class name, so each node id is unique across the workspace graph.
- **restrict**: ESLint no-restricted-imports rule, which bans importing @nx/devkit outside the nx-projects package so only it depends on Nx.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.

<!-- coinagerie:end -->
