# lexico-api

The GraphQL API behind the Lexico web app: dictionary lexeme lookup, search across Latin forms and English translations, word resolution, literature, and macron handling, all read from the Lexico Postgres through `LexicoDatabaseModule` from `@codebase/lexico-db`.

## Stack

- **GraphQL server**: Apollo Server via `@nestjs/apollo` (`ApolloDriver`).
- **Schema**: code-first, emitted to `src/schema.gql` beside the root module (`GRAPHQL_SCHEMA_FILE`), whatever the working directory; the file is gitignored.
- **Pagination**: Relay connections built with `@codebase/interface` (`createConnection`, `mapConnection`); see the `write-nestjs` skill's GraphQL reference.
- **Dataloaders**: `dataloader`, request-scoped, so a relation field makes one batched query rather than one per parent.
- **CORS**: `CorsModule` (`modules/cors`) provides the options the bootstrap enables, from `LEXICO_API_CORS_ORIGINS` (comma separated). No origin is allowed until you list one, so a browser app on another origin is refused by default; `*` allows every origin and suits only a public API.

## Modules

- `cors/` — works out the CORS options the browser's preflight is answered with (`CorsService`).
- `health/` — the health check query (`HealthService`).
- `lexemes/` — dictionary lexeme lookup queries (`LexemesService`).
- `literature/` — author, text, line, and token literature resolution (`LiteratureService`).
- `macrons/` — handles Latin vowel-length marks on text crossing the API boundary (`MacronsService`).
- `search/` — dictionary search across Latin forms and English translations (`SearchService`).
- `words/` — resolves surface Latin words to their lexical and morphological mapping (`WordsService`).
