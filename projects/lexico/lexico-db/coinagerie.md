<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **cascade**: Foreign-key behavior in the migrations, ON DELETE CASCADE, so deleting a parent row also removes its dependent rows.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **conjunction**: Part-of-speech value for conjunctions, stored in the lexemes part_of_speech enum with the other word classes.
- **db**: The database half of the lexico project's name: the `lexico-db` project that owns the entities, data source and migrations.
- **degree**: Comparison degree value, comparative, positive, or superlative, stored in the forms and inflections degree enums.
- **deletable**: Name of the PostgresqlDeletableEntity base class from @codebase/persistence, which gives every entity soft-delete columns.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **dictionary**: The src/modules/entities/dictionary folder, holding the Word, Lexeme, Form, Inflection, and Translation entity classes.
- **disambiguator**: Numeric lexeme column that, together with lemma, makes each dictionary entry unique and tells homographs apart.
- **ecclesiastical**: Pronunciation variant value for Ecclesiastical Latin, one of classical, ecclesiastical, or vulgar in the enum.
- **generation**: Field generationStrategy in column expectations, one of increment, rowid, or uuid, that the entity service tests check.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **lexeme**: The Lexeme entity, a lexical entry joined to words, which holds part of speech, etymology, and lemma.
- **lexico**: The Latin dictionary product whose web app, ingestion CLI, and entity packages live under projects/lexico.
- **literature**: The literature module: Author, Text, Line, and Token entities that tie classical texts to dictionary words.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **perfect**: Tense enum value for perfect verb forms, also one of the three non-finite tenses.
- **pronunciation**: Entity holding a lexeme's classical, ecclesiastical, or vulgar sound variants and transcriptions, one row per variant.
- **representative**: Fixture entity that contract tests use to check indexes and unique constraints, such as Text's slug column.
- **role**: Database login reported by current_user in the integration test, which should be the lexico_username role.
- **translation**: Entity for one English sense of a lexeme, held in the translations table with its full-text search column.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **verb**: Part-of-speech value and inflection kind for verbs, covered by VerbInflection and the verb conjugation enum.

<!-- coinagerie:end -->
