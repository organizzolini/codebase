<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **conformetry**: IC-suite toolchain that scaffolds code from templates with generators and checks that generated files still match them.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **lenient**: Describes a group with a looser threshold; when groups disagree the strictest wins, so a lenient one cannot relax a bar.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **under**: Nests each finding beneath its file when the runner assembles results, so the report groups defects by the file they belong to.
- **unrecorded**: Instance whose match recorded no stand-in placeholder values, leaving nothing for inference to fill, so the run stays ok.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.

<!-- coinagerie:end -->
