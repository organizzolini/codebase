<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **conjunction**: Part-of-speech value for conjunctions, stored in the lexemes part_of_speech enum with the other word classes.
- **db**: The database half of the lexico project's name: the `lexico-db` project that owns the entities, data source and migrations.
- **degree**: Comparison degree value, comparative, positive, or superlative, stored in the forms and inflections degree enums.
- **deletable**: Name of the PostgresqlDeletableEntity base class from @codebase/persistence, which gives every entity soft-delete columns.
- **dictionary**: The src/modules/dictionary module, whose child modules hold the Word, Lexeme, Form, Inflection, and Translation entity classes.
- **disambiguator**: Numeric lexeme column that, together with lemma, makes each dictionary entry unique and tells homographs apart.
- **ecclesiastical**: Pronunciation variant value for Ecclesiastical Latin, one of classical, ecclesiastical, or vulgar in the enum.
- **lexeme**: The Lexeme entity, a lexical entry joined to words, which holds part of speech, etymology, and lemma.
- **literature**: The literature module: Author, Text, Line, and Token entities that tie classical texts to dictionary words.
- **perfect**: Tense enum value for perfect verb forms, also one of the three non-finite tenses.
- **pronunciation**: Entity holding a lexeme's classical, ecclesiastical, or vulgar sound variants and transcriptions, one row per variant.
- **translation**: Entity for one English sense of a lexeme, held in the translations table with its full-text search column.
- **verb**: Part-of-speech value and inflection kind for verbs, covered by VerbInflection and the verb conjugation enum.

<!-- coinagerie:end -->
