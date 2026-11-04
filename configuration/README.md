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

- **abbreviation**: A shortened identifier or prose spelling that the spelling rules ban here in favour of the full word.
- **activedescendant**: An ARIA attribute name whose jsx-a11y rule aria-activedescendant-has-tabindex is enforced by the oxlint config here.
- **adjacent**: The TypeScript rule adjacent-overload-signatures, which the lint configs enable so overload signatures stay grouped together.
- **adjective**: A part-of-speech key in the local wink-lemmatizer type declarations, which types the lemmatizer function for adjectives.
- **alert**: The ESLint and oxlint rule no-alert, which bans browser alert dialogs in the web code the lint configs check.
- **alt**: Short for alternative text, the image description attribute that the markdown and jsx-a11y lint rules require here.
- **ambiguous**: The jsx-a11y rule anchor-ambiguous-text, which this config turns off, so link text is never flagged as ambiguous.
- **anchor**: A named block marker in a README that codependix fills with its generated dependency graph, so the rendered diagram stays current.
- **aria**: Prefix of the accessibility attributes, such as aria-props and aria-proptypes, that the oxlint jsx-a11y rules validate.
- **around**: Ordinary English preposition that comments use for code around a route or callable, carrying no project-specific meaning here.
- **arrow**: The arrow-function style rules, such as prefer-arrow-callback, which the lint configs enforce for callbacks.
- **attribution**: The commit message trailer that credits a co-author, such as Co-authored-by, which commitlint accepts in a message body.
- **autocomplete**: A settings scope named in comments of the conventional config, and the jsx-a11y autocomplete-valid rule the lint configs enable.
- **backend**: A server-side application template or build backend, such as hatchling for Python packages and NestJS GraphQL services.
- **background**: The expansion the naming rule accepts in place of bg, so identifiers spell out background in full.
- **ban**: The verb the spelling and lint configs use for forbidding a term, as in banned abbreviations or ban-ts-comment.
- **band**: Appears only inside the word bandit, the Python security scanner named in the Python project templates.
- **bare**: Unadorned, as in a bare root that routes render under in the TanStack template tests, with no wrapping layout.
- **baseline**: Fallow reporting keys, deadCodeBaseline and healthBaseline, set to null so no existing findings are grandfathered.
- **beside**: Ordinary English preposition meaning next to, used in config comments to place a file, a config, or a type next to its neighbour.
- **bg**: A banned abbreviation for background, flagged by cspell and rewritten to background by the naming rule.
- **binary**: A compiled executable that a git hook runs instead of a slower Node script, which starts far more slowly.
- **blob**: A GitHub URL path segment in the markdownlint config's rules link, and the unicorn rule prefer-blob-reading-methods.
- **bool**: A banned abbreviation for boolean, which the naming rule rewrites to boolean, and the git config --bool flag.
- **boundary**: The layer rule that codependix checks on every built graph, forbidding imports the workspace declares out of bounds.
- **bracket**: Square-brace property access, which the tsconfig noPropertyAccessFromIndexSignature option forces for index signatures instead of dot access.
- **breadth**: The number of distinct callables a single callable calls directly, which the maximumBreadth limit gates and the breadth command prints.
- **browser**: The browser runtime target that lint and bundler configs set, which keeps browser globals and bundled code out of Node.
- **budget**: The comment-length cap codometer enforces per language, such as the TypeScript comment budget in the codometer config.
- **bullet**: A glossary entry line of the form dash, bold word, colon, definition, which coinagerie parses to read headwords.
- **bundle**: The output a bundler such as Vite emits for a package, which the vite library config can inline packages into.
- **callee**: A function that a call expression invokes, which callidescope's excludeCallees pattern can hide from the call-stack trace.
- **camel**: Naming style joining words with capitals, as in nameCamelCase placeholders that conformetry templates fill in.
- **caption**: The jsx-a11y rule media-has-caption, which the oxlint config enables so video and audio elements carry captions.
- **carry**: Ordinary verb in config comments meaning to hold or transmit, as in a README that carries badges or a flag that carries values.
- **category**: A grouping of tool targets, as in the README table Group column, though the word itself appears nowhere else in this project's files.
- **chain**: The ordered dependency path from core through configuration and analyzers to the CLI, which codependix enforces one way.
- **click**: The jsx-a11y rule click-events-have-key-events, which the oxlint config enables so clickable elements also handle keyboard input.
- **clone**: The unicorn rules consistent-date-clone and prefer-structured-clone, which the oxlint config enables to copy values correctly.
- **coalesce**: Nullish-fallback operator concept, which no config here names, so the word carries only its everyday TypeScript meaning.
- **coerce**: The Zod z.coerce helper that converts environment strings to numbers, as in the NestJS constants template port variables.
- **collapse**: The reporter option collapsePattern, which folds matching paths into a single node in dependency-cruiser and graph diagrams.
- **commonj**: The require-based module format, which the oxlint and dependency-cruiser configs treat differently from ES modules.
- **comparison**: Contrast drawn between two layer orders in codependix rule text, such as the coinagerie chain set against the conformetry spine.
- **compress**: Gzip-style size reduction, used in the reportCompressedSize Vite option and as codometer's gzip compression setting.
- **compression**: The codometer setting that names gzip as the algorithm for measuring compressed size of each file.
- **concat**: The ESLint rule no-useless-concat, which flags string concatenation of two literals that could be one string.
- **condition**: The test that a branch or package export entry checks, as in no-unnecessary-condition, which ESLint switches off in one block.
- **convention**: A codebase-wide coding rule the lint configs enforce, such as the Logger Convention that LoggerService also enforces at runtime.
- **cookie**: The unicorn rule no-document-cookie, which the oxlint config enables so code never writes browser cookies directly.
- **cycle**: A loop of dependencies that the codependix and dependency-cruiser rules forbid, so projects must not depend on each other circularly.
- **dataset**: The unicorn rule prefer-dom-node-dataset, which the oxlint config enables so code reads data-attributes through dataset.
- **db**: A banned abbreviation for database, which the naming rule rewrites to database and cspell flags in prose.
- **decimal**: A regex escape of a non-octal number, governed by no-nonoctal-decimal-escape, which the oxlint config enables in each block.
- **decode**: Reverses the Base64 cursor encoding in the NestJS GraphQL template utilities, turning an opaque cursor back into its offset or id.
- **delegate**: Hands work to another function, as in the TanStack template comment that server functions delegate their plain logic to utilities.
- **dictionary**: A cspell word list that the spell checker loads by name, configured under dictionaries in cspell.config.yaml.
- **digit**: An ordinary English word, not a color name, so the cspell config keeps it checked rather than exempting it.
- **direct**: Immediate rather than transitive, as in the pnpm workspace glob matching every direct child folder of projects.
- **direction**: The way a graph traversal or rule points, as in the codependix chain pointing one way and the oxlint for-direction rule.
- **discovery**: The step that finds which files and projects a tool should scan, as in callidescope's ignore-file notes on discovery.
- **div**: The HTML block container, which the React component file templates use as the top-level wrapper for generated components.
- **dot**: A Graphviz output option in dependency-cruiser, whose collapse pattern folds node_modules packages into single nodes.
- **driver**: Runtime adapter plugged into a framework, such as the NestJS Apollo driver in templates and the TypeORM postgres driver.
- **dynamic**: Computed at runtime, as in the no-dynamic-delete rule, which oxlint and ESLint enable to forbid deleting properties.
- **effect**: An ordinary word here, as in the conventional config note that formatting changes have no semantic effect on releases.
- **element**: A single entry of an array, such as one line of JSON that oxfmt collapses where JSON.stringify would split it.
- **embed**: Verb for a banned term sitting inside a longer identifier, which the cspell config lists separately so it is still caught.
- **es**: The ECMAScript target and module-format token, as in target es2022 and formats es for the library build.
- **evaluate**: A verb the Jupyter template comments use for Pydantic resolving annotations at class creation, before model_rebuild runs.
- **exact**: Stem of exactly, as in ignore-file comments saying a file is kept exactly as written, a plain English fragment here.
- **explicit**: Stated outright rather than implied, as in the limits object callidescope configs declare beside their spread defaults.
- **fence**: Substring of fenced code blocks, as in markdownlint's MD046 style, which requires fences rather than indentation.
- **float**: Substring of floating, as in the no-floating-promises rule, which the ESLint config enables in most blocks for unawaited promises.
- **floor**: A lower bound, as in the lint-staged worker count held within a floor of four, and the shellcheck style-severity floor.
- **focus**: Substring of focused, as in vitest no-focused-tests and jsx-a11y no-autofocus, two rules that both block focus misuse.
- **follow**: Ordinary verb in comments meaning to come after or be bound by, as in shellcheck following source directives.
- **footer**: The trailing block of a commit message, which the commitlint rules here restrict to Co-authored-by lines only.
- **forbid**: A codependix boundary rule kind that disallows matching dependency edges outright, instead of allowing them under a selector.
- **fraction**: The digits after a decimal point in a number literal, which the unicorn no-zero-fractions rule rejects when they are all zeros.
- **fragment**: The part of a URL after the hash, which the markdown no-missing-link-fragments rule checks against a heading anchor.
- **gap**: A missing lexical slot that the lexico gap discovery CLI searches English for, the subject of its gap-finding tooling.
- **general**: The default limit or rule that applies everywhere before a more specific language or path override replaces it.
- **generation**: The act of writing files from conformetry templates, and the output a generator run leaves in a project folder.
- **generic**: Applying across every layer or project without naming one, as the boundary rules keyed on layer tags do here.
- **glossary**: The root GLOSSARY.md and the per-project README blocks that coinagerie writes, each listing headwords with their definitions.
- **go**: Plain English verb in fallow comments about what a dependency goes on to import, not the Go language.
- **hatch**: The Python build backend named hatchling, whose wheel target the pyproject.toml files here configure for packaging.
- **here**: Adverb in configuration comments and docs pointing at this folder or file, where a tool's setting or rule applies.
- **hex**: Abbreviation of hexadecimal, which the cspell flag list bans and the coinagerie fold map expands to its full spelling.
- **hexadecimal**: Base-16 number notation, which the cspell exemptions here allow for color literals and generated token hashes.
- **history**: The recorded past of a committed report or commit, kept for comparison with a fresh run, as the callidescope reports do here.
- **hold**: Verb in configuration prose meaning a file or folder keeps content, such as stale reports or unexpanded mustache placeholders.
- **html**: The markup language of web pages, which conformetry templates and the lint rules here generate and check for document structure.
- **hydrate**: The step that attaches React to server-rendered markup, the hydrateRoot API that the React lint setup here covers.
- **idx**: Abbreviation of index that the cspell flag list bans, its expansion mapped by the coinagerie fold map.
- **img**: The HTML image element tag, which the cspell exemption list allows as an intrinsic React element type name.
- **immediate**: Describes a mutation made right after a value is created, which the unicorn no-immediate-mutation rule flags.
- **increment**: A one-step rise in heading level, which the markdown heading-increment rule checks so levels never skip.
- **incremental**: Describes a run that reuses earlier results instead of starting over, such as the ci-incremental gitleaks target here.
- **infinity**: The global numeric value for unbounded size, used here as an open upper bound such as a range end.
- **inject**: Verb for supplying a dependency through a constructor, such as NestJS injecting LoggerService into a project's providers.
- **interaction**: A user's exchange with a rendered interface, which this project's configuration mentions only in its glossary headword.
- **internal**: Describes code kept private to its own package or folder, which the boundary and export rules here protect.
- **intersection**: A type formed by combining several types at once, which the perfectionist plugin sorts within a sort rule here.
- **invalidate**: Verb for discarding cached router data so it reloads, as the router call after a server function does here.
- **ipynb**: The Jupyter notebook file extension, which the Python lint and conformetry notebook templates here cover.
- **irregular**: Describes whitespace characters that look like spaces but are not, which the no-irregular-whitespace rule rejects.
- **kebab**: Lowercase words joined with hyphens, the naming style that folder rules and the nameKebabCase template placeholder require.
- **keyboard**: Input device and event family, which the jsx-a11y and unicorn rules check so interactive elements also respond to keys.
- **land**: Verb for a change reaching a spot a tool can act on, such as a hand-edited file with nothing to land on.
- **lang**: The lang attribute on the root HTML element, set to en so screen readers and translators know the page language.
- **lone**: Describes a bare block with no control statement, which the no-lone-blocks rule rejects as needless nesting.
- **lowercase**: Describes all-small spelling, which the language identifiers and folded glossary headwords here use, not display names.
- **many**: Quantity word in prose, such as run-many commands that execute one target across several projects at once.
- **mark**: The exclamation point in a commit subject marking a breaking change, which the commitlint rule here switches off.
- **marker**: A tag that delimits a managed region of a file, such as the coinagerie start and end comments in a README.
- **meanderaw**: The name of a workspace project under projects/meanderaw, whose CLI output folder the configuration excludes from checks.
- **mix**: Verb for combining settings or kinds of thing, appearing in this configuration only as ordinary English prose.
- **mount**: Verb for attaching a React root to a DOM container, which a whole html document cannot do inside the app root.
- **mouse**: Pointer input family such as mouse events, which the jsx-a11y rule pairs with keyboard equivalents.
- **multiple**: Describes more than one of a thing, such as the no-multiple-empty-lines YAML rule limiting consecutive blank lines.
- **mutation**: A write that changes existing state, covering GraphQL Mutation resolvers and the direct-mutation lint rules here.
- **native**: Built into the language or runtime rather than a library, such as native ESLint support or built-in constructors.
- **natural**: Sort mode that compares embedded numbers by value, which the perfectionist and sort rules here set for entries.
- **nav**: Abbreviation of navigation that the cspell flag list bans, while the HTML nav element stays exempt.
- **navigation**: Moving between routes or pages, which a route's loader and head run exactly as a navigation would.
- **negate**: Verb for inverting a condition, which the unicorn no-negated-condition rule asks authors to rewrite positively.
- **negative**: Describes a value below zero, such as the negative offsets that the encoder test clamps to zero.
- **noun**: Part of speech whose singular and plural forms the coinagerie singularizer folds, as in its noun function type.
- **nullish**: Describes null-or-undefined checks, such as the ?? operator, which the prefer-nullish-coalescing rule here switches off.
- **numeric**: Describes number-valued text, such as long numeric literals whose separators the readability rule preserves.
- **obj**: Abbreviation of object that the cspell flag list bans, with the no-obj-calls rule naming the banned global.
- **occurrence**: One repeat of a code block that fallow's duplicate detection counts against its minOccurrences threshold of two.
- **operator**: Symbol performing an action on operands, such as the void operator that a typescript-eslint rule rejects.
- **origin**: The scheme, host, and port identifying a web page, such as the targetOrigin argument that the unicorn rule constrains.
- **orphan**: A file or project with no caller or importer, which callidescope reports as an orphan root and codependix detects.
- **over**: Preposition in comments and docs meaning across a set of files, or a destination taking over a block.
- **pad**: Adds empty space around content, a word that appears here only as a glossary headword, not in any rule.
- **paginate**: Verb for splitting a list into fixed-size pages, as the paginateArray helper in this workspace does.
- **partition**: Splitting a list into groups, as the partitionByNewLine and partitionByComment sort options do in perfectionist rules.
- **pascal**: Capitalized-word naming style, with every word starting upper case, which the jsx-pascal-case rule enforces for React component names.
- **payload**: The data a message or report carries, which the metric rules here exclude when counting prose words.
- **persistence**: Storage that outlives a single run, named as the persistence entry in a configuration block here.
- **pin**: Verb for fixing a tool to an exact version, as the inputs here do for shellcheck through pyproject.toml and uv.lock.
- **pixel**: The CSS length unit px, which the cspell exemption list allows in utility classes such as px-4.
- **playground**: An interactive sandbox page, such as the GraphQL Playground section a project README describes for its API.
- **policy**: A governing set of rules, such as the PostgreSQL policy and function names the naming configuration quotes.
- **precision**: Exactness of a numeric value, which the no-loss-of-precision rule guards when a literal cannot be represented.
- **prefer**: Verb in configuration comments that states the chosen option over an alternative, such as allowlists over fingerprints.
- **preload**: Loading a resource before it is needed, a browser or build hint that appears here only as a glossary headword.
- **presence**: Whether an attribute or value is present, which the react jsx-curly-brace-presence rule checks for JSX braces.
- **presentation**: The display layer of the workspace, held in projects/common/presentation, whose components and hooks render the interface.
- **preset**: A bundled default configuration that a tool extends, such as an ESLint preset whose severity this config downgrades.
- **prevent**: Verb for a lint rule blocking a pattern, as the unicorn prevent-abbreviations rule blocks short names.
- **prop**: Abbreviation of property that the cspell flag list bans, while the postcss node.prop name stays exempt.
- **prose**: Running natural-language text as opposed to code, which the spelling and markdown rules here check.
- **proxy**: An intermediary that forwards requests, such as the Verdaccio setting that proxies missing packages to npm.
- **px**: Abbreviation of pixel, the CSS unit whose utility-class forms like px-4 the cspell exemptions allow.
- **pyproject**: The Python project metadata file, pyproject.toml, which this configuration names for hatchling and lint tools.
- **re**: Prefix meaning again, as in re-export, re-run, and re-splice, used throughout configuration comments.
- **ready**: Describes a service able to serve requests, as in the readyz probe and the signalReady call in this configuration.
- **rel**: Abbreviation allowed through the prevent-abbreviations allow list since TanStack Router meta API names its link property this way.
- **relay**: Cursor-based pagination pattern for GraphQL lists which the nestjs-graphql-application template implements via nestjs-graphql-connection.
- **replacement**: Abbreviation-to-expansion pairs in the ESLint prevent-abbreviations map, such as tmp mapped to temporary.
- **reporter**: Output formatter that a test or lint tool writes results through, such as vitest coverage text, json-summary, lcov, and html reporters.
- **reproducible**: Hatch build flag set true in the Jupyter notebook template pyproject.toml so wheel builds come out repeatable.
- **restoration**: Unused in this folder since no configuration here restores files or state, so the word names nothing it checks.
- **restrict**: Suffix of the callidescope-restrict target, which traces only the callables a project owns and gates them against its own limits.
- **reverse**: The unicorn lint rule no-array-reverse set to error, which forbids mutating reverse calls in favor of toReversed.
- **rewrite**: Overwrite a generated README block in place, which release commits do on main so pull requests never conflict over it.
- **role**: The jsx-a11y ARIA attribute rules in oxlint, which check that elements carry valid roles and required attributes.
- **route**: A TanStack Router file under src/routes that the generated routeTree.gen.ts registers, as the tanstack-application template scaffolds it.
- **runtime**: Execution-time vocabulary that the coinagerie common-words list leaves unglossed, since no project defines it differently.
- **same**: Word used across comments in this folder to say two settings must stay identical, such as tools reading the same marker file.
- **save**: Name prefix of the generated save function in the tanstack-server-function template, which wraps a validated write.
- **scalar**: A YAML value style that the yml plain-scalar rule in ESLint forces for the YAML files this folder lints.
- **screen**: Testing Library query object imported by the React component test template to find rendered elements.
- **scroll**: Unused in this folder since no rule or target here configures scrolling, so the word names nothing it checks.
- **selector**: Config key naming which code or projects a rule applies to, such as codometer comment selectors and codependix project selectors.
- **self**: Edge from a node back to itself, which codependix reports as a cycle, while the no-self-compare rule bans comparing a value with itself.
- **severity**: Threshold level set to style for Shellcheck and to warn or error on codometer limits, deciding how a finding is reported.
- **shadow**: Name-hiding check set to error in typescript-eslint so a variable may not reuse an outer scope name.
- **shorthand**: Object literal form that writes a property whose key matches its value once, enforced by ESLint object-shorthand set to always.
- **sibling**: A package at the same layer as another, which codependix rules keep from importing one another across the conformetry spine.
- **side**: Effect beyond a call return value, which the typescript-eslint no-import-type-side-effects rule keeps out of type-only imports.
- **since**: Conjunction in config comments giving the reason a rule applies, such as breadth counting callables that nothing calls.
- **single**: Describes one argument or command, such as the roughly 1 KB per-argument shell limit that the pre-commit hook works around.
- **slash**: Path separator character which cspell keeps spell-checking, so each slash-delimited path segment still gets checked.
- **space**: Agent scratch directory such as .superpowers that is gitignored and skipped by ESLint because it is never source.
- **sparse**: Lint rule set to error in oxlint forbidding array literals with holes in them.
- **splice**: Codependix step that rewrites generated graph blocks into every README, which a rename must run in the same commit.
- **spread**: Syntax copying one object properties into another literal, which callidescope config uses so readers see each limit.
- **standalone**: A template or CLI kind that generates a self-contained project, such as the Python notebook or NestJS nest-commander CLI templates.
- **statistic**: A codometer custom measurement declared with its own label in codometer.config.ts and reported under the custom namespace.
- **str**: Allowed abbreviation for string, exempted from the ESLint prevent-abbreviations rule since the config treats string as reserved.
- **suggest**: Unused in this folder since no rule or target here offers suggestions, so the word names nothing configured.
- **syntax**: Gitignore-style pattern language that .callidescopeignore and .codometerignore use to list paths they skip.
- **tab**: YAML rule forbidding indentation with tab characters, so every YAML file in this folder indents with spaces.
- **take**: Query-builder method limiting how many rows a query returns, mocked in the NestJS GraphQL test template.
- **testid**: Test selector attribute that each generated React component sets to its kebab-case name, so unit tests can find it.
- **testpath**: Unused in this folder since no test-path option is set here, so the word names nothing configured.
- **threshold**: Duplication ceiling of 6 in both jscpd and fallow duplicate-code settings, above which a run fails.
- **through**: Preposition in comments describing a command route, such as a husky hook invoked directly rather than through Nx.
- **tmp**: Ignored temporary directory name listed in oxfmtignore and expanded by the ESLint prevent-abbreviations map to temporary.
- **toggle**: DOM class method which the unicorn prefer-classlist-toggle rule requires over separate add and remove calls.
- **toml**: Configuration file format used by pyproject.toml, gitleaks.toml, and squawk.toml, each read directly by its tool.
- **top**: Outermost module scope where the prefer-top-level-await rule is turned off for CJS config files that cannot use await.
- **trace**: Callidescope step that follows calls from entry points to record each stack depth and each callable breadth.
- **trail**: Unused in this folder since the word appears only in the glossary list and names no rule, target, or config here.
- **transition**: Unused in this folder since no rule or target here configures CSS transitions or animation timing, so it names nothing.
- **triple**: Lint rule set to error in oxlint and TypeScript-ESLint forbidding three-slash directive comments that reference other files.
- **trunc**: Oxlint rule set to error requiring the Math method for dropping fractions instead of bitwise shortcuts such as OR zero.
- **txt**: Plain-text file extension for CSpell word lists under the cspell folder, such as astronomy.txt and ics.txt, loaded by path.
- **unbind**: Unused in this folder since no event listener or subscription is unbound here, so the word names nothing configured.
- **undeclared**: Lacking a declaration in codebase-structure.json, so the folder-structure rule rejects the markdown file or directory.
- **unowned**: A project tagged workspace-unowned in project.json, whose files no Nx project claims, so the workspace root check covers them.
- **unreachable**: Code no entry point reaches, which fallow module-graph analysis treats as dead, so an import here keeps it live.
- **unreadable**: Describes a fixture project kept hard to parse on purpose, which the callidescope ignore list excludes from tracing.
- **unresolved**: Fallow rule set to error, failing on an import whose target cannot be found, while ESLint import no-unresolved is off.
- **unsupported**: Oxlint lacks an equivalent for 156 ESLint rules, which the oxlint config skips rather than maps.
- **validator**: Checker for the files of one language in conformetry, or the validator call that TanStack server-function templates attach to inputs.
- **vendored**: Third-party code copied into the repository, such as shadcn components and skill content, which codometer and oxlint skip.
- **venv**: Python virtual environment directory named .venv, which oxfmt and oxlint ignore so they never lint installed packages.
- **verb**: Grammatical form a log message must use after its subject, present progressive or past tense, checked by the logger convention rule.
- **violation**: Fallow finding set to warn for an import that crosses a module boundary the layering forbids.
- **vue**: Frontend framework whose single-file components the Prettier config formats, including indentation inside script and style tags.
- **wheel**: Packaged Python distribution file that Hatch builds, configured under the Jupyter template pyproject.toml build targets.
- **whitelist**: Vulture allow-list file at the workspace root, naming Python utilities outside Nx projects that look unused but are kept.
- **whitespace**: Conventional-commit type for formatting-only changes, described in conventional.config.cjs as whitespace or code structure changes with no semantic effect.
- **width**: Viewport meta value in the TanStack root route, set to device-width so pages scale properly on phones.

<!-- coinagerie:end -->
