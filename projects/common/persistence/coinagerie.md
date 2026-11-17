<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **convention**: The naming and log-message rules that the package's entities, commands, and tests follow, checked by tests and the lint rules.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **creatable**: The entity base layer that adds create-time columns, sitting second in the identifiable, creatable, updatable, deletable chain.
- **db**: A stray fragment for database; this package's code and docs use the full word, so the headword carries no local role.
- **deletable**: The entity base layer that adds soft-delete support, last in the identifiable, creatable, updatable, deletable chain.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **explain**: Builds the human-readable reason a command refused to run, as ExportCommand.explain does for missing dump tables.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **identifiable**: The entity base layer that adds a primary id, first in the identifiable, creatable, updatable, deletable chain.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **refusal**: A deliberate, explained refusal to run, such as truncate refusing a table that another table still references.
- **role**: The Postgres role, the database user identity that connections and grants run as, as in the README context table.
- **trace**: The callidescope call-stack trace that measures depth, with config notes on which callees the trace does not follow.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unqualified**: A table name without a schema prefix, which resolves in the --schema option's search path rather than a fixed schema.
- **updatable**: The entity base layer that adds update tracking columns, third in the identifiable, creatable, updatable, deletable chain.
- **verb**: The verb in a log message that the export log convention test expects after the subject emoji, such as exists.

<!-- coinagerie:end -->
