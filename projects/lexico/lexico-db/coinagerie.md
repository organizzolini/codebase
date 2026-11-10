<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **breadth**: Heading of the callidescope breadth section in this README, currently None, so no breadth limit is measured here.
- **cascade**: Foreign-key behavior in the migrations, ON DELETE CASCADE, so deleting a parent row also removes its dependent rows.
- **conjunction**: Part-of-speech value for conjunctions, stored in the lexemes part_of_speech enum with the other word classes.
- **degree**: Comparison degree value, comparative, positive, or superlative, stored in the forms and inflections degree enums.
- **deletable**: Name of the PostgresqlDeletableEntity base class from @codebase/persistence, which gives every entity soft-delete columns.
- **dictionary**: The src/modules/entities/dictionary folder, holding the Word, Lexeme, Form, Inflection, and Translation entity classes.
- **disambiguator**: Numeric lexeme column that, together with lemma, makes each dictionary entry unique and tells homographs apart.
- **ecclesiastical**: Pronunciation variant value for Ecclesiastical Latin, one of classical, ecclesiastical, or vulgar in the enum.
- **generation**: Field generationStrategy in column expectations, one of increment, rowid, or uuid, that the entity service tests check.
- **lexeme**: The Lexeme entity, a lexical entry joined to words, which holds part of speech, etymology, and lemma.
- **literature**: The literature module: Author, Text, Line, and Token entities that tie classical texts to dictionary words.
- **perfect**: Tense enum value for perfect verb forms, also one of the three non-finite tenses.
- **pronunciation**: Entity holding a lexeme's classical, ecclesiastical, or vulgar sound variants and transcriptions, one row per variant.
- **representative**: Fixture entity that contract tests use to check indexes and unique constraints, such as Text's slug column.
- **role**: Database login reported by current_user in the integration test, which should be the lexico_username role.
- **translation**: Entity for one English sense of a lexeme, held in the translations table with its full-text search column.
- **verb**: Part-of-speech value and inflection kind for verbs, covered by VerbInflection and the verb conjugation enum.

<!-- coinagerie:end -->
