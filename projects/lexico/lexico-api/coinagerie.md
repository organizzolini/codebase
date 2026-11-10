<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **batch**: Dataloader term for grouping ID lookups into one query, such as lexemes loaded together in a single batch.
- **book**: Division of a literary work used as a text locator, such as book one of Vergil's Aeneid in literature fixtures.
- **corpus**: Fixture collection of literary texts and lines seeded into the database, used by literature search and lookup tests.
- **cut**: Local name for the page-limit condition that trims a query's rows to the count a page requested.
- **db**: Suffix of the POSTGRES_DB environment variable, naming the Postgres database the API connects to and tests stub.
- **degree**: Comparison level of adjectives and adverbs, such as comparative or superlative, modeled on the adverb form entities.
- **deletable**: Shared base type for soft-deletable rows, exposing id and audit columns through GraphQL types across modules.
- **disambiguator**: Numeric lexeme field separating homographs that share a headword, such as two entries spelled the same way.
- **headword**: Dictionary entry form that a search matches first, seeded with English senses and ranked by the search service.
- **lexeme**: Dictionary entry for a Latin word, the core entity of the lexicon carrying its headword, translations, forms, and pronunciation.
- **literature**: Domain module for authors, texts, lines, tokens, and passages, the largest area of the lexico API's resolvers and services.
- **pronunciation**: Lexeme field recording how a word is pronounced, with phonemes, phonetic spelling, and variant data mapped to GraphQL.
- **quick**: Word in the README Quick Start heading, introducing the short setup steps for running the lexico API locally.
- **reader**: Readable view of a line, reduced to what a reader can observe; the reader query selects one line for display.
- **retyped**: Adjective for a GraphQL type whose fields are redeclared as non-null rows, such as LexemeType in the lexico type tests.
- **stem**: Portion of a word the search matches; a headword is found whole or as a stem with its enclitic split off.
- **term**: Search input string a user types; fuzzy matching applies only to terms above a shortest allowed length.
- **translation**: English sense of a lexeme, a Translation entity joined to lexemes and returned in search results and lexeme types.
- **valerius**: Roman poet named in the literature search corpus fixture, whose texts the corpus lists for search tests.
- **verb**: Part of speech whose finite forms, such as indicative or subjunctive, are modeled and tested across the search and forms code.
- **vergil**: Latin poet whose Aeneid, Eclogues, and Georgics seed most literature search and integration test fixtures.

<!-- coinagerie:end -->
