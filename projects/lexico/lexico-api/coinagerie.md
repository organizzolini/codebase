<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **application**: A project tagged type:application in the Nx workspace that runs as a deployable program, as opposed to a type:package library.
- **batch**: Dataloader term for grouping ID lookups into one query, such as lexemes loaded together in a single batch.
- **book**: Division of a literary work used as a text locator, such as book one of Vergil's Aeneid in literature fixtures.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **corpus**: Fixture collection of literary texts and lines seeded into the database, used by literature search and lookup tests.
- **cut**: Local name for the page-limit condition that trims a query's rows to the count a page requested.
- **db**: Suffix of the POSTGRES_DB environment variable, naming the Postgres database the API connects to and tests stub.
- **degree**: Comparison level of adjectives and adverbs, such as comparative or superlative, modeled on the adverb form entities.
- **deletable**: Shared base type for soft-deletable rows, exposing id and audit columns through GraphQL types across modules.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **disambiguator**: Numeric lexeme field separating homographs that share a lemma, such as two entries spelled the same way.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **lexeme**: Dictionary entry for a Latin word, the core entity of the lexicon carrying its lemma, translations, forms, and pronunciation.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **literature**: Domain module for authors, texts, lines, tokens, and passages, the largest area of the lexico API's resolvers and services.
- **lookup**: Read-only callidescope query that traces a callable, prints its callers or callees, and never applies a depth or breadth gate.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **pronunciation**: Lexeme field recording how a word is pronounced, with phonemes, phonetic spelling, and variant data mapped to GraphQL.
- **quick**: Word in the README Quick Start heading, introducing the short setup steps for running the lexico API locally.
- **reader**: Readable view of a line, reduced to what a reader can observe; the reader query selects one line for display.
- **retyped**: Adjective for a GraphQL type whose fields are redeclared as non-null rows, such as LexemeType in the lexico type tests.
- **term**: Search input string a user types; fuzzy matching applies only to terms above a shortest allowed length.
- **translation**: English sense of a lexeme, a Translation entity joined to lexemes and returned in search results and lexeme types.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **valerius**: Roman poet named in the literature search corpus fixture, whose texts the corpus lists for search tests.
- **verb**: Part of speech whose finite forms, such as indicative or subjunctive, are modeled and tested across the search and forms code.
- **vergil**: Latin poet whose Aeneid, Eclogues, and Georgics seed most literature search and integration test fixtures.
- **window**: Slice of ordered row ids bounded by the before and after cursors, which cursor pagination cuts to the first or last count and loads one page at a time.

<!-- coinagerie:end -->
