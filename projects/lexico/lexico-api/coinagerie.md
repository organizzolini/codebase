<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **aggregate**: SQL function, such as MIN or MAX, that reduces an author's Texts to the one value a library card is ordered by.
- **archaic**: Era label for the earliest Latin authors, the first period of the library era filter.
- **batch**: Dataloader term for grouping ID lookups into one query, such as lexemes loaded together in a single batch.
- **book**: Division of a literary work used as a text locator, such as book one of Vergil's Aeneid in literature fixtures.
- **boundary**: Inclusive edge of a library range filter, such as the lowest or highest year a filter keeps.
- **corpus**: Fixture collection of literary texts and lines seeded into the database, used by literature search and lookup tests.
- **csel**: Collection label for editions ingested from the Corpus Scriptorum Ecclesiasticorum Latinorum catalogue.
- **cut**: Local name for the page-limit condition that trims a query's rows to the count a page requested.
- **db**: Suffix of the POSTGRES_DB environment variable, naming the Postgres database the API connects to and tests stub.
- **degree**: Comparison level of adjectives and adverbs, such as comparative or superlative, modeled on the adverb form entities.
- **deletable**: Shared base type for soft-deletable rows, exposing id and audit columns through GraphQL types across modules.
- **disambiguator**: Numeric lexeme field separating homographs that share a lemma, such as two entries spelled the same way.
- **edition**: Published version of a Text, such as its series or volume, shown beside its collection in the library.
- **imperial**: Era label for authors of the Roman Empire, such as Ovid in the library catalog fixture.
- **inscription**: Text recording one EDCS inscription, a child of its province book with its own find-spot and dates.
- **lexeme**: Dictionary entry for a Latin word, the core entity of the lexicon carrying its lemma, translations, forms, and pronunciation.
- **literature**: Domain module for authors, texts, lines, tokens, and passages, the largest area of the lexico API's resolvers and services.
- **material**: Inscription attribute naming what the stone is made of, such as marble, searched by the library.
- **medieval**: Era label for authors of the Middle Ages, the period after the late antique era.
- **neo**: Part of the Neo-Latin era label, for Latin written after the Middle Ages.
- **perseus**: Collection label for editions ingested from the Perseus Digital Library.
- **pronunciation**: Lexeme field recording how a word is pronounced, with phonemes, phonetic spelling, and variant data mapped to GraphQL.
- **quick**: Word in the README Quick Start heading, introducing the short setup steps for running the lexico API locally.
- **reader**: Readable view of a line, reduced to what a reader can observe; the reader query selects one line for display.
- **recognise**: Stem of recognisedWordCount, the count of a text's Tokens linked to a dictionary Word.
- **retyped**: Adjective for a GraphQL type whose fields are redeclared as non-null rows, such as LexemeType in the lexico type tests.
- **spot**: Part of findSpot, the place where an inscription was found.
- **term**: Search input string a user types; fuzzy matching applies only to terms above a shortest allowed length.
- **translation**: English sense of a lexeme, a Translation entity joined to lexemes and returned in search results and lexeme types.
- **valerius**: Roman poet named in the literature search corpus fixture, whose texts the corpus lists for search tests.
- **verb**: Part of speech whose finite forms, such as indicative or subjunctive, are modeled and tested across the search and forms code.
- **vergil**: Latin poet whose Aeneid, Eclogues, and Georgics seed most literature search and integration test fixtures.
- **window**: Slice of ordered row ids bounded by the before and after cursors, which cursor pagination cuts to the first or last count and loads one page at a time.

<!-- coinagerie:end -->
