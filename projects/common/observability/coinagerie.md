<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **contract**: What a public surface promises its callers and must keep working: `src/index.ts`, and the NestJS `LoggerService` interface that `LoggerService` implements.
- **convention**: The logging message rule: an emoji naming the subject, then a present-progressive or past-tense verb, checked at runtime and by lint.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **documentation**: Folder holding the ADRs of this repository, agent configuration, guides, and generated OpenWiki pages, reached through the docs link.
- **greeter**: Sample service, `SampleGreeterService`, that the testing-module utility tests inject to prove a logger receives the service's name as its context.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **trace**: The verbose log level below debug, which LoggerService.verbose emits through its pino child logger.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.
- **verb**: The grammatical word the convention rule requires after the emoji subject, in present-progressive or past tense.

<!-- coinagerie:end -->
