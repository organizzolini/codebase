<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **affirmancy**: A Python Jupyter notebook project that generates affirmations through a LangGraph ReAct agent running on a local Ollama model.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **batch**: Group of gate tasks Nx hands to one executor call, which traces the workspace once and judges each project from that trace.
- **callable**: Function, method, or class member that a trace or query names by its file and qualified name in an address.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **explain**: Produce a reason for why an address or verdict failed to match, printed as a block the reader can follow.
- **gamma**: Placeholder project name for a third fixture dependency, as in an alpha-beta-gamma chain in tests.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **lookup**: Read-only callidescope query that traces a callable, prints its callers or callees, and never applies a depth or breadth gate.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **restrict**: Target name, callidescope-restrict, given to the gate executor that restricts a run to the selected projects.
- **trace**: Executor that builds call stacks for a project and its dependencies, printing the same verdict block a gate prints.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unread**: Project whose own files a run reads nothing from, which makes its gate fail rather than pass silently.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.

<!-- coinagerie:end -->
