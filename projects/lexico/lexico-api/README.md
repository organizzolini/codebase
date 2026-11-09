## Start

```bash
nx run lexico-api:start
```

## Test

```bash
nx run lexico-api:vitest
```

## GraphQL types

The API's object types are its own, not lexico-db' TypeORM entities.
Each one, such as `LexemeType` in `src/modules/lexemes/lexeme.entities.ts`,
implements `GraphQLObjectOf<Entity, Self, DatabaseOnlyField, RelationField>`
from `src/lexico-api.types.ts`, which fails the typecheck when the type and its
entity drift apart:

- **Every entity field is declared or excluded by name.** A column only the
  database needs, such as `Translation.translationFullTextSearch`, is listed
  in the type's `*DatabaseOnlyField` union in the module's `*.types.ts`. A new
  column, or a dropped exclusion, fails until someone decides on it.
- **Every declared field has its column's type.** Retyping a column, or
  making a nullable one non-null in the API, fails.
- **Relations are retyped as GraphQL types.** The fields named in the type's
  `*RelationField` union are declared as GraphQL types, and must keep the
  entity relation's cardinality and nullability.

Resolvers never return an entity. Each module's `*.utilities.ts` maps an
entity to its type, such as `toLexemeType`, copying only the fields the type
declares; a relation the query did not join stays unset. The `Form` and
`Inflection` interfaces resolve by the class a row is mapped to, so their
object types are registered as `ORPHANED_GRAPHQL_TYPES` in
`src/modules/lexemes/lexemes.constants.ts`.

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-api:coinagerie-check:write`.

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
