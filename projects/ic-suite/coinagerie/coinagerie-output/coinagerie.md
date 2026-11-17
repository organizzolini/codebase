<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **anchor**: The pair of start and end comment markers that bracket a generated block in a file, so a write replaces only what lies between them.
- **boundary**: Edge where glossary text enters the package, where it is parsed and validated before any comparison or write happens.
- **bullet**: One word's entry in a glossary block, written as a dash, bolded word, and colon, read by the markdown parser.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **glossary**: The map from each word to its definition, which the parsers fill and comparison checks against the codebase.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **hand**: Manually written or manually scanned: tests use hand-written blocks, and tokenizing scans JSON by hand rather than regex.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **preamble**: Free text opening a generated block, made of the start anchor, heading, and description before the bullets.
- **reconcile**: Rewrites a glossary to exactly the codebase vocabulary, sorted, keeping existing definitions and dropping stale words.
- **splice**: Inserts or replaces the anchored block inside a file's content, preserving that file's own CRLF or LF line endings.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **vocabulary**: The set of words the codebase uses, which comparison checks each glossary against to find missing or stale words.

<!-- coinagerie:end -->
