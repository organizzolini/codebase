<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/lexico/lexico-api`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 387 |
| Files | 112 |
| Calls traced | 227 |
| Call stacks | 54 |
| Deepest stack | 8 |
| Stacks through recursion | 0 |
| Unfollowable calls | 8 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

**1. `LexemesResolver.lexemes`** — depth ≥ 8 · decorated-method

```text
🚀 LexemesResolver.lexemes(arguments_: LexemesArguments): Promise<LexemeType[]> [projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:41]
   ↳ Retrieves multiple dictionary lexemes by ID.
  └─> LexemesResolver.map(…)(lexeme: Lexeme): LexemeType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:49]
    └─> toLexemeType(lexeme: Lexeme): LexemeType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:26]
       ↳ Maps a lexeme entity, and each relation it loaded, to its GraphQL type.
      └─> mapNullableRelationConnection(…): Connection<Mapped> | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:158]
         ↳ Maps a nullable to-many relation to a Relay connection, keeping `null`.
        └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
           ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
          └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
            └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
               ↳ Encodes an offset-based integer cursor.
              └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
                 ↳ Encodes structured data into an opaque Base64 cursor string.
```

**2. `LiteratureResolver.searchLiterature`** — depth ≥ 8 · decorated-method

```text
🚀 LiteratureResolver.searchLiterature(arguments_: SearchLiteratureArguments): Promise<LiteratureSearchResult> [projects/lexico/lexico-api/src/modules/literature/literature.resolver.ts:26]
   ↳ Searches authors, texts, and lines together.
  └─> LiteratureService.searchLiterature(…): Promise<{ authors: Connection<Author>; lines: Connection<Line>; texts: Connection<Text>; }> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:259]
     ↳ Aggregates author, text, and line search hits into a single response.
    └─> LiteratureService.searchAuthors(query: string, pagination?: PaginationArguments): Promise<Connection<Author>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:202]
       ↳ Searches authors by name or slug with a simple substring filter.
      └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
         ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
        └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
           ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
          └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
             ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
            └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
               ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
              └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
                 ↳ Decodes an opaque Base64 cursor string into structured data.
```

**3. `SearchResolver.searchEnglish`** — depth ≥ 8 · decorated-method

```text
🚀 SearchResolver.searchEnglish(arguments_: SearchEnglishArguments): Promise<Connection<LexemeSearchResult>> [projects/lexico/lexico-api/src/modules/search/search.resolver.ts:31]
   ↳ Searches English definitions and translations using full-text and substring matching.
  └─> SearchService.searchEnglish(…): Promise<Connection<LexemeSearchMatch>> [projects/lexico/lexico-api/src/modules/search/search.service.ts:428]
     ↳ Searches English translations and definitions using full-text and substring matching.
    └─> SearchService.paginateRankedLexemes(…): Promise<Connection<LexemeSearchMatch>> [projects/lexico/lexico-api/src/modules/search/search.service.ts:220]
       ↳ Pages ranked lexemes in SQL, best score first and then by id: the ranking is joined to the lexemes, the cursors bound…
      └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
         ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
        └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
           ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
          └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
             ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
            └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
               ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
              └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
                 ↳ Decodes an opaque Base64 cursor string into structured data.
```

<details>
<summary>51 more call stacks</summary>

**4. `SearchResolver.searchLatin`** — depth ≥ 8 · decorated-method

```text
🚀 SearchResolver.searchLatin(arguments_: SearchLatinArguments): Promise<Connection<LexemeSearchResult>> [projects/lexico/lexico-api/src/modules/search/search.resolver.ts:47]
   ↳ Searches Latin lemmas and inflected forms with enclitic parsing and fuzzy matching.
  └─> SearchService.searchLatin(…): Promise<Connection<LexemeSearchMatch>> [projects/lexico/lexico-api/src/modules/search/search.service.ts:458]
     ↳ Performs tiered Latin dictionary search with enclitic parsing and fuzzy matching.
    └─> SearchService.paginateRankedLexemes(…)(scored: ScoredLexeme[]): Promise<LexemeSearchMatch[]> [projects/lexico/lexico-api/src/modules/search/search.service.ts:478]
      └─> SearchService.describeLatinMatches(…): Promise<LexemeSearchMatch[]> [projects/lexico/lexico-api/src/modules/search/search.service.ts:106]
         ↳ Describes each Latin match on a page the way merging its tiers would: the morphological identifiers of every matched…
        └─> SearchService.map(…)(wordForm: WordForm): string | null [projects/lexico/lexico-api/src/modules/search/search.service.ts:140]
          └─> formatFormIdentifier(form: Form): null | string [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:66]
             ↳ Formats grammatical and morphological description strings from a lexical Form.
            └─> formatDeclinedForm(form: Form): null | string [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:163]
               ↳ Formats nominal, adjectival, and participial declined forms.
              └─> formatNonFiniteForm(form: Form): null | string [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:179]
                 ↳ Formats non-finite verb and uninflected forms like infinitives, gerunds, supines, and adverbs.
```

**5. `LexemesResolver.lexeme`** — depth ≥ 7 · decorated-method

```text
🚀 LexemesResolver.lexeme(arguments_: LexemeArguments): Promise<LexemeType | null> [projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:26]
   ↳ Retrieves a single dictionary lexeme by ID.
  └─> toLexemeType(lexeme: Lexeme): LexemeType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:26]
     ↳ Maps a lexeme entity, and each relation it loaded, to its GraphQL type.
    └─> mapNullableRelationConnection(…): Connection<Mapped> | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:158]
       ↳ Maps a nullable to-many relation to a Relay connection, keeping `null`.
      └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
         ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
        └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
          └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
             ↳ Encodes an offset-based integer cursor.
            └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
               ↳ Encodes structured data into an opaque Base64 cursor string.
```

**6. `AuthorsResolver.authors`** — depth ≥ 7 · decorated-method

```text
🚀 AuthorsResolver.authors(arguments_: PaginationArguments): Promise<Connection<AuthorType>> [projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:68]
   ↳ Lists authors with Relay pagination.
  └─> LiteratureService.listAuthorsConnection(pagination?: PaginationArguments): Promise<Connection<Author>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:87]
     ↳ Lists authors by name using Relay pagination.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**7. `AuthorsResolver.searchAuthors`** — depth ≥ 7 · decorated-method

```text
🚀 AuthorsResolver.searchAuthors(arguments_: SearchAuthorsArguments): Promise<Connection<AuthorType>> [projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:99]
   ↳ Searches authors by name or slug.
  └─> LiteratureService.searchAuthors(query: string, pagination?: PaginationArguments): Promise<Connection<Author>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:202]
     ↳ Searches authors by name or slug with a simple substring filter.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**8. `LinesResolver.lines`** — depth ≥ 7 · decorated-method

```text
🚀 LinesResolver.lines(arguments_: LinesArguments): Promise<Connection<LineType>> [projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:47]
   ↳ Lists lines with optional range bounds.
  └─> LiteratureService.listLinesConnection(…): Promise<Connection<Line>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:103]
     ↳ Retrieves paginated lines for a text with optional range bounds.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**9. `LinesResolver.searchLines`** — depth ≥ 7 · decorated-method

```text
🚀 LinesResolver.searchLines(arguments_: SearchLinesArguments): Promise<Connection<LineType>> [projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:63]
   ↳ Searches lines by content.
  └─> LiteratureService.searchLines(…): Promise<Connection<Line>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:228]
     ↳ Searches lines by content within a text or globally.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**10. `TextsResolver.searchTexts`** — depth ≥ 7 · decorated-method

```text
🚀 TextsResolver.searchTexts(arguments_: SearchTextsArguments): Promise<Connection<TextType>> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:102]
   ↳ Searches texts by title or slug.
  └─> LiteratureService.searchTexts(…): Promise<Connection<Text>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:285]
     ↳ Searches texts by title or slug with optional author filter.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**11. `TextsResolver.texts`** — depth ≥ 7 · decorated-method

```text
🚀 TextsResolver.texts(arguments_: TextsArguments): Promise<Connection<TextType>> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:136]
   ↳ Lists texts with optional author and parent filters.
  └─> LiteratureService.listTextsConnection(…): Promise<Connection<Text>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:147]
     ↳ Lists texts using Relay pagination with the same author and parent text filters.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**12. `TokensResolver.tokens`** — depth ≥ 7 · decorated-method

```text
🚀 TokensResolver.tokens(arguments_: TokensArguments): Promise<Connection<TokenType>> [projects/lexico/lexico-api/src/modules/literature/tokens.resolver.ts:29]
   ↳ Lists tokens for a line.
  └─> LiteratureService.listTokensForLineConnection(lineId: string, pagination?: PaginationArguments): Promise<Connection<Token>> [projects/lexico/lexico-api/src/modules/literature/literature.service.ts:180]
     ↳ Lists tokens for a line with Relay pagination.
    └─> paginateQuery(…): Promise<Connection<Node>> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54]
       ↳ Pages a filtered query into a Relay connection in SQL: the cursors become keyset bounds on the sort key and id, `first`…
      └─> decodeCursor(…): CursorClaim | null [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182]
         ↳ Reads the row a cursor claims to name, or null when the cursor is absent or not one the connection hands out.
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**13. `WordsResolver.words`** — depth ≥ 7 · decorated-method

```text
🚀 WordsResolver.words(arguments_: WordsArguments): Promise<WordType[]> [projects/lexico/lexico-api/src/modules/words/words.resolver.ts:41]
   ↳ Retrieves multiple surface words by a batch of normalized input strings.
  └─> WordsResolver.map(…)(word: Word): WordType [projects/lexico/lexico-api/src/modules/words/words.resolver.ts:49]
    └─> toWordType(word: Word): WordType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:49]
       ↳ Maps a word, and each link it loaded, to its GraphQL type.
      └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
         ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
        └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
          └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
             ↳ Encodes an offset-based integer cursor.
            └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
               ↳ Encodes structured data into an opaque Base64 cursor string.
```

**14. `LiteratureRelationsLoader.createConnectionLoader(…)`** — depth ≥ 7 · orphan-root

```text
🚀 LiteratureRelationsLoader.createConnectionLoader(…)(…): Promise<Map<string, Connection<Text>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:31]
  └─> LiteratureRelationsService.listChildTextsByParent(…): Promise<Map<string, Connection<Text>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:75]
     ↳ Pages the child texts of many parent texts at once, in title order.
    └─> paginateQueryByParent(…): Promise<Map<string, Connection<Entity>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:86]
       ↳ Pages the children of many parents at once, each parent's page exactly as `paginateQuery` would page that parent alone.
      └─> findCursorPositions(…): Promise<PartitionBounds> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:204]
         ↳ Resolves the `after` and `before` cursors to the rows they name among the parents' children, in one statement, or to…
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**15. `LiteratureRelationsLoader.createConnectionLoader(…)`** — depth ≥ 7 · orphan-root

```text
🚀 LiteratureRelationsLoader.createConnectionLoader(…)(…): Promise<Map<string, Connection<Line>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:40]
  └─> LiteratureRelationsService.listLinesByText(…): Promise<Map<string, Connection<Line>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:94]
     ↳ Pages the lines of many texts at once, in index order.
    └─> paginateQueryByParent(…): Promise<Map<string, Connection<Entity>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:86]
       ↳ Pages the children of many parents at once, each parent's page exactly as `paginateQuery` would page that parent alone.
      └─> findCursorPositions(…): Promise<PartitionBounds> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:204]
         ↳ Resolves the `after` and `before` cursors to the rows they name among the parents' children, in one statement, or to…
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**16. `LiteratureRelationsLoader.createConnectionLoader(…)`** — depth ≥ 7 · orphan-root

```text
🚀 LiteratureRelationsLoader.createConnectionLoader(…)(…): Promise<Map<string, Connection<Text>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:56]
  └─> LiteratureRelationsService.listTextsByAuthor(…): Promise<Map<string, Connection<Text>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:118]
     ↳ Pages the texts of many authors at once, in title order.
    └─> paginateQueryByParent(…): Promise<Map<string, Connection<Entity>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:86]
       ↳ Pages the children of many parents at once, each parent's page exactly as `paginateQuery` would page that parent alone.
      └─> findCursorPositions(…): Promise<PartitionBounds> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:204]
         ↳ Resolves the `after` and `before` cursors to the rows they name among the parents' children, in one statement, or to…
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**17. `LiteratureRelationsLoader.createConnectionLoader(…)`** — depth ≥ 7 · orphan-root

```text
🚀 LiteratureRelationsLoader.createConnectionLoader(…)(…): Promise<Map<string, Connection<Token>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:62]
  └─> LiteratureRelationsService.listTokensByLine(…): Promise<Map<string, Connection<Token>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:140]
     ↳ Pages the tokens of many lines at once, in index order, joining each token's dictionary word into the same statement.
    └─> paginateQueryByParent(…): Promise<Map<string, Connection<Entity>>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:86]
       ↳ Pages the children of many parents at once, each parent's page exactly as `paginateQuery` would page that parent alone.
      └─> findCursorPositions(…): Promise<PartitionBounds> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:204]
         ↳ Resolves the `after` and `before` cursors to the rows they name among the parents' children, in one statement, or to…
        └─> readCursorId(cursor: null | string | undefined): null | string [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98]
           ↳ Reads the entity id a cursor names, or null when it is absent, malformed, or not the canonical encoding of that id,…
          └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
             ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
            └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
               ↳ Decodes an opaque Base64 cursor string into structured data.
```

**18. `toLexemeSearchResult`** — depth ≥ 7 · orphan-root

```text
🚀 toLexemeSearchResult(match: LexemeSearchMatch): LexemeSearchResult [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:139]
   ↳ Maps a search match, and the lexeme it matched, to the result the API returns.
  └─> toLexemeType(lexeme: Lexeme): LexemeType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:26]
     ↳ Maps a lexeme entity, and each relation it loaded, to its GraphQL type.
    └─> mapNullableRelationConnection(…): Connection<Mapped> | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:158]
       ↳ Maps a nullable to-many relation to a Relay connection, keeping `null`.
      └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
         ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
        └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
          └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
             ↳ Encodes an offset-based integer cursor.
            └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
               ↳ Encodes structured data into an opaque Base64 cursor string.
```

**19. `WordFormResolver.word`** — depth ≥ 6 · decorated-method

```text
🚀 WordFormResolver.word(wordForm: WordFormType): Promise<WordType> [projects/lexico/lexico-api/src/modules/words/word-form.resolver.ts:28]
   ↳ Resolves the word side of a word-form link, batched per request.
  └─> toWordType(word: Word): WordType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:49]
     ↳ Maps a word, and each link it loaded, to its GraphQL type.
    └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
       ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
      └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
        └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
           ↳ Encodes an offset-based integer cursor.
          └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
             ↳ Encodes structured data into an opaque Base64 cursor string.
```

**20. `WordLexemeResolver.word`** — depth ≥ 6 · decorated-method

```text
🚀 WordLexemeResolver.word(wordLexeme: WordLexemeType): Promise<WordType> [projects/lexico/lexico-api/src/modules/words/word-lexeme.resolver.ts:29]
   ↳ Resolves the word side of a word-lexeme link, batched per request.
  └─> toWordType(word: Word): WordType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:49]
     ↳ Maps a word, and each link it loaded, to its GraphQL type.
    └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
       ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
      └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
        └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
           ↳ Encodes an offset-based integer cursor.
          └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
             ↳ Encodes structured data into an opaque Base64 cursor string.
```

**21. `WordsResolver.word`** — depth ≥ 6 · decorated-method

```text
🚀 WordsResolver.word(arguments_: WordArguments): Promise<null | WordType> [projects/lexico/lexico-api/src/modules/words/words.resolver.ts:26]
   ↳ Retrieves a single surface word by normalized input string.
  └─> toWordType(word: Word): WordType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:49]
     ↳ Maps a word, and each link it loaded, to its GraphQL type.
    └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
       ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
      └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
        └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
           ↳ Encodes an offset-based integer cursor.
          └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
             ↳ Encodes structured data into an opaque Base64 cursor string.
```

**22. `LexemeWordFormResolver.wordForms`** — depth ≥ 5 · decorated-method

```text
🚀 LexemeWordFormResolver.wordForms(lexeme: LexemeType): Promise<Connection<LexemeWordFormType>> [projects/lexico/lexico-api/src/modules/words/lexeme-word-form.resolver.ts:39]
   ↳ Resolves every written word that surfaces as one of this lexeme's forms, batched into one query per request however…
  └─> mapRelationConnection(…): Connection<Mapped> | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:192]
     ↳ Maps a to-many relation to a Relay connection with stable offset cursors.
    └─> map(…)(relation: Entity, index: number): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:201]
      └─> encodeOffsetCursor(offset: number): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:93]
         ↳ Encodes an offset-based integer cursor.
        └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
           ↳ Encodes structured data into an opaque Base64 cursor string.
```

**23. `createConnectionLoader`** — depth ≥ 5 · orphan-root

```text
🚀 createConnectionLoader(…): DataLoader<ConnectionRequest, Connection<Node>, string> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:34]
   ↳ Batches relation connections into one DataLoader: every request for the same page arguments made in the same tick is…
  └─> anonymous(requests: readonly ConnectionRequest[]): Promise<Connection<Node>[]> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:41]
    └─> map(…)(…): Promise<void> [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:61]
      └─> createEmptyConnection<T>(): Connection<T> [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:37]
         ↳ Returns a connection holding no edges and counting nothing.
        └─> createConnection(…): Connection<T> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:14]
           ↳ Creates a Relay Connection containing edges, page info, and total count.
```

**24. `AuthorsResolver.resolveAuthorTexts`** — depth ≥ 4 · decorated-method

```text
🚀 AuthorsResolver.resolveAuthorTexts(…): Promise<Connection<TextType>> [projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:82]
   ↳ Pages an author's texts in title order. The texts of every author in a response are loaded together.
  └─> mapConnection(…): Connection<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:131]
     ↳ Maps each node of a connection, keeping its cursors and page information.
    └─> map(…)(edge: Edge<Node>): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:136]
      └─> createEdge<T>(node: T, cursor: string): Edge<T> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:38]
         ↳ Creates a Relay Edge from a node and an encoded cursor string.
```

**25. `LinesResolver.tokensForLine`** — depth ≥ 4 · decorated-method

```text
🚀 LinesResolver.tokensForLine(…): Promise<Connection<TokenType>> [projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:84]
   ↳ Pages a line's tokens in index order, each with its dictionary word.
  └─> mapConnection(…): Connection<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:131]
     ↳ Maps each node of a connection, keeping its cursors and page information.
    └─> map(…)(edge: Edge<Node>): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:136]
      └─> createEdge<T>(node: T, cursor: string): Edge<T> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:38]
         ↳ Creates a Relay Edge from a node and an encoded cursor string.
```

**26. `TextsResolver.childTexts`** — depth ≥ 4 · decorated-method

```text
🚀 TextsResolver.childTexts(text: TextType, arguments_: PaginationArguments): Promise<Connection<TextType>> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:49]
   ↳ Pages the child texts under the current text, ordered like the `texts` query.
  └─> mapConnection(…): Connection<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:131]
     ↳ Maps each node of a connection, keeping its cursors and page information.
    └─> map(…)(edge: Edge<Node>): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:136]
      └─> createEdge<T>(node: T, cursor: string): Edge<T> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:38]
         ↳ Creates a Relay Edge from a node and an encoded cursor string.
```

**27. `TextsResolver.linesForText`** — depth ≥ 4 · decorated-method

```text
🚀 TextsResolver.linesForText(text: TextType, arguments_: PaginationArguments): Promise<Connection<LineType>> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:67]
   ↳ Pages the current text's lines in index order.
  └─> mapConnection(…): Connection<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:131]
     ↳ Maps each node of a connection, keeping its cursors and page information.
    └─> map(…)(edge: Edge<Node>): Edge<Mapped> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:136]
      └─> createEdge<T>(node: T, cursor: string): Edge<T> [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:38]
         ↳ Creates a Relay Edge from a node and an encoded cursor string.
```

**28. `TextsResolver.text`** — depth ≥ 4 · decorated-method

```text
🚀 TextsResolver.text(arguments_: TextArguments): Promise<null | TextType> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:117]
   ↳ Finds a text by ID or slug.
  └─> toTextType(text: Text): TextType [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:153]
     ↳ Maps a text, and each relation it loaded, to its GraphQL type.
    └─> mapNullableRelation(…): Mapped | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:148]
       ↳ Maps a nullable to-one relation to its GraphQL type, keeping `null`, and leaving one its query did not join unset, as…
      └─> mapRelation(…): Mapped | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:182]
         ↳ Maps a to-one relation to its GraphQL type.
```

**29. `toLexemeWordFormType`** — depth 4 · orphan-root

```text
🚀 toLexemeWordFormType(wordForm: WordForm): LexemeWordFormType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:24]
   ↳ Maps a word-form link, with its form and word joined, to the type a lexeme exposes it as.
  └─> toFormType(form: Form): FormType [projects/lexico/lexico-api/src/modules/lexemes/forms/forms.utilities.ts:29]
     ↳ Maps a form entity to the GraphQL type of its own kind, the class the `Form` interface resolves a returned form by.
    └─> toNonFiniteFormType(form: Form): FormType [projects/lexico/lexico-api/src/modules/lexemes/forms/forms.utilities.ts:59]
       ↳ Maps the verbal-noun, participle, infinitive, and adverb forms.
      └─> toVerbalNounFormType(form: Form): FormType [projects/lexico/lexico-api/src/modules/lexemes/forms/forms.utilities.ts:78]
         ↳ Maps the gerund, supine, and adverb forms, the last of the kinds.
```

**30. `AuthorsResolver.author`** — depth 3 · decorated-method

```text
🚀 AuthorsResolver.author(arguments_: AuthorArguments): Promise<AuthorType | null> [projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:47]
   ↳ Finds an author by ID or slug.
  └─> toAuthorType(author: Author): AuthorType [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:132]
     ↳ Maps an author to its GraphQL type.
    └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
       ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**31. `TextsResolver.parentText`** — depth ≥ 3 · decorated-method

```text
🚀 TextsResolver.parentText(text: TextType): Promise<null | TextType> [projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:85]
   ↳ Resolves the parent text for a nested text.
  └─> mapNullableRelation(…): Mapped | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:148]
     ↳ Maps a nullable to-one relation to its GraphQL type, keeping `null`, and leaving one its query did not join unset, as…
    └─> mapRelation(…): Mapped | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:182]
       ↳ Maps a to-one relation to its GraphQL type.
```

**32. `toTokenType`** — depth ≥ 3 · orphan-root

```text
🚀 toTokenType(token: Token): TokenType [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:165]
   ↳ Maps a token, and each relation it loaded, to its GraphQL type.
  └─> mapNullableRelation(…): Mapped | null | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:148]
     ↳ Maps a nullable to-one relation to its GraphQL type, keeping `null`, and leaving one its query did not join unset, as…
    └─> mapRelation(…): Mapped | undefined [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:182]
       ↳ Maps a to-one relation to its GraphQL type.
```

**33. `LiteratureRelationsLoader.anonymous`** — depth 3 · orphan-root

```text
🚀 LiteratureRelationsLoader.anonymous(textIds: readonly string[]): Promise<(Text | null)[]> [projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:46]
  └─> LiteratureRelationsService.findParentTexts(textIds: readonly string[]): Promise<Map<string, null | Text>> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:60]
     ↳ Finds each text's parent text, with that parent's author, in one statement: null for a top-level text, and absent for…
    └─> LiteratureRelationsService.map(…)(text: Text): [string, Text | null] [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:71]
```

**34. `readSearchCursor`** — depth ≥ 3 · orphan-root

```text
🚀 readSearchCursor(cursor: string): CursorClaim | null [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:105]
   ↳ Reads the lexeme and score a search cursor names, as the row it claims: its id, and its negated score as the sort key…
  └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:114]
     ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
    └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:100]
       ↳ Decodes an opaque Base64 cursor string into structured data.
```

**35. `SearchService.load`** — depth ≥ 3 · orphan-root

```text
🚀 SearchService.load(…): Promise<{ id: string; distance: number | null; enclitic: string | null; identifiers: string[]; lexeme: Lexeme; score: number; source: SearchMatchSource; }[]> [projects/lexico/lexico-api/src/modules/search/search.service.ts:246]
  └─> SearchService.map(…)(lexeme: Lexeme): { lexeme: Lexeme; score: number; } [projects/lexico/lexico-api/src/modules/search/search.service.ts:251]
    └─> toRankedScore(key: unknown): number [projects/lexico/lexico-api/src/modules/search/search.utilities.ts:156]
       ↳ Reads a ranked row's score back from the sort key it pages by, which is the score negated so the best score sorts first.
```

**36. `WordLinkLoader.anonymous`** — depth 3 · orphan-root

```text
🚀 WordLinkLoader.anonymous(wordFormIds: readonly string[]): Promise<(Error | Word)[]> [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:28]
  └─> WordLinkLoader.loadWords(…): (Error | Word)[] [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:49]
     ↳ Orders the words of a batch of links by the link IDs requested, with an error in place of a link that no longer…
    └─> WordLinkLoader.map(…)(link: { readonly id: string; readonly word: Word; }): [string, Word] [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:53]
```

**37. `WordLinkLoader.anonymous`** — depth 3 · orphan-root

```text
🚀 WordLinkLoader.anonymous(wordLexemeIds: readonly string[]): Promise<(Error | Word)[]> [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:36]
  └─> WordLinkLoader.loadWords(…): (Error | Word)[] [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:49]
     ↳ Orders the words of a batch of links by the link IDs requested, with an error in place of a link that no longer…
    └─> WordLinkLoader.map(…)(link: { readonly id: string; readonly word: Word; }): [string, Word] [projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:53]
```

**38. `HealthResolver.health`** — depth 2 · decorated-method

```text
🚀 HealthResolver.health(): boolean [projects/lexico/lexico-api/src/modules/health/health.resolver.ts:22]
   ↳ Health check query.
  └─> HealthService.isHealthy(): boolean [projects/lexico/lexico-api/src/modules/health/health.service.ts:23]
     ↳ Returns true if the service is operational.
```

**39. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(origins: string): string[] [projects/lexico/lexico-api/src/lexico-api.constants.ts:14]
  └─> filter(…)(origin: string): boolean [projects/lexico/lexico-api/src/lexico-api.constants.ts:18]
```

**40. `toInflectionType`** — depth 2 · orphan-root

```text
🚀 toInflectionType(inflection: Inflection): InflectionType [projects/lexico/lexico-api/src/modules/lexemes/inflections/inflections.utilities.ts:25]
   ↳ Maps an inflection entity to the GraphQL type of its own part of speech, the class the `Inflection` interface resolves…
  └─> toInvariableInflectionType(inflection: Inflection): InflectionType [projects/lexico/lexico-api/src/modules/lexemes/inflections/inflections.utilities.ts:51]
     ↳ Maps the adverb, preposition, and uninflected inflections.
```

**41. `toPrincipalPartType`** — depth 2 · orphan-root

```text
🚀 toPrincipalPartType(principalPart: PrincipalPart): PrincipalPartType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:51]
   ↳ Maps a principal part entity to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**42. `toPronunciationType`** — depth 2 · orphan-root

```text
🚀 toPronunciationType(pronunciation: Pronunciation): PronunciationType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:62]
   ↳ Maps a pronunciation entity to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**43. `toTranslationType`** — depth 2 · orphan-root

```text
🚀 toTranslationType(translation: Translation): TranslationType [projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:75]
   ↳ Maps a translation entity to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**44. `toWordFormType`** — depth ≥ 2 · orphan-root

```text
🚀 toWordFormType(wordForm: WordForm): WordFormType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:33]
   ↳ Maps a word-form link, and the form it loaded, to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**45. `toWordLexemeType`** — depth ≥ 2 · orphan-root

```text
🚀 toWordLexemeType(wordLexeme: WordLexeme): WordLexemeType [projects/lexico/lexico-api/src/modules/words/words.utilities.ts:41]
   ↳ Maps a word-lexeme link, and the lexeme it loaded, to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**46. `toLineType`** — depth ≥ 2 · orphan-root

```text
🚀 toLineType(line: Line): LineType [projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:141]
   ↳ Maps a line, and each relation it loaded, to its GraphQL type.
  └─> toDeletableFields(entity: PostgresqlDeletableEntity): GraphQLFields<DeletableType> [projects/lexico/lexico-api/src/lexico-api.utilities.ts:8]
     ↳ Copies the shared base columns every soft-deletable entity exposes.
```

**47. `toRequestKey`** — depth 2 · orphan-root

```text
🚀 toRequestKey(request: ConnectionRequest): string [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:306]
   ↳ Keys one parent's page request, which the loader caches its answer under.
  └─> toPaginationKey(pagination: PaginationArguments): string [projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:296]
     ↳ Keys one page's arguments, so requests asking the same page share a batch.
```

**48. `LiteratureRelationsService.load`** — depth 2 · orphan-root

```text
🚀 LiteratureRelationsService.load(): SelectQueryBuilder<Text> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:82]
  └─> LiteratureRelationsService.selectTexts(): ReturnType<Repository<Text>["createQueryBuilder"]> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:46]
     ↳ Selects texts with the relations a text connection exposes — the author, and the parent text with its own author — as a…
```

**49. `LiteratureRelationsService.load`** — depth 2 · orphan-root

```text
🚀 LiteratureRelationsService.load(): SelectQueryBuilder<Text> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:125]
  └─> LiteratureRelationsService.selectTexts(): ReturnType<Repository<Text>["createQueryBuilder"]> [projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:46]
     ↳ Selects texts with the relations a text connection exposes — the author, and the parent text with its own author — as a…
```

**50. `SearchService.encode`** — depth 2 · orphan-root

```text
🚀 SearchService.encode(position: CursorPosition): string [projects/lexico/lexico-api/src/modules/search/search.service.ts:231]
  └─> toCursor(data: unknown): string [projects/common/interface/src/modules/graphql-server/graphql-server.utilities.ts:254]
     ↳ Encodes structured data into an opaque Base64 cursor string.
```

**51. `WordsService.findFormsByData`** — depth 2 · orphan-root

```text
🚀 WordsService.findFormsByData(data: string): Promise<WordForm[]> [projects/lexico/lexico-api/src/modules/words/words.service.ts:93]
   ↳ Returns every morphological form linked to the given word surface.
  └─> WordsService.findByData(data: string): Promise<null | Word> [projects/lexico/lexico-api/src/modules/words/words.service.ts:41]
     ↳ Returns a single surface word and all of its morphological and lexical links.
```

**52. `WordsService.findLexemeLinksByData`** — depth 2 · orphan-root

```text
🚀 WordsService.findLexemeLinksByData(data: string): Promise<WordLexeme[]> [projects/lexico/lexico-api/src/modules/words/words.service.ts:101]
   ↳ Returns the word-lexeme junction rows for the given surface word.
  └─> WordsService.findByData(data: string): Promise<null | Word> [projects/lexico/lexico-api/src/modules/words/words.service.ts:41]
     ↳ Returns a single surface word and all of its morphological and lexical links.
```

**53. `LexemeWordFormLoader.anonymous`** — depth 2 · orphan-root

```text
🚀 LexemeWordFormLoader.anonymous(lexemeIds: readonly string[]): Promise<WordForm[][]> [projects/lexico/lexico-api/src/modules/words/lexeme-word-form.loader.ts:28]
  └─> WordsService.findWordFormsByLexemeIds(lexemeIds: readonly string[]): Promise<WordForm[]> [projects/lexico/lexico-api/src/modules/words/words.service.ts:133]
     ↳ Finds every word-form link of the given lexemes in one query, each with its form and word joined and the form's lexeme…
```

**54. `main`** — depth 2 · orphan-root

```text
🚀 main(): Promise<void> [projects/lexico/lexico-api/src/lexico-api.ts:16]
   ↳ Bootstraps the NestJS GraphQL API application.
  └─> registerShutdownHandler(…)(): Promise<void> [projects/lexico/lexico-api/src/lexico-api.ts:38]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SearchService.describeLatinMatches` | 11 | `SearchService.map(…)`, `SearchService.filter(…)`, `SearchService.filter(…)`, `SearchService.map(…)`, `SearchService.filter(…)`, `SearchService.forEach(…)`, `SearchService.map(…)`, `SearchService.filter(…)`, `SearchService.flatMap(…)`, `SearchService.filter(…)`, `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:106` |
| `paginateQuery` | 8 | `readCount`, `readPage`, `decodeCursor`, `slicePage`, `loadInOrder`, `map(…)`, `createConnection`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:54` |
| `SearchService.searchLatin` | 7 | `MacronsService.removeMacrons`, `createEmptyConnection`, `decomposeEnclitic`, `SearchService.paginateRankedLexemes(…)`, `SearchService.paginateRankedLexemes`, `SearchService.rankLatinMatches`, `SearchService.logSearch` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:458` |

<details>
<summary>108 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SearchService.rankLatinMatches` | 6 | `SearchService.headwordOrWordMatches`, `SearchService.translatedCondition`, `SearchService.rankLemmaPattern`, `maximumFuzzyDistance`, `SearchService.rankFuzzyMatches`, `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:347` |
| `paginateQueryByParent` | 5 | `readCount`, `findCursorPositions`, `countPartitions`, `loadPartitionPages`, `assembleConnection` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:86` |
| `SearchService.searchEnglish` | 5 | `createEmptyConnection`, `SearchService.paginateRankedLexemes(…)`, `SearchService.paginateRankedLexemes`, `SearchService.rankEnglishMatches`, `SearchService.logSearch` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:428` |
| `toLexemeType` | 4 | `toDeletableFields`, `mapRelationConnection`, `mapNullableRelation`, `mapNullableRelationConnection` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:26` |
| `LiteratureService.searchLiterature` | 4 | `createEmptyConnection`, `LiteratureService.searchAuthors`, `LiteratureService.searchTexts`, `LiteratureService.searchLines` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:259` |
| `toTextType` | 3 | `toDeletableFields`, `mapRelation`, `mapNullableRelation` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:153` |
| `toTokenType` | 3 | `toDeletableFields`, `mapRelation`, `mapNullableRelation` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:165` |
| `loadInOrder` | 3 | `map(…)`, `map(…)`, `flatMap(…)` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:210` |
| `countPartitions` | 3 | `windowCondition`, `toRowKey`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:164` |
| `findCursorPositions` | 3 | `readCursorId`, `filter(…)`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:204` |
| `SearchService.paginateRankedLexemes` | 3 | `paginateQuery`, `SearchService.mapConnection(…)`, `mapConnection` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:220` |
| `SearchService.load` | 3 | `SearchService.createLexemeQuery`, `SearchService.map(…)`, `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:246` |
| `transform(…)` | 2 | `filter(…)`, `map(…)` | `projects/lexico/lexico-api/src/lexico-api.constants.ts:14` |
| `LexemesResolver.lexeme` | 2 | `LexemesService.findById`, `toLexemeType` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:26` |
| `LexemesResolver.lexemes` | 2 | `LexemesService.findByIds`, `LexemesResolver.map(…)` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:41` |
| `toWordFormType` | 2 | `toDeletableFields`, `mapRelation` | `projects/lexico/lexico-api/src/modules/words/words.utilities.ts:33` |
| `toWordLexemeType` | 2 | `toDeletableFields`, `mapRelation` | `projects/lexico/lexico-api/src/modules/words/words.utilities.ts:41` |
| `toWordType` | 2 | `toDeletableFields`, `mapRelationConnection` | `projects/lexico/lexico-api/src/modules/words/words.utilities.ts:49` |
| `map(…)` | 2 | `createEdge`, `encodeCursor` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:77` |
| `readCursorId` | 2 | `fromCursorSafe`, `toCursor` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:98` |
| `toLineType` | 2 | `toDeletableFields`, `mapRelation` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:141` |
| `map(…)` | 2 | `map(…)`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:226` |
| `anonymous` | 2 | `toPaginationKey`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:41` |
| `map(…)` | 2 | `map(…)`, `createEmptyConnection` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:61` |
| `assembleConnection` | 2 | `createConnection`, `map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:134` |
| `map(…)` | 2 | `createEdge`, `toCursor` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:150` |
| `loadPartitionPages` | 2 | `windowCondition`, `pageCondition` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:241` |
| `LiteratureRelationsLoader.anonymous` | 2 | `LiteratureRelationsService.findParentTexts`, `LiteratureRelationsLoader.map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:46` |
| `LiteratureService.listLinesConnection` | 2 | `createEmptyConnection`, `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:103` |
| `LiteratureService.searchAuthors` | 2 | `createEmptyConnection`, `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:202` |
| `LiteratureService.searchLines` | 2 | `createEmptyConnection`, `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:228` |
| `LiteratureService.searchTexts` | 2 | `createEmptyConnection`, `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:285` |
| `AuthorsResolver.author` | 2 | `LiteratureService.findAuthorByLookup`, `toAuthorType` | `projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:47` |
| `AuthorsResolver.authors` | 2 | `mapConnection`, `LiteratureService.listAuthorsConnection` | `projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:68` |
| `AuthorsResolver.searchAuthors` | 2 | `mapConnection`, `LiteratureService.searchAuthors` | `projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:99` |
| `LinesResolver.lines` | 2 | `LiteratureService.listLinesConnection`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:47` |
| `LinesResolver.searchLines` | 2 | `LiteratureService.searchLines`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:63` |
| `LiteratureResolver.searchLiterature` | 2 | `LiteratureService.searchLiterature`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/literature.resolver.ts:26` |
| `TextsResolver.searchTexts` | 2 | `LiteratureService.searchTexts`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:102` |
| `TextsResolver.text` | 2 | `LiteratureService.findTextByLookup`, `toTextType` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:117` |
| `TextsResolver.texts` | 2 | `LiteratureService.listTextsConnection`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:136` |
| `TokensResolver.tokens` | 2 | `LiteratureService.listTokensForLineConnection`, `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/tokens.resolver.ts:29` |
| `readSearchCursor` | 2 | `fromCursorSafe`, `toCursor` | `projects/lexico/lexico-api/src/modules/search/search.utilities.ts:105` |
| `SearchService.map(…)` | 2 | `toLatinMatchSource`, `fuzzyScoreToDistance` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:157` |
| `SearchService.encode` | 2 | `toCursor`, `toRankedScore` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:231` |
| `SearchResolver.searchEnglish` | 2 | `mapConnection`, `SearchService.searchEnglish` | `projects/lexico/lexico-api/src/modules/search/search.resolver.ts:31` |
| `SearchResolver.searchLatin` | 2 | `mapConnection`, `SearchService.searchLatin` | `projects/lexico/lexico-api/src/modules/search/search.resolver.ts:47` |
| `WordsService.findByDataList` | 2 | `WordsService.map(…)`, `WordsService.flatMap(…)` | `projects/lexico/lexico-api/src/modules/words/words.service.ts:52` |
| `LexemeWordFormLoader.anonymous` | 2 | `WordsService.findWordFormsByLexemeIds`, `LexemeWordFormLoader.map(…)` | `projects/lexico/lexico-api/src/modules/words/lexeme-word-form.loader.ts:28` |
| `WordLinkLoader.anonymous` | 2 | `WordLinkLoader.loadWords`, `WordsService.findWordFormsByIds` | `projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:28` |
| `WordLinkLoader.anonymous` | 2 | `WordLinkLoader.loadWords`, `WordsService.findWordLexemesByIds` | `projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:36` |
| `WordLinkLoader.loadWords` | 2 | `WordLinkLoader.map(…)`, `WordLinkLoader.map(…)` | `projects/lexico/lexico-api/src/modules/words/word-link.loader.ts:49` |
| `WordsResolver.word` | 2 | `WordsService.findByData`, `toWordType` | `projects/lexico/lexico-api/src/modules/words/words.resolver.ts:26` |
| `WordsResolver.words` | 2 | `WordsService.findByDataList`, `WordsResolver.map(…)` | `projects/lexico/lexico-api/src/modules/words/words.resolver.ts:41` |
| `toFormType` | 1 | `toNonFiniteFormType` | `projects/lexico/lexico-api/src/modules/lexemes/forms/forms.utilities.ts:29` |
| `toNonFiniteFormType` | 1 | `toVerbalNounFormType` | `projects/lexico/lexico-api/src/modules/lexemes/forms/forms.utilities.ts:59` |
| `toInflectionType` | 1 | `toInvariableInflectionType` | `projects/lexico/lexico-api/src/modules/lexemes/inflections/inflections.utilities.ts:25` |
| `toPrincipalPartType` | 1 | `toDeletableFields` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:51` |
| `toPronunciationType` | 1 | `toDeletableFields` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:62` |
| `toTranslationType` | 1 | `toDeletableFields` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.utilities.ts:75` |
| `LexemesResolver.map(…)` | 1 | `toLexemeType` | `projects/lexico/lexico-api/src/modules/lexemes/lexemes.resolver.ts:49` |
| `toLexemeWordFormType` | 1 | `toFormType` | `projects/lexico/lexico-api/src/modules/words/words.utilities.ts:24` |
| `createEmptyConnection` | 1 | `createConnection` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:37` |
| `toAuthorType` | 1 | `toDeletableFields` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:132` |
| `decodeCursor` | 1 | `readCursorId` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:182` |
| `encodeCursor` | 1 | `toCursor` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:197` |
| `readPage` | 1 | `selectClaimedRow` | `projects/lexico/lexico-api/src/modules/literature/literature.utilities.ts:248` |
| `createConnectionLoader` | 1 | `anonymous` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:34` |
| `toRequestKey` | 1 | `toPaginationKey` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:306` |
| `windowCondition` | 1 | `toRowKey` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.utilities.ts:321` |
| `LiteratureRelationsService.findParentTexts` | 1 | `LiteratureRelationsService.map(…)` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:60` |
| `LiteratureRelationsService.listChildTextsByParent` | 1 | `paginateQueryByParent` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:75` |
| `LiteratureRelationsService.load` | 1 | `LiteratureRelationsService.selectTexts` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:82` |
| `LiteratureRelationsService.listLinesByText` | 1 | `paginateQueryByParent` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:94` |
| `LiteratureRelationsService.listTextsByAuthor` | 1 | `paginateQueryByParent` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:118` |
| `LiteratureRelationsService.load` | 1 | `LiteratureRelationsService.selectTexts` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:125` |
| `LiteratureRelationsService.listTokensByLine` | 1 | `paginateQueryByParent` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.service.ts:140` |
| `LiteratureRelationsLoader.createConnectionLoader(…)` | 1 | `LiteratureRelationsService.listChildTextsByParent` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:31` |
| `LiteratureRelationsLoader.createConnectionLoader(…)` | 1 | `LiteratureRelationsService.listLinesByText` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:40` |
| `LiteratureRelationsLoader.createConnectionLoader(…)` | 1 | `LiteratureRelationsService.listTextsByAuthor` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:56` |
| `LiteratureRelationsLoader.createConnectionLoader(…)` | 1 | `LiteratureRelationsService.listTokensByLine` | `projects/lexico/lexico-api/src/modules/literature/literature-relations.loader.ts:62` |
| `LiteratureService.listAuthorsConnection` | 1 | `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:87` |
| `LiteratureService.listTextsConnection` | 1 | `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:147` |
| `LiteratureService.listTokensForLineConnection` | 1 | `paginateQuery` | `projects/lexico/lexico-api/src/modules/literature/literature.service.ts:180` |
| `AuthorsResolver.resolveAuthorTexts` | 1 | `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/authors.resolver.ts:82` |
| `LinesResolver.tokensForLine` | 1 | `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/lines.resolver.ts:84` |
| `TextsResolver.childTexts` | 1 | `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:49` |
| `TextsResolver.linesForText` | 1 | `mapConnection` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:67` |
| `TextsResolver.parentText` | 1 | `mapNullableRelation` | `projects/lexico/lexico-api/src/modules/literature/texts.resolver.ts:85` |
| `formatFormIdentifier` | 1 | `formatDeclinedForm` | `projects/lexico/lexico-api/src/modules/search/search.utilities.ts:66` |
| `toLexemeSearchResult` | 1 | `toLexemeType` | `projects/lexico/lexico-api/src/modules/search/search.utilities.ts:139` |
| `formatDeclinedForm` | 1 | `formatNonFiniteForm` | `projects/lexico/lexico-api/src/modules/search/search.utilities.ts:163` |
| `SearchService.map(…)` | 1 | `formatFormIdentifier` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:140` |
| `SearchService.flatMap(…)` | 1 | `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:154` |
| `SearchService.logSearch` | 1 | `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:200` |
| `SearchService.map(…)` | 1 | `toRankedScore` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:251` |
| `SearchService.rankFuzzyMatches` | 1 | `SearchService.distance` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:319` |
| `SearchService.paginateRankedLexemes(…)` | 1 | `SearchService.map(…)` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:441` |
| `SearchService.map(…)` | 1 | `toEnglishMatchSource` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:442` |
| `SearchService.paginateRankedLexemes(…)` | 1 | `SearchService.describeLatinMatches` | `projects/lexico/lexico-api/src/modules/search/search.service.ts:478` |
| `WordsService.findFormsByData` | 1 | `WordsService.findByData` | `projects/lexico/lexico-api/src/modules/words/words.service.ts:93` |
| `WordsService.findLexemeLinksByData` | 1 | `WordsService.findByData` | `projects/lexico/lexico-api/src/modules/words/words.service.ts:101` |
| `LexemeWordFormResolver.wordForms` | 1 | `mapRelationConnection` | `projects/lexico/lexico-api/src/modules/words/lexeme-word-form.resolver.ts:39` |
| `WordFormResolver.word` | 1 | `toWordType` | `projects/lexico/lexico-api/src/modules/words/word-form.resolver.ts:28` |
| `WordLexemeResolver.word` | 1 | `toWordType` | `projects/lexico/lexico-api/src/modules/words/word-lexeme.resolver.ts:29` |
| `WordsResolver.map(…)` | 1 | `toWordType` | `projects/lexico/lexico-api/src/modules/words/words.resolver.ts:49` |
| `HealthResolver.health` | 1 | `HealthService.isHealthy` | `projects/lexico/lexico-api/src/modules/health/health.resolver.ts:22` |
| `main` | 1 | `registerShutdownHandler(…)` | `projects/lexico/lexico-api/src/lexico-api.ts:16` |

</details>
<!-- callidescope:end -->
