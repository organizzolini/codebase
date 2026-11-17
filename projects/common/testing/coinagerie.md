<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **contract**: The `LoggerServiceContract` type from `@codebase/observability`, the logger shape the testing-module builder accepts.
- **counter**: A spy in `setup.unit.test.ts` that counts calls, proving mocks reset between tests.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **dispatch**: Orchestration step where the main session hands each parent issue or ticket to a fresh subagent with its own brief.
- **dispose**: Cleanup call on a sandbox runner that deletes its temporary consumer directory, which a packed test calls once it has finished with the installed tarballs.
- **execa**: Child-process library behind the testing package's end-to-end runners, which run commands with a sanitized environment, a timeout, and captured output.
- **forbid**: Names the packages an entry point must not reach, `execa` and `verdaccio`, in `entries.unit.test.ts`.
- **fork**: The `node:child_process` function, one of the process starters the child-process mock replaces with a spy.
- **gap**: Missing piece in an example's documentation, such as its README or index link, which the shared example-run helpers name.
- **greeter**: Sample dependency class in the module-wiring tests, injected to prove a module resolves its providers.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **ping**: Sample server function in the browser stand-in tests that answers `pong`.
- **poem**: Sample route in the route-render tests whose loader data the rendered heading shows.
- **prompt**: A Markdown instruction file under the prompts folders or an agent brief, handed to a model to drive one repeatable task.
- **reader**: Sample module in the file-system mock tests, `sample-file-reader`, that reads a file through the mocked `node:fs`.
- **role**: The ARIA role testing-library queries find an element by, as in `findByRole("heading")`.
- **sandbox**: Isolated consumer project outside the workspace, where a packed test installs tarballs and runs the real executable. Everyday "sandbox" suggests a safe play area; here it is a disposable directory. Created by `createTarballSandboxRunner`.
- **selector**: A CSS selector string passed to `querySelector` in the route-render tests.
- **self**: The `self_path` key the Nx plugin sandbox writes, pointing a consumer workspace at its own directory.
- **starter**: A `node:child_process` function that starts a process, such as `spawn` or `fork`; `ProcessStarter` names the ones the mock replaces.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **wire**: Connect a NestJS module's providers so its classes resolve; the module-wiring assertions check that this holds.

<!-- coinagerie:end -->
