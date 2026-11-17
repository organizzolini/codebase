<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **affirmancy**: A Python Jupyter notebook project that generates affirmations through a LangGraph ReAct agent running on a local Ollama model.
- **affirmation**: Generated phrase that the affirmations feature planning documents describe, produced by an LLM from tarot-card references.
- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **band**: Horizontal strip of a meander drawing bounded by two borders, which ADR 0004 and ADR 0006 adjust for crossings and branch families.
- **border**: Edge of a meander band that ADR 0006 closes on both sides in the branch and parallel families through a MotifService hook.
- **bundle**: Bundle-size measurement that ADR 0003 folds into codometer as a general change report, replacing the separate reporting module.
- **caelundas**: The astronomical calendar product under projects/caelundas: a CLI that detects sky events from Swiss Ephemeris positions, and the database, API, and web calendar that store and show them.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **canonical**: The one form chosen to stand for a meander or its symmetry class, which ADR 0007 and ADR 0014 standardize addressing and rotation around.
- **cascade**: Refers to the cascading dependents rule in ADR 0017, where a bump to one internal dependency republishes every package depending on it.
- **characteristic**: Named property of a meander, such as its letter counts, that ADR 0012 and ADR 0018 store together in one sparse JSON map.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **conformetry**: IC-suite toolchain that scaffolds code from templates with generators and checks that generated files still match them.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **corpus**: Committed historical set of meander drawings that ADR 0006 and ADR 0013 read as a test set for regression checks.
- **cut**: Seam where a meander band is split, which ADR 0006 and ADR 0013 use when comparing one drawing or family to another.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **design**: Architectural design that an ADR records, or a rule like ADR 0002 that a pull request gate would fail every pull request by design.
- **documentation**: Folder holding the ADRs of this repository, agent configuration, guides, and generated OpenWiki pages, reached through the docs link.
- **domain**: The problem area a project models, such as Latin lexicography or astronomy, whose terms its code and plans use.
- **ephemeris**: Astronomical position data that the caelundas performance plan generates year by year with local computation instead of HTTP calls.
- **family**: Meander classification group, such as the cross, branch, and parallel families whose drawing rules ADR 0004 and ADR 0006 adjust.
- **fold**: Coinagerie configuration hook that maps a word to its canonical headword, merging families like plurals and spelling variants.
- **generation**: Refers to conformetry's generation package that renders code from templates, and the generation layer named in ADR 0013.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **handoff**: Structured hand-off comment posted on a spec issue for the next session, whose repository rules agents handoffs documentation sets out.
- **historical**: Describes the historical meander corpus of committed drawings whose labels ADR 0012 and ADR 0013 treat as a test set.
- **ic**: Five toolchains grouped as the suite, callidescope, codependix, codometer, coinagerie, and conformetry, that measure and gate this workspace.
- **infrastructure**: Top-level folder of deployment projects such as Helm charts and Terraform.
- **interlace**: Woven over-and-under crossing pattern in meander drawings, which ADR 0004 breaks with a one-pitch gap at each crossing.
- **lattice**: Grid on which every meander sits, which ADR 0007 uses to address each drawing and MeanderLatticeService validates against.
- **law**: Governing rule in ADR 0011, the universal path and naming law that every project type follows for its file layout.
- **letter**: Glyph counted in each meander's letter-count map under ADR 0017, counted in all sixteen orientations for every meander.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **meander**: Greek key or fret border motif that the meanderaw project generates as SVG from composable motif and modifier definitions.
- **meanderaw**: Meander drawing project whose cross, branch, and parallel families ADRs 0004 to 0006 change, producing the drawings in the corpus.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **pipeline**: Generic meander pipeline of decode, render, compute Characteristics, and classify that ADR 0012 runs for every drawing.
- **pitch**: One grid unit on the lattice, which ADR 0004 uses to place the interrupted crossing break one pitch either side of the junction.
- **prompt**: A Markdown instruction file under the prompts folders or an agent brief, handed to a model to drive one repeatable task.
- **refresh**: The Refresh Documentation workflow that regenerates the repository wiki on a schedule, and the reload step after instruction changes.
- **role**: Layer assignment of a package, which ADR 0013 documents so a reader learns its place without opening its index file.
- **rotation**: A cyclic column shift of a meander's Code; ADR 0014 picks one canonical rotation for each drawing by minimizing seam components.
- **statistic**: Per-project figure, such as the statistics block that ADR 0002 publishes in each project's README on the default branch.
- **structure**: The enforced folder layout of the workspace, validated by the structure rule and the devcontainer workspace structure check.
- **suite**: A set of related toolchains or tests, such as the five ic-suite toolchains callidescope, codependix, codometer, coinagerie, and conformetry.
- **swiss**: Short for Swiss Ephemeris, the local astronomy library that the caelundas performance plan uses instead of NASA Horizons HTTP calls.
- **synchronization**: The synchronization project and its Nx target family, which keep VS Code settings, extensions, and devcontainer config matched to their source.
- **triage**: Diagnosing what a failing check, hook, or plan item needs before fixing it, as in the triage-integration skill.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **under**: Names the under-strand of a meander crossing, the strand that ADR 0004 breaks with a one-pitch gap at the junction.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.
- **wiki**: OpenWiki output under documentation openwiki that the refresh service regenerates from code, reached through the openwiki symlink.

<!-- coinagerie:end -->
