<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **aspect**: Example word in folding tests, where aspects folds into the singular aspect; also a fixture file name.
- **bundle**: Fixture path dist/bundle.js that discovery tests use to check an exclude list drops the dist folder.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **fold**: Coinagerie configuration hook that maps a word to its canonical headword, merging families like plurals and spelling variants.
- **glossary**: The GLOSSARY.md file discovery skips so a glossary's own headwords never count as codebase vocabulary.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **headword**: The single form a word folds into, which the glossary lists once and exclusion compares against.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **phase**: A word split from the fixture file aspect-phase-emoji.service.ts, testing that hyphenated names split into words.
- **term**: A word of at least two code points that counts toward the vocabulary, as defined by TERM_LENGTH_PATTERN.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **verb**: Lemmatizer step from wink-lemmatizer reducing an inflected verb form to its base, as configuring to configure.
- **vocabulary**: The sorted list of every word the codebase uses, produced by VocabularyService.collect after folding and exclusion.

<!-- coinagerie:end -->
