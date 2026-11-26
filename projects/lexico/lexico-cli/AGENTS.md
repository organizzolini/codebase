# lexico-cli

Ingest Wiktionary Latin dictionary data into PostgreSQL, parsing HTML pages into structured `Lexeme`, `Translation`, `Form`, and `Word` records.

- **Database**: PostgreSQL via TypeORM (`@codebase/lexico-db`)

```text
src/lexico-cli.main.ts
  └─ CommandFactory.run(LexicoIngestionModule)
       └─ LexicoIngestionCommand.run()
            ├─ Step 1: ClearService.clearDictionary()
            ├─ Step 2: WiktionaryService.ingestWiktionary()
            ├─ Step 3: DictionaryService.ingestAll()
            └─ Step 4: ManualService.ingestManual()
```

Sub-commands: `wiktionary`, `dictionary`, `words`, `clear`

**Project Modules**:

```text
src/modules/
  lexico-ingestion/                        # Root command wiring every ingestion source
    modules/
      clear/                               # Truncates all dictionary tables
      dictionary/                          # Orchestrates full Wiktionary → Lexeme pipeline
      literature/                          # Ingests literature texts
      wiktionary/                          # Downloads and stores raw Wiktionary pages
  library/                                 # Fetches literature library sources
    modules/
      corpus-scriptorum-ecclesiasticorum-latinorum/
      epigraphik-datenbank-clauss-slaby/
      latin-library/
      perseus/
  lexemes/                                 # Creates and saves Lexeme entities
    modules/
      etymology/                           # Parses etymology sections
      forms/                               # Parses inflection tables
      part-of-speech/                      # Detects POS from Wiktionary HTML
      principal-parts/                     # Parses principal parts
      pronunciation/                       # Parses pronunciation data
      translations/                        # Parses and saves Translation entities
      words/                               # Creates and saves Word entities
  manual/                                  # Ingests manually curated entries
  numerals/                                # Parses numerals
```

## Environment Variables

All validated via `environmentSchema` in `lexico-cli.constants.ts`, which spreads
`postgresEnvironmentSchema({ project: "lexico" })` from `@codebase/persistence`.
The root's unprefixed `POSTGRES_*` are the shared container's admin login and
are never read:

| Variable                   | Default              | Description                               |
| -------------------------- | -------------------- | ----------------------------------------- |
| `LEXICO_POSTGRES_HOST`     | `localhost`          | PostgreSQL host                           |
| `LEXICO_POSTGRES_PORT`     | `5432`               | PostgreSQL port                           |
| `LEXICO_POSTGRES_USERNAME` | `lexico_username`    | PostgreSQL role                           |
| `LEXICO_POSTGRES_PASSWORD` | `lexico_password`    | PostgreSQL password                       |
| `LEXICO_POSTGRES_DATABASE` | `lexico_development` | PostgreSQL database name                  |
| `LEXICO_POSTGRES_SCHEMA`   | `lexico`             | PostgreSQL schema holding lexico's tables |

1. **Implement the root command** — add logic to `lexico-ingestion.command.ts` `run()`, or delegate to injected services.
2. **Extend the pipeline** — add new steps to `LexicoIngestionCommand.run()`, or add sub-commands.
3. **Add domain command modules** — create `src/modules/<domain>/` with a NestJS module, command, service, types, and constants.
4. **Register in root module** — import the new module in `lexico-cli.module.ts`.
5. **Validate env vars** — extend `environmentSchema` in `lexico-cli.constants.ts` with all required environment variables.

Project-specific integration tests also cover Wiktionary HTML parsing.

### Cheerio parsers

Parser and service tests load real Cheerio documents rather than mocking the module. The helpers in [`testing/mocks.ts`](testing/mocks.ts) build them and throw a clear error when a required node is missing:

| Helper                                 | Returns                                 |
| -------------------------------------- | --------------------------------------- |
| `loadCheerioWithRoot(html)`            | `{ $, rootElement }` for an HTML string |
| `loadCheerioXmlWithRoot(xml)`          | `{ $, rootElement }` for an XML string  |
| `loadCheerioElement(html, selector)`   | `{ $, element }` for the selected node  |
| `loadCheerioXmlElement(xml, selector)` | `{ $, element }` for the selected node  |

```ts
const { $, element } = loadCheerioElement('<p id="entry">word</p>', "#entry");
const result = parser.parse({ $, elt: element, ...context });
```

Keep each fixture snippet minimal and specific to its assertion, cover both the node-found and node-missing paths of a selector, and exercise fallback branches with sparse or malformed markup rather than broad snapshots.

## Moving Data Between Databases

Lexico tables move between databases through the persistence package's command
line, not this one: `nx run persistence:start:postgresql-export|postgresql-import`, with
`--schema lexico --table words` (or `--table lexico.words`). Run
`postgresql-import --dry-run` before `postgresql-import --clean`, which never asks. See the
[database README](../../common/persistence/README.md#moving-data-between-databases).

**Project Files**:

- `lexico-ingestion.command.ts` includes pipeline orchestration
- `lexico-ingestion.constants.ts` includes `LEXICO_INGESTION_BY_ID`
