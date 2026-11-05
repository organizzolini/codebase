# 🛠️ Configuration

**The workspace's tool configuration, and the Nx targets that run it.**

Every linter, formatter, scanner, git hook, and IC-suite config lives here,
beside the base `tsconfig.json` every project extends. This project also owns
the Nx targets that run those tools over the repository's own files, so the root
`project.json` is left with what concerns the repository as a whole.

## Usage

Run a target by name, in `check` mode unless the target names another:

```bash
nx run configuration:eslint:check        # lint the workspace root
nx run configuration:knip:check          # unused files, exports, and dependencies
nx run configuration:codometer:write     # measure the repository and write the README badges
nx run configuration:local-registry      # a local Verdaccio registry for publish rehearsals
```

`lint-code`, `format-code`, `deprecate-code`, `secure-code`, and `guard-code` are
the aggregates every project declares. Here they gather the root-file checks
below, so `nx affected --target=lint-code` reaches them the way it reaches any
other project.

## What it owns

| Group            | Targets                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint and format  | `eslint`, `oxlint`, `oxfmt`, `prettier`, `markdown-lint`, `yaml-lint`, `shellcheck`, `spell-check`                                                 |
| Unused code      | `knip`, `fallow`, `fallow-dead-code`, `fallow-health`, `fallow-duplicates`, `fallow-audit`, `fallow-fix`, `jscpd`, `vulture`, `sherif`, `syncpack` |
| Security         | `gitleaks`, `trivy-config`, `license-check`, `pnpm-audit`                                                                                          |
| IC-suite         | `callidescope`, `codependix`, `codometer`, `build-projects`                                                                                        |
| Git hooks        | `commit-msg`, `commitlint`, `pre-commit`, `pre-push`, `lint-staged`, `validate-branch-name`                                                        |
| Local publishing | `local-registry`                                                                                                                                   |

## In the graph, and out of releases

Every project's `eslint.config.ts`, `vite.config.ts`, and `vitest.config.ts`
imports from this folder, so every project depends on `configuration` in the Nx
graph. That is the honest picture, and CI relies on it: a change here affects
every project, and the task cache keeps the ones it does not touch cheap.

The folder also imports a few IC-suite packages for their types. Those edges
would close cycles through each package's `core` layer, so
[`project.json`](project.json) removes them with `implicitDependencies`. The
codependix rules name the `name:configuration` tag as a permitted target for
every layer, so nothing there fails on it.

A release is the one place a change here must not spread.
the `publication` project's `version-packages` command adds this folder to `.nxignore` for the
single `nx release` command, so a commit that edits only configuration releases
no package, while a commit that edits a package still does.

## What this repository keeps outside it

The tools that locate their own file at the root stay there: `nx.json`,
`package.json`, the pnpm and uv workspace files, `tsconfig.json`, the git and
editor dotfiles, and `validate-branch-name.config.cjs`, whose tool takes no
path. Everything a tool can be told to read lives here, and every command
passes the path explicitly.

## Reading root paths

A project's `{projectRoot}` is `configuration`, but the targets here
read workspace-root paths. So each sets its `cwd` to `{workspaceRoot}` and lists
its inputs as `{workspaceRoot}` globs. The `workspace-files` named input stands
for every file no other project owns.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run configuration:coinagerie-check:write`.

- **adjective**: A part-of-speech key in the local wink-lemmatizer type declarations, which types the lemmatizer function for adjectives.
- **anchor**: A named block marker in a README that codependix fills with its generated dependency graph, so the rendered diagram stays current.
- **attribution**: The commit message trailer that credits a co-author, such as Co-authored-by, which commitlint accepts in a message body.
- **autocomplete**: A settings scope named in comments of the conventional config, and the jsx-a11y autocomplete-valid rule the lint configs enable.
- **band**: Appears only inside the word bandit, the Python security scanner named in the Python project templates.
- **baseline**: Fallow reporting keys, deadCodeBaseline and healthBaseline, set to null so no existing findings are grandfathered.
- **binary**: A compiled executable that a git hook runs instead of a slower Node script, which starts far more slowly.
- **boundary**: The layer rule that codependix checks on every built graph, forbidding imports the workspace declares out of bounds.
- **breadth**: The number of distinct callables a single callable calls directly, which the maximumBreadth limit gates and the breadth command prints.
- **budget**: The comment-length cap codometer enforces per language, such as the TypeScript comment budget in the codometer config.
- **bullet**: A glossary entry line of the form dash, bold word, colon, definition, which coinagerie parses to read headwords.
- **bundle**: The output a bundler such as Vite emits for a package, which the vite library config can inline packages into.
- **callee**: A function that a call expression invokes, which callidescope's excludeCallees pattern can hide from the call-stack trace.
- **camel**: Naming style joining words with capitals, as in nameCamelCase placeholders that conformetry templates fill in.
- **category**: A grouping of tool targets, as in the README table Group column, though the word itself appears nowhere else in this project's files.
- **chain**: The ordered dependency path from core through configuration and analyzers to the CLI, which codependix enforces one way.
- **collapse**: The reporter option collapsePattern, which folds matching paths into a single node in dependency-cruiser and graph diagrams.
- **compression**: The codometer setting that names gzip as the algorithm for measuring compressed size of each file.
- **convention**: A codebase-wide coding rule the lint configs enforce, such as the Logger Convention that LoggerService also enforces at runtime.
- **cycle**: A loop of dependencies that the codependix and dependency-cruiser rules forbid, so projects must not depend on each other circularly.
- **dataset**: The unicorn rule prefer-dom-node-dataset, which the oxlint config enables so code reads data-attributes through dataset.
- **db**: A banned abbreviation for database, which the naming rule rewrites to database and cspell flags in prose.
- **dictionary**: A cspell word list that the spell checker loads by name, configured under dictionaries in cspell.config.yaml.
- **direct**: Immediate rather than transitive, as in the pnpm workspace glob matching every direct child folder of projects.
- **direction**: The way a graph traversal or rule points, as in the codependix chain pointing one way and the oxlint for-direction rule.
- **discovery**: The step that finds which files and projects a tool should scan, as in callidescope's ignore-file notes on discovery.
- **dynamic**: Computed at runtime, as in the no-dynamic-delete rule, which oxlint and ESLint enable to forbid deleting properties.
- **effect**: An ordinary word here, as in the conventional config note that formatting changes have no semantic effect on releases.
- **element**: A single entry of an array, such as one line of JSON that oxfmt collapses where JSON.stringify would split it.
- **exact**: Stem of exactly, as in ignore-file comments saying a file is kept exactly as written, a plain English fragment here.
- **forbid**: A codependix boundary rule kind that disallows matching dependency edges outright, instead of allowing them under a selector.
- **fraction**: The digits after a decimal point in a number literal, which the unicorn no-zero-fractions rule rejects when they are all zeros.
- **gap**: A missing lexical slot that the lexico gap discovery CLI searches English for, the subject of its gap-finding tooling.
- **generation**: The act of writing files from conformetry templates, and the output a generator run leaves in a project folder.
- **generic**: Applying across every layer or project without naming one, as the boundary rules keyed on layer tags do here.
- **glossary**: The root GLOSSARY.md and the per-project README blocks that coinagerie writes, each listing headwords with their definitions.
- **incremental**: Describes a run that reuses earlier results instead of starting over, such as the ci-incremental gitleaks target here.
- **irregular**: Describes whitespace characters that look like spaces but are not, which the no-irregular-whitespace rule rejects.
- **marker**: A tag that delimits a managed region of a file, such as the coinagerie start and end comments in a README.
- **meanderaw**: The name of a workspace project under projects/meanderaw, whose CLI output folder the configuration excludes from checks.
- **natural**: Sort mode that compares embedded numbers by value, which the perfectionist and sort rules here set for entries.
- **negative**: Describes a value below zero, such as the negative offsets that the encoder test clamps to zero.
- **obj**: Abbreviation of object that the cspell flag list bans, with the no-obj-calls rule naming the banned global.
- **occurrence**: One repeat of a code block that fallow's duplicate detection counts against its minOccurrences threshold of two.
- **operator**: Symbol performing an action on operands, such as the void operator that a typescript-eslint rule rejects.
- **orphan**: A file or project with no caller or importer, which callidescope reports as an orphan root and codependix detects.
- **persistence**: Storage that outlives a single run, named as the persistence entry in a configuration block here.
- **pin**: Verb for fixing a tool to an exact version, as the inputs here do for shellcheck through pyproject.toml and uv.lock.
- **presentation**: The display layer of the workspace, held in projects/common/presentation, whose components and hooks render the interface.
- **preset**: A bundled default configuration that a tool extends, such as an ESLint preset whose severity this config downgrades.
- **prop**: Abbreviation of property that the cspell flag list bans, while the postcss node.prop name stays exempt.
- **prose**: Running natural-language text as opposed to code, which the spelling and markdown rules here check.
- **re**: Prefix meaning again, as in re-export, re-run, and re-splice, used throughout configuration comments.
- **ready**: Describes a service able to serve requests, as in the readyz probe and the signalReady call in this configuration.
- **rel**: Abbreviation allowed through the prevent-abbreviations allow list since TanStack Router meta API names its link property this way.
- **reporter**: Output formatter that a test or lint tool writes results through, such as vitest coverage text, json-summary, lcov, and html reporters.
- **restrict**: Suffix of the callidescope-restrict target, which traces only the callables a project owns and gates them against its own limits.
- **reverse**: The unicorn lint rule no-array-reverse set to error, which forbids mutating reverse calls in favor of toReversed.
- **rewrite**: Overwrite a generated README block in place, which release commits do on main so pull requests never conflict over it.
- **role**: The jsx-a11y ARIA attribute rules in oxlint, which check that elements carry valid roles and required attributes.
- **selector**: Config key naming which code or projects a rule applies to, such as codometer comment selectors and codependix project selectors.
- **self**: Edge from a node back to itself, which codependix reports as a cycle, while the no-self-compare rule bans comparing a value with itself.
- **severity**: Threshold level set to style for Shellcheck and to warn or error on codometer limits, deciding how a finding is reported.
- **shadow**: Name-hiding check set to error in typescript-eslint so a variable may not reuse an outer scope name.
- **shorthand**: Object literal form that writes a property whose key matches its value once, enforced by ESLint object-shorthand set to always.
- **sibling**: A package at the same layer as another, which codependix rules keep from importing one another across the conformetry spine.
- **space**: Agent scratch directory such as .superpowers that is gitignored and skipped by ESLint because it is never source.
- **sparse**: Lint rule set to error in oxlint forbidding array literals with holes in them.
- **splice**: Codependix step that rewrites generated graph blocks into every README, which a rename must run in the same commit.
- **standalone**: A template or CLI kind that generates a self-contained project, such as the Python notebook or NestJS nest-commander CLI templates.
- **statistic**: A codometer custom measurement declared with its own label in codometer.config.ts and reported under the custom namespace.
- **suggest**: Unused in this folder since no rule or target here offers suggestions, so the word names nothing configured.
- **testid**: Test selector attribute that each generated React component sets to its kebab-case name, so unit tests can find it.
- **testpath**: Unused in this folder since no test-path option is set here, so the word names nothing configured.
- **threshold**: Duplication ceiling of 6 in both jscpd and fallow duplicate-code settings, above which a run fails.
- **trace**: Callidescope step that follows calls from entry points to record each stack depth and each callable breadth.
- **transition**: Unused in this folder since no rule or target here configures CSS transitions or animation timing, so it names nothing.
- **triple**: Lint rule set to error in oxlint and TypeScript-ESLint forbidding three-slash directive comments that reference other files.
- **unbind**: Unused in this folder since no event listener or subscription is unbound here, so the word names nothing configured.
- **undeclared**: Lacking a declaration in codebase-structure.json, so the folder-structure rule rejects the markdown file or directory.
- **unowned**: A project tagged workspace-unowned in project.json, whose files no Nx project claims, so the workspace root check covers them.
- **unreachable**: Code no entry point reaches, which fallow module-graph analysis treats as dead, so an import here keeps it live.
- **unreadable**: Describes a fixture project kept hard to parse on purpose, which the callidescope ignore list excludes from tracing.
- **unresolved**: Fallow rule set to error, failing on an import whose target cannot be found, while ESLint import no-unresolved is off.
- **validator**: Checker for the files of one language in conformetry, or the validator call that TanStack server-function templates attach to inputs.
- **verb**: Grammatical form a log message must use after its subject, present progressive or past tense, checked by the logger convention rule.
- **violation**: Fallow finding set to warn for an import that crosses a module boundary the layering forbids.
- **wheel**: Packaged Python distribution file that Hatch builds, configured under the Jupyter template pyproject.toml build targets.
- **whitelist**: Vulture allow-list file at the workspace root, naming Python utilities outside Nx projects that look unused but are kept.
- **whitespace**: Conventional-commit type for formatting-only changes, described in conventional.config.cjs as whitespace or code structure changes with no semantic effect.

<!-- coinagerie:end -->
