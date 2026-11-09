# 📖 Lexico Entities

**The dictionary's shape.** TypeORM entities, PostgreSQL migrations, and the
shared enumerations for [Lexico](../lexico-web/README.md).

This package is the single definition of what a Latin word _is_ in this suite.
[lexico-cli](../lexico-cli/README.md) writes
through these entities, and [lexico-api](../lexico-api/README.md)
reads through them, so neither carries its own idea of the schema.

The entities are the database's model only: nothing here is a GraphQL type.
lexico-api declares its own GraphQL object types, each checked at compile time
against the entity it exposes, so a consumer with no GraphQL server, such as
lexico-cli, never depends on `@nestjs/graphql`.

## Usage

```ts
import { DatabaseModule, Lexeme, Word } from "@codebase/lexico-db";
```

`DatabaseModule` connects to `lexico_development`.`lexico` as
`lexico_username` through [`@codebase/persistence`](../../common/persistence/README.md)'s
`DatabaseModule.forRoot`, with its shared plural snake-case naming strategy.
`lexicoDataSource`, in `src/modules/database/data-source.constants.ts`,
is the same configuration as a standalone `DataSource`, built with the shared
`createDataSource`, which is what the migration command line runs against.
Neither synchronizes nor runs migrations on start, so only the data source and
the test harness are given `LEXICO_DATABASE_MIGRATIONS`.

Both read only `LEXICO_POSTGRES_*`, never the root's unprefixed `POSTGRES_*`,
which are the shared container's admin login. The importing application's
`ConfigModule` must be global.

| Variable                   | Default              |
| -------------------------- | -------------------- |
| `LEXICO_POSTGRES_HOST`     | `localhost`          |
| `LEXICO_POSTGRES_PORT`     | `5432`               |
| `LEXICO_POSTGRES_USERNAME` | `lexico_username`    |
| `LEXICO_POSTGRES_PASSWORD` | `lexico_password`    |
| `LEXICO_POSTGRES_DATABASE` | `lexico_development` |
| `LEXICO_POSTGRES_SCHEMA`   | `lexico`             |

## The schema

### Dictionary

| Entity | Holds |
| ------ | ----- |
| `Word` | A headword — the form a reader looks up |
| `Lexeme` | A lexical entry, joined to words through `WordLexeme` |
| `Form` | One inflected form, joined to words through `WordForm` |
| `Inflection` | How a lexeme inflects |
| `PrincipalPart` | The principal parts a verb or noun is cited by |
| `Translation` | An English sense |
| `Pronunciation` | Classical and ecclesiastical variants |

`Form` and `Inflection` are both **single-table hierarchies**, because Latin
morphology does not fit one flat row. A form is an `AdjectivalForm`,
`AdverbForm`, `FiniteVerbForm`, `GerundForm`, `InfinitiveForm`, `NominalForm`,
`ParticipleForm`, or `SupineForm`; an inflection is an `AdjectiveInflection`,
`AdverbInflection`, `NounInflection`, `PrepositionInflection`,
`VerbInflection`, or `UninflectedInflection`.

### Literature

| Entity | Holds |
| ------ | ----- |
| `Author` | A classical author |
| `Text` | One work |
| `Line` | A line of that work |
| `Token` | One word occurrence, linking a line back to the dictionary |

### Base classes

Every entity but `Inflection` extends
[`@codebase/persistence`](../../common/persistence/README.md)'s `PostgresqlDeletableEntity` directly. It
declares the columns — a `uuid` id the database assigns with `uuidv7()`, then
the created, updated, and soft-deleted timestamps and their nullable `*By`
columns — so no entity restates them.
Rows restored from before the move keep their version 4 ids; new rows get
version 7.

No entity names a schema: it comes from `LEXICO_POSTGRES_SCHEMA`.

## Grammatical enumerations

Every grammatical axis is exported both as a runtime value array and as a
union type — `formCaseValues` / `FormCase`, `verbConjugationValues` /
`VerbConjugation`, and so on for gender, number, person, tense, mood, voice,
degree, and declension. Validation, GraphQL enums, and exhaustive switches all
read from the same source.

The shared plural snake-case naming strategy in `@codebase/persistence` maps
entity and column names to the database's own convention, so table names stay
predictable across migrations.

## Migrations

```bash
nx run lexico-db:migration:generate           # Diff entities → new migration
nx run lexico-db:migration:run                # Apply pending migrations
nx run lexico-db:migration:revert             # Roll back the last one
nx run lexico-db:migration:show               # List applied and pending
nx run lexico-db:migration:extract-sql-all    # Emit .sql alongside each migration
```

The `migration` target is the shared one from the root `nx.json` target
defaults, declared here as
`"migration": { "options": { "module": "src/modules/database" } }`,
which names the folder holding `data-source.constants.ts` and `migrations/`;
its SQL extraction script lives in
[`@codebase/persistence`](../../common/persistence/README.md).
`generate` also extracts the SQL and formats the result, so a generated
migration lands ready to review. Every migration ships a `-up.sql` and
`-down.sql` next to its TypeScript, which is what makes a schema change
readable in a diff — those files are linted by `sqlfluff` and checked by
`squawk` like any other SQL in the repository.

## Moving local data out of `postgres`.`public`

Lexico's tables used to live in the shared container's default `postgres`
database under `public`. A Docker volume from before
[ADR 0022](../../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)
still holds them there. Moving them into `lexico_development`.`lexico` is a
one-time step, run from the workspace root against the running container,
with `pg_dump`, `pg_restore`, and `psql` 18 on the path. It copies rows
rather than moving them: `public` is left in place, and dropping it is the
maintainer's call once the counts below match.

1. **Back up everything first**, and confirm the file is not empty:

   ```bash
   PGPASSWORD=postgres pg_dump -h localhost -p 5432 -U postgres -Fc -d postgres \
     -f data/complete.dump
   ls -l data/complete.dump
   ```

2. **Create the role, database, and schema** if the volume predates them,
   with the Compose init script. Skip it if the objects already exist; never
   run `infrastructure:postgres:recreate`, which deletes the volume:

   ```bash
   docker exec -e POSTGRES_PROJECTS=lexico postgres sh /docker-entrypoint-initdb.d/databases.sh
   ```

3. **Dump `public`'s rows alone** with the database command line, naming
   Lexico's tables so TypeORM's own bookkeeping — its metadata and, on a
   volume where the old migration ever ran, its migrations table — stays
   behind; the new migration writes both for `lexico`. The path is relative
   to `projects/common/persistence`, where the command runs. See
   [Moving data between databases](../../common/persistence/README.md#moving-data-between-databases):

   ```bash
   pnpm exec nx run persistence:start:postgresql-export --args="--source-uri postgresql://postgres:postgres@localhost:5432/postgres --schema public --table authors --table forms --table inflections --table lexemes --table lines --table principal_parts --table pronunciations --table texts --table tokens --table translations --table word_forms --table word_lexemes --table words --data --file ../../data/lexico-public.dump"
   ```

4. **Build the empty schema** with the migration, as `lexico_username`:

   ```bash
   nx run lexico-db:migration:run
   ```

5. **Restore the rows into `lexico`.** `pg_restore` cannot rename a schema, so
   render the archive's `-n public` entries as SQL and point each `COPY` and
   `ALTER TABLE` line at `lexico`; no data line can start with either, since
   every table's first column is a `uuid`. It runs as the admin login because
   `texts` references itself, and loading such a table's rows takes
   `--disable-triggers`, which only a superuser may use:

   ```bash
   PGPASSWORD=postgres pg_restore --data-only --disable-triggers -n public \
     -f - data/lexico-public.dump \
     | sed -E 's/^(COPY|ALTER TABLE) public\./\1 lexico./' \
     | PGPASSWORD=postgres psql -h localhost -U postgres -d lexico_development \
       --single-transaction -v ON_ERROR_STOP=1 -q
   ```

6. **Compare every table's row count** in both schemas; `diff` printing
   nothing means every table matches:

   ```bash
   row_counts() {
     PGPASSWORD=postgres psql -h localhost -U postgres -d "$1" -At -v schema="$2" <<'SQL'
   SELECT
     table_name,
     (xpath('/row/c/text()', query_to_xml(
       format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name),
       FALSE, TRUE, ''
     )))[1]::text::bigint AS row_count
   FROM information_schema.tables
   WHERE table_schema = :'schema'
     AND table_type = 'BASE TABLE'
     AND table_name NOT IN ('migrations', 'typeorm_metadata')
   ORDER BY table_name;
   SQL
   }

   diff <(row_counts postgres public) <(row_counts lexico_development lexico)
   ```

Restored rows keep their version 4 ids; rows written afterwards get the
`uuidv7()` default.

## Testing

```bash
nx run lexico-db:vitest:unit
nx run lexico-db:vitest:integration   # Against a Testcontainers PostgreSQL
```

Integration tests start a throwaway Postgres 18 through
[`@codebase/persistence/testing`](../../common/persistence/README.md), laid out like local
Docker: `lexico_username` owning `lexico_testing` with a `lexico` schema. The
schema is built by running the real migrations, never by synchronizing, and
the suite asserts the entities have nothing left to change, so entity mappings
and migrations are verified against the database rather than against a mock.

## Related

- 🐺 [lexico-web](../lexico-web/README.md) — the web application
- 🚰 [lexico-cli](../lexico-cli/README.md) — fills these tables
- 🎨 [presentation](../../common/presentation/README.md) — the interface

## License

MIT — see [LICENSE](../../../LICENSE).

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-db:coinagerie-check:write`.

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
