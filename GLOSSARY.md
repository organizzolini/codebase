<!-- coinagerie:start -->

## 🪙 Coinagerie

The words the repository uses outside its projects, regenerated with `nx run configuration:coinagerie:write`.

- **affirmancy**: A Python Jupyter notebook project that generates affirmations through a LangGraph ReAct agent running on a local Ollama model.
- **analyzer**: A codometer or callidescope component that inspects one input language's source to produce measurements, such as a TypeScript or Python analyzer.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **applier**: Subagent role that writes leased live copy-edit batches into source files and returns canonical results to the parent.
- **caelundas**: A Node.js CLI for astronomical calendar generation from NASA JPL ephemeris data, one of the workspace's applications.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **callidescopeignore**: Ignore file, configured at configuration/.callidescopeignore, listing paths the trace skips when measuring call stacks.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **codometerignore**: Ignore file at configuration/.codometerignore that tells codometer which paths to skip when it measures sizes and counts.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **compliance**: Gate that checks issue metadata, labels, and issue type on every opened or edited issue, which the workflow reconciles.
- **comply**: The pull request gate, Comply Code, that validates branch name, title, body, labels, assignees, and release significance.
- **conformetry**: IC-suite toolchain that scaffolds code from templates with generators and checks that generated files still match them.
- **context**: Background information an agent or reviewer uses to locate and judge a change, and the root CONTEXT.md domain glossary.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target run with typecheck, lint, format, and deprecate across affected projects, in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **dispatch**: Orchestration step where the main session hands each parent issue or ticket to a fresh subagent with its own brief.
- **documentation**: Folder holding the ADRs of this repository, agent configuration, guides, and generated OpenWiki pages, reached through the docs link.
- **documenter**: Impeccable subagent that records DESIGN.md and its sidecar from a finished build, deriving the design system from the shipped artifact.
- **fold**: Coinagerie configuration hook that maps a word to its canonical headword, merging families like plurals and spelling variants.
- **guard**: Nx code-quality target run with typecheck, lint, format, and deprecate across affected projects, in the validate-code step.
- **ic**: Five toolchains grouped as the suite, callidescope, codependix, codometer, coinagerie, and conformetry, that measure and gate this workspace.
- **impeccable**: Design tooling suite whose agents and skills, such as asset producer and finish reviewer, drive approved visual builds.
- **infrastructure**: Top-level folder of deployment projects such as Helm charts and Terraform, whose words the root glossary skips.
- **installation**: Setup process that installs the toolchain and dependencies, run by scripts/installation.sh and the installation project.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **lookup**: Read-only callidescope query that traces a callable, prints its callers or callees, and never applies a depth or breadth gate.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **meander**: Greek key or fret border motif that the meanderaw project generates as SVG from composable motif and modifier definitions.
- **modifier**: Composable transform in meanderaw's motif library that adjusts how a Greek meander motif is drawn.
- **notepad**: Scratch SQL file, notepads/notepad.sql, that the query-sql skill writes multiline queries into rather than inline -c flags.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **phone**: Narrowest viewport size that web layouts and published artifacts must work at, with a 16px side gutter and no horizontal scroll.
- **probe**: Diagnostic experiment in diagnosing-bugs, which must map to a prediction and change one variable at a time.
- **producer**: Impeccable subagent role that turns approved mock references into clean reusable raster assets without redesigning them.
- **prompt**: A Markdown instruction file under the prompts folders or an agent brief, handed to a model to drive one repeatable task.
- **publication**: The CLI project that runs the CI release steps and enforces the publishable-packages gate, listed in the CONTRIBUTING project table.
- **publishable**: A package the publication gate verifies and packs for release, including every publishable ic-suite package that CI tarballs and installs.
- **refresh**: The Refresh Documentation workflow that regenerates the repository wiki on a schedule, and the reload step after instruction changes.
- **relationship**: The link between an agent prompt and the chat mode whose tools it inherits, which prompt instructions must mention when it applies.
- **reviewer**: The agent role that checks a finished change against its contract and returns an ordered list of fixes, such as the impeccable finish reviewer.
- **secure**: The secure-code CI target that runs secret, Python AST, dependency, and infrastructure scans on every pull request.
- **structure**: The enforced folder layout of the workspace, validated by the structure rule and the devcontainer workspace structure check.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **synchronization**: The synchronization project and its Nx target family, which keep VS Code settings, extensions, and devcontainer config matched to their source.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **validation**: Workspace package and CLI, such as validation.main.ts, that checks PR bodies, branch names, and worktree names locally.

<!-- coinagerie:end -->
