<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **archaic**: Era value for the earliest period of Latin, one of the author era enum values.
- **conjunction**: Part-of-speech value for conjunctions, stored in the lexemes part_of_speech enum with the other word classes.
- **csel**: Collection value for the Corpus Scriptorum Ecclesiasticorum Latinorum editions, one of the text collection enum values.
- **db**: The database half of the lexico project's name: the `lexico-db` project that owns the entities, data source and migrations.
- **degree**: Comparison degree value, comparative, positive, or superlative, stored in the forms and inflections degree enums.
- **deletable**: Name of the PostgresqlDeletableEntity base class from @codebase/persistence, which gives every entity soft-delete columns.
- **dictionary**: The src/modules/dictionary module, whose child modules hold the Word, Lexeme, Form, Inflection, and Translation entity classes.
- **disambiguator**: Numeric lexeme column that, together with lemma, makes each dictionary entry unique and tells homographs apart.
- **ecclesiastical**: Pronunciation variant value for Ecclesiastical Latin, one of classical, ecclesiastical, or vulgar in the enum.
- **edition**: The printed edition a text comes from, recorded on the texts table with its editors, publisher, and print year.
- **imperial**: Era value for the Imperial period of Latin, one of the author era enum values.
- **inscription**: An epigraphic text from the EDCS database, stored as its own child text under its province with its find-spot, type, and material.
- **lexeme**: The Lexeme entity, a lexical entry joined to words, which holds part of speech, etymology, and lemma.
- **literature**: The literature module: Author, Text, Line, and Token entities that tie classical texts to dictionary words.
- **material**: Column on the texts table holding what an inscription is made of, such as stone or bronze.
- **medieval**: Era value for the Medieval period of Latin, one of the author era enum values.
- **neo**: First word of the Neo-Latin era value, one of the author era enum values.
- **perfect**: Tense enum value for perfect verb forms, also one of the three non-finite tenses.
- **perseus**: Collection value for the Perseus Digital Library texts, one of the text collection enum values.
- **pronunciation**: Entity holding a lexeme's classical, ecclesiastical, or vulgar sound variants and transcriptions, one row per variant.
- **recognise**: Spelling used in recognisedWordCount, the number of a text's tokens linked to a dictionary word.
- **spot**: Second word of find-spot, the place an inscription was found, recorded on the texts table.
- **translation**: Entity for one English sense of a lexeme, held in the translations table with its full-text search column.
- **verb**: Part-of-speech value and inflection kind for verbs, covered by VerbInflection and the verb conjugation enum.

<!-- coinagerie:end -->
