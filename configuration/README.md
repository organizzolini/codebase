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
- **abusive**: Part of the unicorn rule no-abusive-eslint-disable, which forbids blanket lint-suppression comments across the lint configs here.
- **activedescendant**: An ARIA attribute name whose jsx-a11y rule aria-activedescendant-has-tabindex is enforced by the oxlint config here.
- **adjacent**: The TypeScript rule adjacent-overload-signatures, which the lint configs enable so overload signatures stay grouped together.
- **adjective**: A part-of-speech key in the local wink-lemmatizer type declarations, which types the lemmatizer function for adjectives.
- **alert**: The ESLint and oxlint rule no-alert, which bans browser alert dialogs in the web code the lint configs check.
- **allowlist**: An exemption list passed to the unicorn prevent-abbreviations rule, letting args and charSet stay despite the abbreviation ban.
- **alone**: Plain English word that config comments use for a file or count taken on its own, such as a standalone type import.
- **alt**: Short for alternative text, the image description attribute that the markdown and jsx-a11y lint rules require here.
- **ambiguous**: The jsx-a11y rule anchor-ambiguous-text, which this config turns off, so link text is never flagged as ambiguous.
- **an**: Indefinite article that config comments use constantly, a stopword rather than a term of this project's vocabulary.
- **anchor**: A named block marker in a README that codependix fills with its generated dependency graph, so the rendered diagram stays current.
- **anonymous**: The unicorn rule no-anonymous-default-export, which forbids exporting an unnamed default value from TypeScript sources.
- **archi**: A reporter key in the dependency-cruiser config that groups modules into collapsed architecture boxes for its rendered diagram.
- **aria**: Prefix of the accessibility attributes, such as aria-props and aria-proptypes, that the oxlint jsx-a11y rules validate.
- **around**: Ordinary English preposition that comments use for code around a route or callable, carrying no project-specific meaning here.
- **arr**: A banned abbreviation for array, which the naming rule rewrites to the full word, so identifiers spell it out.
- **arrow**: The arrow-function style rules, such as prefer-arrow-callback, which the lint configs enforce for callbacks.
- **assignment**: The TypeScript rule family for checking value handoffs, such as no-unsafe-assignment, set to error, warn, or off per scope.
- **associate**: The jsx-a11y rule label-has-associated-control, which requires each form label to be tied to its control here.
- **attribution**: The commit message trailer that credits a co-author, such as Co-authored-by, which commitlint accepts in a message body.
- **atx**: Heading syntax of hash-prefixed lines, which the markdown lint rule no-missing-atx-heading-space checks for a space after the hashes.
- **autocomplete**: A settings scope named in comments of the conventional config, and the jsx-a11y autocomplete-valid rule the lint configs enable.
- **autofocus**: The jsx-a11y rule no-autofocus, which the oxlint config enables so forms do not steal focus on page load.
- **avoid**: Ordinary verb that comments use for patterns the codebase deliberately steers clear of, such as avoid-negated-conditions in ShellCheck.
- **backend**: A server-side application template or build backend, such as hatchling for Python packages and NestJS GraphQL services.
- **background**: The expansion the naming rule accepts in place of bg, so identifiers spell out background in full.
- **backreference**: The regex rule no-useless-backreference, which the oxlint config enables so a backreference that can never match is flagged.
- **ban**: The verb the spelling and lint configs use for forbidding a term, as in banned abbreviations or ban-ts-comment.
- **band**: Appears only inside the word bandit, the Python security scanner named in the Python project templates.
- **bare**: Unadorned, as in a bare root that routes render under in the TanStack template tests, with no wrapping layout.
- **baseline**: Fallow reporting keys, deadCodeBaseline and healthBaseline, set to null so no existing findings are grandfathered.
- **beside**: Ordinary English preposition meaning next to, used in config comments to place a file, a config, or a type next to its neighbour.
- **bg**: A banned abbreviation for background, flagged by cspell and rewritten to background by the naming rule.
- **binary**: A compiled executable that a git hook runs instead of a slower Node script, which starts far more slowly.
- **blob**: A GitHub URL path segment in the markdownlint config's rules link, and the unicorn rule prefer-blob-reading-methods.
- **bof**: Beginning of file, the fragment of maxBOF, which the no-multiple-empty-lines rule uses to cap blank lines at the top.
- **bool**: A banned abbreviation for boolean, which the naming rule rewrites to boolean, and the git config --bool flag.
- **bot**: Author-name pattern for automated accounts, as in fallow's ownership botPatterns that keep such committers out of code ownership.
- **boundary**: The layer rule that codependix checks on every built graph, forbidding imports the workspace declares out of bounds.
- **bracket**: Square-brace property access, which the tsconfig noPropertyAccessFromIndexSignature option forces for index signatures instead of dot access.
- **breadth**: The number of distinct callables a single callable calls directly, which the maximumBreadth limit gates and the breadth command prints.
- **browser**: The browser runtime target that lint and bundler configs set, which keeps browser globals and bundled code out of Node.
- **budget**: The comment-length cap codometer enforces per language, such as the TypeScript comment budget in the codometer config.
- **buildable**: Adjective for code that a build can compile, such as the knip note that skips a profile page with nothing buildable.
- **bullet**: A glossary entry line of the form dash, bold word, colon, definition, which coinagerie parses to read headwords.
- **bundle**: The output a bundler such as Vite emits for a package, which the vite library config can inline packages into.
- **callee**: A function that a call expression invokes, which callidescope's excludeCallees pattern can hide from the call-stack trace.
- **camel**: Naming style joining words with capitals, as in nameCamelCase placeholders that conformetry templates fill in.
- **capitalisation**: The SQLFluff rule family that sets how keywords and identifiers are capitalised, configured in pyproject for SQL files.
- **caption**: The jsx-a11y rule media-has-caption, which the oxlint config enables so video and audio elements carry captions.
- **carry**: Ordinary verb in config comments meaning to hold or transmit, as in a README that carries badges or a flag that carries values.
- **category**: A grouping of tool targets, as in the README table Group column, though the word itself appears nowhere else in this project's files.
- **chain**: The ordered dependency path from core through configuration and analyzers to the CLI, which codependix enforces one way.
- **circular**: The dependency-cruiser rule no-circular, which forbids import cycles between modules so the graph stays acyclic.
- **classlist**: The unicorn rule prefer-classlist-toggle, which the oxlint config enables to use classList.toggle over manual class edits.
- **clause**: A part of the license-checker command in project.json, where the onlyAllow clause lists the permitted licenses.
- **click**: The jsx-a11y rule click-events-have-key-events, which the oxlint config enables so clickable elements also handle keyboard input.
- **clone**: The unicorn rules consistent-date-clone and prefer-structured-clone, which the oxlint config enables to copy values correctly.
- **co**: A two-letter fragment that appears in the Co-authored-by trailer and similar commit footers, not a project term.
- **coalesce**: Nullish-fallback operator concept, which no config here names, so the word carries only its everyday TypeScript meaning.
- **coerce**: The Zod z.coerce helper that converts environment strings to numbers, as in the NestJS constants template port variables.
- **coercion**: Implicit type conversion, which the no-implicit-coercion rule forbids except for the double negation boolean idiom allowed here.
- **cognitive**: The fallow maxCognitive limit, which caps how hard a function's control flow is to read, set to twelve here.
- **col**: A banned abbreviation for column, which the naming rule rewrites to column and cspell flags in identifiers and prose.
- **collapse**: The reporter option collapsePattern, which folds matching paths into a single node in dependency-cruiser and graph diagrams.
- **colon**: The separator in key-value syntax, as in the yml key-spacing afterColon option and yamllint's colons rule, both set here.
- **comma**: The separator in lists, enforced by the jsonc comma-dangle rule, which decides whether trailing commas are always or never used.
- **commonj**: The require-based module format, which the oxlint and dependency-cruiser configs treat differently from ES modules.
- **comp**: A fragment of component, as in the oxlint react self-closing-comp rule for self-closing React components.
- **comparison**: Contrast drawn between two layer orders in codependix rule text, such as the coinagerie chain set against the conformetry spine.
- **compilation**: The compile step, as in the tsPreCompilationDeps dependency-cruiser option that counts type-only imports as real dependencies.
- **complexity**: The ESLint limit on branching per function, set to a maximum of eight for authored web application files.
- **compress**: Gzip-style size reduction, used in the reportCompressedSize Vite option and as codometer's gzip compression setting.
- **compression**: The codometer setting that names gzip as the algorithm for measuring compressed size of each file.
- **concat**: The ESLint rule no-useless-concat, which flags string concatenation of two literals that could be one string.
- **cond**: A fragment of condition, as in no-cond-assign, the rule that forbids assignments inside conditions in the oxlint config.
- **condition**: The test that a branch or package export entry checks, as in no-unnecessary-condition, which ESLint switches off in one block.
- **confuse**: Ordinary verb for misleading a reader, which no configuration file here uses, so it carries only its everyday meaning.
- **consistent**: The ESLint and oxlint consistent rule family, such as consistent-type-imports, which enforce one style for a construct.
- **convention**: A codebase-wide coding rule the lint configs enforce, such as the Logger Convention that LoggerService also enforces at runtime.
- **cookie**: The unicorn rule no-document-cookie, which the oxlint config enables so code never writes browser cookies directly.
- **correctness**: The oxlint rule category for fundamental bug checks, which this config switches off and then re-enables rule by rule.
- **crap**: A risk score combining complexity with test coverage, which fallow caps with maxCrap 16 and a refactor band.
- **ctx**: A banned abbreviation for context, rejected as a file or folder name by the codebase-structure pattern and the naming rule.
- **cur**: A banned abbreviation for current, which the naming rule rewrites to current and cspell flags in identifiers.
- **curly**: The ESLint block rule set to all, which requires braces on every if, else, and loop body even when one statement.
- **curr**: A banned abbreviation for current, the same as cur, which the naming rule rewrites to current in identifiers.
- **cycle**: A loop of dependencies that the codependix and dependency-cruiser rules forbid, so projects must not depend on each other circularly.
- **cyclomatic**: The fallow maxCyclomatic limit, which caps the number of independent paths through a function, set to eight here.
- **danger**: The React rule no-danger-with-children, which the oxlint config enables to forbid combining dangerous HTML injection with child elements.
- **dangle**: Fragment of comma-dangle, the jsonc rule that sets trailing-comma placement, set never in one block and always-multiline in another.
- **dataset**: The unicorn rule prefer-dom-node-dataset, which the oxlint config enables so code reads data-attributes through dataset.
- **db**: A banned abbreviation for database, which the naming rule rewrites to database and cspell flags in prose.
- **decimal**: A regex escape of a non-octal number, governed by no-nonoctal-decimal-escape, which the oxlint config enables in each block.
- **decl**: A banned abbreviation for declaration, rewritten to declaration by the naming rule that lint configs enforce across identifiers.
- **decode**: Reverses the Base64 cursor encoding in the NestJS GraphQL template utilities, turning an opaque cursor back into its offset or id.
- **delegate**: Hands work to another function, as in the TanStack template comment that server functions delegate their plain logic to utilities.
- **dep**: A fragment of dependency in names like not-to-dev-dep, the dependency-cruiser rule forbidding dev dependencies in shipped code.
- **destructuring**: The unicorn rule no-unreadable-array-destructuring, which the oxlint config enables so array destructuring stays readable.
- **development**: The full word the naming rule expects in place of dev, as in skill names like finishing-a-development-branch.
- **dialect**: The SQL variant the SQLFluff linter parses against, set to postgres in pyproject for the SQL files it checks.
- **dictionary**: A cspell word list that the spell checker loads by name, configured under dictionaries in cspell.config.yaml.
- **digit**: An ordinary English word, not a color name, so the cspell config keeps it checked rather than exempting it.
- **direct**: Immediate rather than transitive, as in the pnpm workspace glob matching every direct child folder of projects.
- **direction**: The way a graph traversal or rule points, as in the codependix chain pointing one way and the oxlint for-direction rule.
- **discovery**: The step that finds which files and projects a tool should scan, as in callidescope's ignore-file notes on discovery.
- **distract**: Appears only inside the jsx-a11y rule no-distracting-elements, which the oxlint config enables against blink and marquee.
- **div**: The HTML block container, which the React component file templates use as the top-level wrapper for generated components.
- **dot**: A Graphviz output option in dependency-cruiser, whose collapse pattern folds node_modules packages into single nodes.
- **drill**: Fragment of prop-drilling, the pattern of passing props through many component layers that the fallow rule warns about.
- **driver**: Runtime adapter plugged into a framework, such as the NestJS Apollo driver in templates and the TypeORM postgres driver.
- **dupe**: A fragment of duplicate, as in the oxlint no-dupe-keys family, which catches repeated class members, else-ifs, and object keys.
- **dynamic**: Computed at runtime, as in the no-dynamic-delete rule, which oxlint and ESLint enable to forbid deleting properties.
- **ecma**: Prefix of ecmaFeatures, the ESLint parser option that switches on JSX and language syntax per ECMAScript version.
- **edge1**: A test-fixture variable name for the first graph edge in the NestJS GraphQL pagination unit tests.
- **edge2**: Second pagination test fixture, built with a cursor, and paired with edge1 in the same NestJS GraphQL unit tests.
- **effect**: An ordinary word here, as in the conventional config note that formatting changes have no semantic effect on releases.
- **el**: A banned abbreviation for element, which the naming rule rewrites to element and cspell flags in identifiers.
- **element**: A single entry of an array, such as one line of JSON that oxfmt collapses where JSON.stringify would split it.
- **embed**: Verb for a banned term sitting inside a longer identifier, which the cspell config lists separately so it is still caught.
- **emphasis**: Bold or italic markup governed by markdown lint rules such as no-space-in-emphasis and MD049 underscore style.
- **enhance**: Fragment of enhancedResolveOptions, the dependency-cruiser resolver setting that tunes module resolution for imports.
- **eof**: End-of-file, the fragment of maxEOF, which caps blank lines at the end of a file in the no-multiple-empty-lines rule.
- **eqeqeq**: The ESLint and oxlint rule eqeqeq, set to always, which forces strict equality with === and !== comparisons.
- **equality**: The act of comparing two values for sameness, which vitest and unicorn lint rules steer toward dedicated matchers.
- **es**: The ECMAScript target and module-format token, as in target es2022 and formats es for the library build.
- **es2020**: The ECMAScript 2020 environment flag set true in the oxlint config, enabling that version's built-in globals for linting.
- **es2026**: The ECMAScript 2026 environment flag set true in the oxlint config, enabling that version's built-in globals for linting.
- **evaluate**: A verb the Jupyter template comments use for Pydantic resolving annotations at class creation, before model_rebuild runs.
- **ex**: A fragment of exception, as in no-ex-assign, the oxlint rule forbidding reassignment of a catch parameter.
- **exact**: Stem of exactly, as in ignore-file comments saying a file is kept exactly as written, a plain English fragment here.
- **exclamation**: The commitlint rule subject-exclamation-mark, set to zero so a breaking-change bang in the subject is not enforced.
- **exempt**: Excused from a rule, as in the ESLint comment exempting the exports subtree from sorting so package condition order holds.
- **exhaustive**: Covering every case, as in switch-exhaustiveness-check and react-hooks exhaustive-deps, both enforced by the lint configs here.
- **exhaustiveness**: The lint check that every switch covers all union members, switch-exhaustiveness-check, set to error in the ESLint config.
- **existence**: Whether a value is present, as in the unicorn consistent-existence-index-check rule that the oxlint config enables.
- **explicit**: Stated outright rather than implied, as in the limits object callidescope configs declare beside their spread defaults.
- **extraneous**: The TypeScript rule no-extraneous-class, which the lint configs enable to forbid classes that hold only static members.
- **faker**: Test-data library, @faker-js/faker, that NestJS module templates call inside factory files to generate fake records.
- **fallthrough**: The no-fallthrough rule, which the oxlint config enables to stop a switch case running into the next without a break.
- **falsy**: Fragment of toBeFalsy, the vitest matcher named in the ESLint test rules, so it matches no standalone word here.
- **fence**: Substring of fenced code blocks, as in markdownlint's MD046 style, which requires fences rather than indentation.
- **filetype**: Substring of enableFiletypes, the cspell setting that lists which file types the spell checker reads.
- **fishery**: Test-fixture factory library imported beside faker in NestJS module templates to build typed fake objects.
- **flake8**: The Ruff lint section name flake8-type-checking in the Jupyter template pyproject, which mirrors Flake8 plugin names.
- **float**: Substring of floating, as in the no-floating-promises rule, which the ESLint config enables in most blocks for unawaited promises.
- **floor**: A lower bound, as in the lint-staged worker count held within a floor of four, and the shellcheck style-severity floor.
- **focus**: Substring of focused, as in vitest no-focused-tests and jsx-a11y no-autofocus, two rules that both block focus misuse.
- **follow**: Ordinary verb in comments meaning to come after or be bound by, as in shellcheck following source directives.
- **footer**: The trailing block of a commit message, which the commitlint rules here restrict to Co-authored-by lines only.
- **forbid**: A codependix boundary rule kind that disallows matching dependency edges outright, instead of allowing them under a selector.
- **fraction**: The digits after a decimal point in a number literal, which the unicorn no-zero-fractions rule rejects when they are all zeros.
- **fragment**: The part of a URL after the hash, which the markdown no-missing-link-fragments rule checks against a heading anchor.
- **func**: Shorthand for function, counted as a bare name beside constructor in a configuration test fixture rather than spelled out.
- **further**: Adjective in conformetry template prose naming an additional instance nested inside an existing folder, such as a hook beside its siblings.
- **gap**: A missing lexical slot that the lexico gap discovery CLI searches English for, the subject of its gap-finding tooling.
- **general**: The default limit or rule that applies everywhere before a more specific language or path override replaces it.
- **generation**: The act of writing files from conformetry templates, and the output a generator run leaves in a project folder.
- **generic**: Applying across every layer or project without naming one, as the boundary rules keyed on layer tags do here.
- **glossary**: The root GLOSSARY.md and the per-project README blocks that coinagerie writes, each listing headwords with their definitions.
- **go**: Plain English verb in fallow comments about what a dependency goes on to import, not the Go language.
- **h1**: The HTML top-level heading tag, which conformetry route templates render once inside a section named after the route.
- **hatch**: The Python build backend named hatchling, whose wheel target the pyproject.toml files here configure for packaging.
- **hcl**: HashiCorp Configuration Language, whose reserved keywords the coinagerie configuration lists among the words to exclude.
- **here**: Adverb in configuration comments and docs pointing at this folder or file, where a tool's setting or rule applies.
- **heritage**: The extends and implements clauses of a class declaration, which the perfectionist ESLint plugin sorts alphabetically here.
- **hex**: Abbreviation of hexadecimal, which the cspell flag list bans and the coinagerie fold map expands to its full spelling.
- **hexadecimal**: Base-16 number notation, which the cspell exemptions here allow for color literals and generated token hashes.
- **higher**: Comparative in codometer limit prose, meaning a project's own number that exceeds a workspace default wins over it.
- **history**: The recorded past of a committed report or commit, kept for comparison with a fresh run, as the callidescope reports do here.
- **hold**: Verb in configuration prose meaning a file or folder keeps content, such as stale reports or unexpanded mustache placeholders.
- **html**: The markup language of web pages, which conformetry templates and the lint rules here generate and check for document structure.
- **hydrate**: The step that attaches React to server-rendered markup, the hydrateRoot API that the React lint setup here covers.
- **hyphen**: The dash joining words in a compound name, which the naming and lint rules here treat as a separator, not a word.
- **identical**: Describes two items that match exactly, such as duplicate test titles that the vitest no-identical-title rule rejects.
- **idx**: Abbreviation of index that the cspell flag list bans, its expansion mapped by the coinagerie fold map.
- **iframe**: The embedded browsing context element, which the jsx-a11y rules require to carry a title for assistive technology.
- **iife**: An immediately invoked function expression, a wrapper pattern that the unicorn no-unreadable-iife rule flags as hard to read.
- **img**: The HTML image element tag, which the cspell exemption list allows as an intrinsic React element type name.
- **immediate**: Describes a mutation made right after a value is created, which the unicorn no-immediate-mutation rule flags.
- **increment**: A one-step rise in heading level, which the markdown heading-increment rule checks so levels never skip.
- **incremental**: Describes a run that reuses earlier results instead of starting over, such as the ci-incremental gitleaks target here.
- **inferrable**: Describes a type annotation the compiler could infer on its own, which the typescript-eslint no-inferrable-types rule flags.
- **infinity**: The global numeric value for unbounded size, used here as an open upper bound such as a range end.
- **ini**: The INI configuration file format, a key-value syntax that appears in this project only as a glossary headword.
- **inject**: Verb for supplying a dependency through a constructor, such as NestJS injecting LoggerService into a project's providers.
- **inlined**: Describes a package whose source is bundled into its consumer's output rather than installed, such as the observability logger.
- **interaction**: A user's exchange with a rendered interface, which this project's configuration mentions only in its glossary headword.
- **internal**: Describes code kept private to its own package or folder, which the boundary and export rules here protect.
- **interop**: Compatibility seam between CommonJS and ES modules, which the esModuleInterop setting enables for the workspace here.
- **intersection**: A type formed by combining several types at once, which the perfectionist plugin sorts within a sort rule here.
- **invalidate**: Verb for discarding cached router data so it reloads, as the router call after a server function does here.
- **ipynb**: The Jupyter notebook file extension, which the Python lint and conformetry notebook templates here cover.
- **irregular**: Describes whitespace characters that look like spaces but are not, which the no-irregular-whitespace rule rejects.
- **isnan**: The global function that tests for NaN, which the use-isnan lint rule requires in place of comparing to NaN.
- **jupyter**: The notebook environment whose ipynb files the Python conformetry notebook template and its linters here cover.
- **kebab**: Lowercase words joined with hyphens, the naming style that folder rules and the nameKebabCase template placeholder require.
- **keyboard**: Input device and event family, which the jsx-a11y and unicorn rules check so interactive elements also respond to keys.
- **land**: Verb for a change reaching a spot a tool can act on, such as a hand-edited file with nothing to land on.
- **lang**: The lang attribute on the root HTML element, set to en so screen readers and translators know the page language.
- **logic**: Code that makes decisions and transforms data, which templates here keep apart from wiring and markup.
- **logical**: Describes the && and || operators, which the unicorn prefer-logical-operator rule favors over a ternary here.
- **lone**: Describes a bare block with no control statement, which the no-lone-blocks rule rejects as needless nesting.
- **lonely**: Describes an if nested alone inside an else, which the unicorn no-lonely-if rule asks to be flattened.
- **longhand**: Verbose CSS property form, such as separate margin sides, which the stylelint redundant-longhand rule asks to shorten.
- **loss**: Precision lost when a numeric literal cannot be stored exactly, which the no-loss-of-precision rule flags.
- **lowercase**: Describes all-small spelling, which the language identifiers and folded glossary headwords here use, not display names.
- **magic**: Describes an unexplained literal value that the constants-file convention forbids inline in favor of a named constant.
- **many**: Quantity word in prose, such as run-many commands that execute one target across several projects at once.
- **mark**: The exclamation point in a commit subject marking a breaking change, which the commitlint rule here switches off.
- **marker**: A tag that delimits a managed region of a file, such as the coinagerie start and end comments in a README.
- **maxage**: The cache lifetime setting, named as a max-age field or a cacheMaxAgeDays value in this configuration.
- **md013**: Markdownlint rule ID for line length, which this configuration disables as too restrictive for technical docs.
- **md024**: Markdownlint rule ID for duplicate headings, which this configuration allows across different sections.
- **md033**: Markdownlint rule ID for inline HTML, which this configuration relaxes where a summary's bold text needs it.
- **md034**: Markdownlint rule ID for bare URLs, which this configuration allows without angle brackets around them.
- **md041**: Markdownlint rule ID requiring a top-level heading first, which this configuration disables for flexibility.
- **md046**: Markdownlint rule ID for code block style, enforcing fenced blocks rather than indented ones in documents here.
- **md049**: Markdownlint rule ID for emphasis style, enforcing underscores to match the output of oxfmt and Prettier.
- **md050**: Markdownlint rule ID for strong style, enforcing asterisks for bold text in this configuration.
- **meanderaw**: The name of a workspace project under projects/meanderaw, whose CLI output folder the configuration excludes from checks.
- **meaningless**: Describes an operation with no effect, such as a void operator that the typescript-eslint rule rejects.
- **mermaid**: Diagram markup language that codependix and callidescope write as fenced blocks inside committed Markdown reports.
- **mislead**: Describes text or code that suggests a wrong meaning, such as the no-misleading-character-class lint rule.
- **misuse**: Describes a value used in a context it was not built for, such as the typescript-eslint no-misused-promises rule.
- **mix**: Verb for combining settings or kinds of thing, appearing in this configuration only as ordinary English prose.
- **modern**: Describes current language syntax, which this lint configuration cites when it enables patterns from recent JavaScript.
- **mount**: Verb for attaching a React root to a DOM container, which a whole html document cannot do inside the app root.
- **mouse**: Pointer input family such as mouse events, which the jsx-a11y rule pairs with keyboard equivalents.
- **multiple**: Describes more than one of a thing, such as the no-multiple-empty-lines YAML rule limiting consecutive blank lines.
- **mutation**: A write that changes existing state, covering GraphQL Mutation resolvers and the direct-mutation lint rules here.
- **native**: Built into the language or runtime rather than a library, such as native ESLint support or built-in constructors.
- **natural**: Sort mode that compares embedded numbers by value, which the perfectionist and sort rules here set for entries.
- **nav**: Abbreviation of navigation that the cspell flag list bans, while the HTML nav element stays exempt.
- **navigation**: Moving between routes or pages, which a route's loader and head run exactly as a navigation would.
- **neg**: Shorthand for negative, as in the no-compare-neg-zero rule banning the comparison of negative zero.
- **negate**: Verb for inverting a condition, which the unicorn no-negated-condition rule asks authors to rewrite positively.
- **negation**: The logical not operator, or the act of inverting a condition, which the no-unsafe-negation rule checks.
- **negative**: Describes a value below zero, such as the negative offsets that the encoder test clamps to zero.
- **newline**: A line-break character, which the partitionByNewLine sort option and the newlines-between rule split entries on.
- **nonconstructor**: A built-in function that must not be called with new, which the no-new-native-nonconstructor rule rejects.
- **noninteractive**: Describes an element that cannot take focus or input, which the jsx-a11y tabindex rule checks on plain elements.
- **nonoctal**: Describes a decimal escape in a string that is not an octal, which the no-nonoctal-decimal-escape rule rejects.
- **notebook**: An interactive document of code cells, which a conformetry template and the Python linters here cover.
- **noun**: Part of speech whose singular and plural forms the coinagerie singularizer folds, as in its noun function type.
- **npmj**: Lemmatizer fragment of npmjs, the npm registry host name, cut short of its final letter.
- **nullish**: Describes null-or-undefined checks, such as the ?? operator, which the prefer-nullish-coalescing rule here switches off.
- **num**: Abbreviation of number that the cspell flag list bans, while the Universal Dependencies NUM tag stays exempt.
- **numeric**: Describes number-valued text, such as long numeric literals whose separators the readability rule preserves.
- **nursery**: Early-stage lint rule group that this configuration switches off until its rules stabilize.
- **obj**: Abbreviation of object that the cspell flag list bans, with the no-obj-calls rule naming the banned global.
- **occurrence**: One repeat of a code block that fallow's duplicate detection counts against its minOccurrences threshold of two.
- **octal**: Base-8 number notation, which the YAML forbid-implicit-octal and forbid-explicit-octal rules here reject.
- **offline**: Describes running without a network, such as the Verdaccio setting that allows publishing while offline.
- **operator**: Symbol performing an action on operands, such as the void operator that a typescript-eslint rule rejects.
- **origin**: The scheme, host, and port identifying a web page, such as the targetOrigin argument that the unicorn rule constrains.
- **orphan**: A file or project with no caller or importer, which callidescope reports as an orphan root and codependix detects.
- **over**: Preposition in comments and docs meaning across a set of files, or a destination taking over a block.
- **overload**: A function signature declared more than once with differing parameters, which the adjacent-overload rule keeps grouped.
- **ownership**: Which project or tool is responsible for a file or setting, as recorded in the fallow ownership configuration.
- **pad**: Adds empty space around content, a word that appears here only as a glossary headword, not in any rule.
- **paginate**: Verb for splitting a list into fixed-size pages, as the paginateArray helper in this workspace does.
- **parallelism**: The number of workers allowed to run at once, such as the analysis parallelism setting and the local parallelism helper.
- **paren**: Shorthand for parenthesis, as in the arrowParens option deciding whether a lone argument keeps its parentheses.
- **partition**: Splitting a list into groups, as the partitionByNewLine and partitionByComment sort options do in perfectionist rules.
- **pascal**: Capitalized-word naming style, with every word starting upper case, which the jsx-pascal-case rule enforces for React component names.
- **payload**: The data a message or report carries, which the metric rules here exclude when counting prose words.
- **pedantic**: The strictest rule group of a linter, which this configuration switches off rather than enforce.
- **persistence**: Storage that outlives a single run, named as the persistence entry in a configuration block here.
- **pin**: Verb for fixing a tool to an exact version, as the inputs here do for shellcheck through pyproject.toml and uv.lock.
- **pixel**: The CSS length unit px, which the cspell exemption list allows in utility classes such as px-4.
- **pkg**: Abbreviation of package that the cspell flag list bans, with the coinagerie fold map expanding it to package.
- **playground**: An interactive sandbox page, such as the GraphQL Playground section a project README describes for its API.
- **policy**: A governing set of rules, such as the PostgreSQL policy and function names the naming configuration quotes.
- **poll**: Repeated check until a condition holds, which the vitest require-awaited-expect-poll rule polices in tests.
- **pr**: Abbreviation of pull request, used in CI triggers and PR-comment target names such as pr-comment-github.
- **pragma**: A special comment that tells a tool how to treat a file, such as the Prettier format pragma.
- **precision**: Exactness of a numeric value, which the no-loss-of-precision rule guards when a literal cannot be represented.
- **prefer**: Verb in configuration comments that states the chosen option over an alternative, such as allowlists over fingerprints.
- **preload**: Loading a resource before it is needed, a browser or build hint that appears here only as a glossary headword.
- **prelude**: The part of a CSS at-rule before its block, which the stylelint at-rule-prelude-no-invalid rule checks.
- **presence**: Whether an attribute or value is present, which the react jsx-curly-brace-presence rule checks for JSX braces.
- **presentation**: The display layer of the workspace, held in projects/common/presentation, whose components and hooks render the interface.
- **preset**: A bundled default configuration that a tool extends, such as an ESLint preset whose severity this config downgrades.
- **prevent**: Verb for a lint rule blocking a pattern, as the unicorn prevent-abbreviations rule blocks short names.
- **prod**: Abbreviation of production, as in a build configuration that sets the production flag to true.
- **prop**: Abbreviation of property that the cspell flag list bans, while the postcss node.prop name stays exempt.
- **proptype**: The React runtime prop validation style, which appears in this project only as a glossary headword.
- **prose**: Running natural-language text as opposed to code, which the spelling and markdown rules here check.
- **proxy**: An intermediary that forwards requests, such as the Verdaccio setting that proxies missing packages to npm.
- **px**: Abbreviation of pixel, the CSS unit whose utility-class forms like px-4 the cspell exemptions allow.
- **pyproject**: The Python project metadata file, pyproject.toml, which this configuration names for hatchling and lint tools.
- **ql**: Stray lemmatizer fragment of a QL suffix such as GraphQL or CodeQL, not a word this configuration spells.
- **radix**: The base of a number, as in the ESLint radix rule that requires parseInt to state one.
- **re**: Prefix meaning again, as in re-export, re-run, and re-splice, used throughout configuration comments.
- **ready**: Describes a service able to serve requests, as in the readyz probe and the signalReady call in this configuration.
- **reassign**: Writing a new value into an existing parameter or binding, which the no-param-reassign rule forbids here.
- **recommend**: The recommended rule set a tool ships, such as the tseslint recommended configs that this ESLint setup extends.
- **recursion**: A function that calls itself directly or through a pair, which callidescope's depth gate traces as part of a stack.
- **redeclare**: A lint rule set to error in the oxlint and ESLint configs that blocks declaring the same variable twice.
- **redundant**: A finding for code that adds nothing, such as oxlint img-redundant-alt, while knip hints get reviewed before acting on them.
- **regexp**: Regular expression literals and constructors, validated at lint time by the no-invalid-regexp rule in oxlint and ESLint.
- **rel**: Abbreviation allowed through the prevent-abbreviations allow list since TanStack Router meta API names its link property this way.
- **relay**: Cursor-based pagination pattern for GraphQL lists which the nestjs-graphql-application template implements via nestjs-graphql-connection.
- **replacement**: Abbreviation-to-expansion pairs in the ESLint prevent-abbreviations map, such as tmp mapped to temporary.
- **reporter**: Output formatter that a test or lint tool writes results through, such as vitest coverage text, json-summary, lcov, and html reporters.
- **reproducible**: Hatch build flag set true in the Jupyter notebook template pyproject.toml so wheel builds come out repeatable.
- **req**: Abbreviation that codebase-structure reserves and the ESLint map expands to request, banning it as a folder or file name.
- **restoration**: Unused in this folder since no configuration here restores files or state, so the word names nothing it checks.
- **restrict**: Suffix of the callidescope-restrict target, which traces only the callables a project owns and gates them against its own limits.
- **restriction**: Oxlint rule category set to off in the configuration, grouping opinionated rules that the workspace declines to enforce.
- **ret**: Abbreviation that CSpell flags and the ESLint prevent-abbreviations map expands to return, so identifiers may not use it.
- **reverse**: The unicorn lint rule no-array-reverse set to error, which forbids mutating reverse calls in favor of toReversed.
- **revision**: The lock-file format version recorded at the top of uv.lock, which uv reads to resolve the Python tooling in this folder.
- **rewrite**: Overwrite a generated README block in place, which release commits do on main so pull requests never conflict over it.
- **role**: The jsx-a11y ARIA attribute rules in oxlint, which check that elements carry valid roles and required attributes.
- **rollup**: Bundler that Vite drives through the rollupOptions block in vite.library.config.ts for library builds.
- **route**: A TanStack Router file under src/routes that the generated routeTree.gen.ts registers, as the tanstack-application template scaffolds it.
- **runtime**: Execution-time vocabulary that the coinagerie common-words list leaves unglossed, since no project defines it differently.
- **same**: Word used across comments in this folder to say two settings must stay identical, such as tools reading the same marker file.
- **save**: Name prefix of the generated save function in the tanstack-server-function template, which wraps a validated write.
- **scalar**: A YAML value style that the yml plain-scalar rule in ESLint forces for the YAML files this folder lints.
- **scoping**: Function placement rule, unicorn consistent-function-scoping, turned off because React render helpers are defined inside components on purpose.
- **screen**: Testing Library query object imported by the React component test template to find rendered elements.
- **scroll**: Unused in this folder since no rule or target here configures scrolling, so the word names nothing it checks.
- **selector**: Config key naming which code or projects a rule applies to, such as codometer comment selectors and codependix project selectors.
- **self**: Edge from a node back to itself, which codependix reports as a cycle, while the no-self-compare rule bans comparing a value with itself.
- **semi**: Formatter option for statement-ending punctuation, set to true in oxfmt and Prettier configs, so statements end with semicolons.
- **sensitive**: Describes tests whose results depend on the clock, which the shared mock default test date is meant to stabilize.
- **sensitivity**: Prettier HTML option governing how strictly the formatter respects whitespace around inline elements.
- **setter**: Oxlint rule set to error that forbids property write accessors from returning any value, enforced via no-setter-return.
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
- **stdio**: Child-process option setting which streams to ignore stdin and pipe stdout and stderr in lint-staged.
- **stg**: Abbreviation for staging that CSpell flags and the ESLint prevent-abbreviations map expands to staging.
- **str**: Allowed abbreviation for string, exempted from the ESLint prevent-abbreviations rule since the config treats string as reserved.
- **stylistic**: Typescript-eslint rule group of style checks enabled alongside the strict type-checked set in ESLint and oxlint.
- **suggest**: Unused in this folder since no rule or target here offers suggestions, so the word names nothing configured.
- **suppression**: Unused in this folder since the workspace forbids silencing errors with suppression comments, so no config depends on one.
- **suspicious**: Oxlint rule category set to off in the configuration, grouping likely-bug checks that the workspace disables wholesale.
- **syntax**: Gitignore-style pattern language that .callidescopeignore and .codometerignore use to list paths they skip.
- **tab**: YAML rule forbidding indentation with tab characters, so every YAML file in this folder indents with spaces.
- **tabindex**: The jsx-a11y rule set in oxlint governing the tabIndex attribute, which controls keyboard focus order on JSX elements.
- **take**: Query-builder method limiting how many rows a query returns, mocked in the NestJS GraphQL test template.
- **temp**: Short form for temporary, which the ESLint prevent-abbreviations map expands to its full word rather than allowing it.
- **templater**: Sqlfluff option set to raw, which lints SQL without rendering any Jinja templating.
- **ternary**: Conditional operator whose nesting the ESLint core rule handles, so the unicorn duplicate is turned off.
- **testid**: Test selector attribute that each generated React component sets to its kebab-case name, so unit tests can find it.
- **testpath**: Unused in this folder since no test-path option is set here, so the word names nothing configured.
- **textnode**: Unused in this folder since no configuration here inspects DOM text nodes, so the word names nothing it checks.
- **their**: Possessive pronoun in config comments pointing back at the tools or projects a sentence has already named.
- **thenable**: Lint rule set to error in ESLint flagging await applied to a value that is not a promise, like an object with then.
- **thin**: Fallow rule set to warn, flagging a function that only forwards its arguments to another call, which is a wrapper with no work.
- **threshold**: Duplication ceiling of 6 in both jscpd and fallow duplicate-code settings, above which a run fails.
- **through**: Preposition in comments describing a command route, such as a husky hook invoked directly rather than through Nx.
- **tmp**: Ignored temporary directory name listed in oxfmtignore and expanded by the ESLint prevent-abbreviations map to temporary.
- **toggle**: DOM class method which the unicorn prefer-classlist-toggle rule requires over separate add and remove calls.
- **toml**: Configuration file format used by pyproject.toml, gitleaks.toml, and squawk.toml, each read directly by its tool.
- **top**: Outermost module scope where the prefer-top-level-await rule is turned off for CJS config files that cannot use await.
- **totalmem**: Node os call in lint-staged that reads total machine memory to cap parallel hook tasks, one per three gigabytes.
- **trace**: Callidescope step that follows calls from entry points to record each stack depth and each callable breadth.
- **trail**: Unused in this folder since the word appears only in the glossary list and names no rule, target, or config here.
- **trailer**: Metadata line closing a git commit message, such as Claude-Session, which commitlint accepts in any casing.
- **transition**: Unused in this folder since no rule or target here configures CSS transitions or animation timing, so it names nothing.
- **triple**: Lint rule set to error in oxlint and TypeScript-ESLint forbidding three-slash directive comments that reference other files.
- **trivyignore**: Ignore-list file read by Trivy naming CVE and AVD IDs skipped as verified false positives after manual review.
- **trunc**: Oxlint rule set to error requiring the Math method for dropping fractions instead of bitwise shortcuts such as OR zero.
- **truthy**: YAML lint rule in yamllint.yaml that flags unquoted boolean-like values such as yes, on, and off.
- **tseslint**: The typescript-eslint import alias used in eslint.config.ts to register the typescript-eslint plugin and its configs.
- **tslint**: Retired linter whose comment directives the ban-tslint-comment oxlint rule forbids, set to error in this workspace.
- **txt**: Plain-text file extension for CSpell word lists under the cspell folder, such as astronomy.txt and ics.txt, loaded by path.
- **unbind**: Unused in this folder since no event listener or subscription is unbound here, so the word names nothing configured.
- **unchecked**: Unused in this folder since no rule here flags unchecked values by that name, so the word names nothing configured.
- **undeclared**: Lacking a declaration in codebase-structure.json, so the folder-structure rule rejects the markdown file or directory.
- **undef**: Lint check for names never declared, with the oxlint globals option and react jsx-no-undef flagging JSX names.
- **underscore**: Markdownlint MD049 emphasis style requiring italics marked with underscore characters, matching oxfmt and Prettier output.
- **unescaped**: Oxlint JSX rule set to error forbidding raw quote and angle characters in text that must be entity-encoded.
- **unify**: Unused in this folder since no configuration here merges or unifies settings by that name, so it names nothing it checks.
- **unnecessary**: Typescript-eslint rules flagging code that changes nothing, such as no-unnecessary-type-assertion set to error.
- **unneeded**: Vitest lint rule set to error forbidding an async wrapper around an expect that needs no await.
- **unowned**: A project tagged workspace-unowned in project.json, whose files no Nx project claims, so the workspace root check covers them.
- **unplugin**: Build-tool plugin package family, such as unplugin-swc used by the NestJS GraphQL template for its compiler.
- **unprovided**: Fallow rule set to warn reporting injection tokens that code consumes but never provides.
- **unpublish**: Verdaccio permission setting granting every user the right to remove packages from the local publish-rehearsal registry.
- **unreachable**: Code no entry point reaches, which fallow module-graph analysis treats as dead, so an import here keeps it live.
- **unreadable**: Describes a fixture project kept hard to parse on purpose, which the callidescope ignore list excludes from tracing.
- **unresolved**: Fallow rule set to error, failing on an import whose target cannot be found, while ESLint import no-unresolved is off.
- **unsafe**: Typescript-eslint rule family set to error, forbidding any-typed values in arguments, assignments, returns, and member access.
- **unsupported**: Oxlint lacks an equivalent for 156 ESLint rules, which the oxlint config skips rather than maps.
- **uplink**: Unused in this folder since no upstream registry connection is configured here, so the word names nothing it checks.
- **useless**: Shellcheck rule enabled in .shellcheck.rc flagging a cat piped into a command that could read the file directly.
- **val**: Short form of value, which ESLint prevent-abbreviations map expands to value and CSpell lists as banned.
- **validator**: Checker for the files of one language in conformetry, or the validator call that TanStack server-function templates attach to inputs.
- **vendored**: Third-party code copied into the repository, such as shadcn components and skill content, which codometer and oxlint skip.
- **venv**: Python virtual environment directory named .venv, which oxfmt and oxlint ignore so they never lint installed packages.
- **verb**: Grammatical form a log message must use after its subject, present progressive or past tense, checked by the logger convention rule.
- **verbatim**: Required text copied exactly into every generated instance, such as a conformetry template header that must never change.
- **violation**: Fallow finding set to warn for an import that crosses a module boundary the layering forbids.
- **vue**: Frontend framework whose single-file components the Prettier config formats, including indentation inside script and style tags.
- **wheel**: Packaged Python distribution file that Hatch builds, configured under the Jupyter template pyproject.toml build targets.
- **which**: Relative pronoun in config comments introducing the tool, rule, or file that the sentence explains.
- **whitelist**: Vulture allow-list file at the workspace root, naming Python utilities outside Nx projects that look unused but are kept.
- **whitespace**: Conventional-commit type for formatting-only changes, described in conventional.config.cjs as whitespace or code structure changes with no semantic effect.
- **width**: Viewport meta value in the TanStack root route, set to device-width so pages scale properly on phones.
- **wrong**: Adjective in config comments flagging a mistaken setting, such as a package tagged into the incorrect layer, which a rule catches.
- **yamllint**: YAML linter run by a project.json target over workspace-root YAML files, configured by yamllint.yaml.
- **yoda**: ESLint rule set to never, forbidding comparisons that put a literal first, such as zero before a count variable.

<!-- coinagerie:end -->
