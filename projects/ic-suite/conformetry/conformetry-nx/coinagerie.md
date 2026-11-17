<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **conformetry**: IC-suite toolchain that scaffolds code from templates with generators and checks that generated files still match them.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **generation**: Writing instance files from a generator, done by the shared generation runtime through an Nx Tree adapter.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **populate**: Fill a temporary workspace with the files a test needs before it runs, as `populateWorkspace` does in the instances service test.
- **prompt**: A Markdown instruction file under the prompts folders or an agent brief, handed to a model to drive one repeatable task.
- **statistic**: Stat result object in the bootstrap test, returned by lstat so its symbolic link check reads the outcome.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.

<!-- coinagerie:end -->
