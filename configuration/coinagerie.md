<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **affirmancy**: A Python Jupyter notebook project that generates affirmations through a LangGraph ReAct agent running on a local Ollama model.
- **alt**: Short for alternative text, the image description attribute that the markdown and jsx-a11y lint rules require here.
- **anchor**: A named block marker in a README that codependix fills with its generated dependency graph, so the rendered diagram stays current.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **attribution**: The commit message trailer that credits a co-author, such as Co-authored-by, which commitlint accepts in a message body.
- **band**: Appears only inside the word bandit, the Python security scanner named in the Python project templates.
- **baseline**: Fallow reporting keys, deadCodeBaseline and healthBaseline, set to null so no existing findings are grandfathered.
- **boundary**: The layer rule that codependix checks on every built graph, forbidding imports the workspace declares out of bounds.
- **breadth**: The number of distinct callables one callable calls directly. Callidescope reports it in each project's Breadth table and gates it with `maximumBreadth`. Defined here once for every project.
- **budget**: The comment-length cap codometer enforces per language, such as the TypeScript comment budget in the codometer config.
- **bundle**: The output a bundler such as Vite emits for a package, which the vite library config can inline packages into.
- **caelundas**: The astronomical calendar product under projects/caelundas: a CLI that detects sky events from Swiss Ephemeris positions, and the database, API, and web calendar that store and show them.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **callidescopeignore**: Ignore file, configured at configuration/.callidescopeignore, listing paths the trace skips when measuring call stacks.
- **category**: A grouping of tool targets, as in the README table Group column, though the word itself appears nowhere else in this project's files.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **codometerignore**: Ignore file at configuration/.codometerignore that tells codometer which paths to skip when it measures sizes and counts.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **conformetry**: IC-suite toolchain that scaffolds code from templates with generators and checks that generated files still match them.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **convention**: A codebase-wide coding rule the lint configs enforce, such as the Logger Convention that LoggerService also enforces at runtime.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **db**: A banned abbreviation for database, which the naming rule rewrites to database and cspell flags in prose.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **dictionary**: A cspell word list that the spell checker loads by name, configured under dictionaries in cspell.config.yaml.
- **documentation**: Folder holding the ADRs of this repository, agent configuration, guides, and generated OpenWiki pages, reached through the docs link.
- **element**: A single entry of an array, such as one line of JSON that oxfmt collapses where JSON.stringify would split it.
- **fold**: Coinagerie configuration hook that maps a word to its canonical headword, merging families like plurals and spelling variants.
- **forbid**: A codependix boundary rule kind that disallows matching dependency edges outright, instead of allowing them under a selector.
- **gap**: A missing lexical slot that the lexico gap discovery CLI searches English for, the subject of its gap-finding tooling.
- **generation**: The act of writing files from conformetry templates, and the output a generator run leaves in a project folder.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **ic**: Five toolchains grouped as the suite, callidescope, codependix, codometer, coinagerie, and conformetry, that measure and gate this workspace.
- **infrastructure**: Top-level folder of deployment projects such as Helm charts and Terraform.
- **installation**: Setup process that installs the toolchain and dependencies, run by scripts/installation.sh and the installation project.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **meander**: Greek key or fret border motif that the meanderaw project generates as SVG from composable motif and modifier definitions.
- **meanderaw**: The name of a workspace project under projects/meanderaw, whose CLI output folder the configuration excludes from checks.
- **modifier**: Composable transform in meanderaw's motif library that adjusts how a Greek meander motif is drawn.
- **negative**: Describes a value below zero, such as the negative offsets that the encoder test clamps to zero.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **presentation**: The display layer of the workspace, held in projects/common/presentation, whose components and hooks render the interface.
- **preset**: A bundled default configuration that a tool extends, such as an ESLint preset whose severity this config downgrades.
- **prop**: Abbreviation of property that the cspell flag list bans, while the postcss node.prop name stays exempt.
- **reporter**: Output formatter that a test or lint tool writes results through, such as vitest coverage text, json-summary, lcov, and html reporters.
- **restrict**: Suffix of the callidescope-restrict target, which traces only the callables a project owns and gates them against its own limits.
- **rewrite**: Overwrite a generated README block in place, which release commits do on main so pull requests never conflict over it.
- **role**: The jsx-a11y ARIA attribute rules in oxlint, which check that elements carry valid roles and required attributes.
- **secure**: The secure-code CI target that runs secret, Python AST, dependency, and infrastructure scans on every pull request.
- **selector**: Config key naming which code or projects a rule applies to, such as codometer comment selectors and codependix project selectors.
- **self**: Edge from a node back to itself, which codependix reports as a cycle, while the no-self-compare rule bans comparing a value with itself.
- **shadow**: Name-hiding check set to error in typescript-eslint so a variable may not reuse an outer scope name.
- **shorthand**: Object literal form that writes a property whose key matches its value once, enforced by ESLint object-shorthand set to always.
- **sibling**: A package at the same layer as another, which codependix rules keep from importing one another across the conformetry spine.
- **splice**: Codependix step that rewrites generated graph blocks into every README, which a rename must run in the same commit.
- **standalone**: A template or CLI kind that generates a self-contained project, such as the Python notebook or NestJS nest-commander CLI templates.
- **statistic**: A codometer custom measurement declared with its own label in codometer.config.ts and reported under the custom namespace.
- **structure**: The enforced folder layout of the workspace, validated by the structure rule and the devcontainer workspace structure check.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **synchronization**: The synchronization project and its Nx target family, which keep VS Code settings, extensions, and devcontainer config matched to their source.
- **trace**: Callidescope step that follows calls from entry points to record each stack depth and each callable breadth.
- **triple**: Lint rule set to error in oxlint and TypeScript-ESLint forbidding three-slash directive comments that reference other files.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unbind**: Unused in this folder since no event listener or subscription is unbound here, so the word names nothing configured.
- **unowned**: A project tagged workspace-unowned in project.json, whose files no Nx project claims, so the workspace root check covers them.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.
- **verb**: Grammatical form a log message must use after its subject, present progressive or past tense, checked by the logger convention rule.
- **whitespace**: Conventional-commit type for formatting-only changes, described in conventional.config.cjs as whitespace or code structure changes with no semantic effect.

<!-- coinagerie:end -->
