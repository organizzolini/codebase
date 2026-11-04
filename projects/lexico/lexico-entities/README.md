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
import { DatabaseModule, Lexeme, Word } from "@codebase/lexico-entities";
```

`DatabaseModule` connects to `lexico_development`.`lexico` as
`lexico_username` through [`@codebase/persistence`](../../common/persistence/README.md)'s
`DatabaseModule.forRoot`, with lexico's pluralizing `LexicoNamingStrategy`.
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

`LexicoNamingStrategy` maps entity and column names to the database's own
convention, so table names stay predictable across migrations.

## Migrations

```bash
nx run lexico-entities:migration:generate           # Diff entities → new migration
nx run lexico-entities:migration:run                # Apply pending migrations
nx run lexico-entities:migration:revert             # Roll back the last one
nx run lexico-entities:migration:show               # List applied and pending
nx run lexico-entities:migration:extract-sql-all    # Emit .sql alongside each migration
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
   nx run lexico-entities:migration:run
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
nx run lexico-entities:vitest:unit
nx run lexico-entities:vitest:integration   # Against a Testcontainers PostgreSQL
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

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/lexico/lexico-entities`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 20 |
| Files | 44 |
| Calls traced | 0 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 3 |
| `maximumBreadth` | 3 |

### Call stacks (depth)

None.

### Breadth

None.
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  lexico_api["lexico-api"]
  lexico_cli["lexico-cli"]
  lexico_entities["lexico-entities"]
  persistence["persistence"]
  lexico_api --> lexico_entities
  lexico_cli --> lexico_entities
  lexico_entities --> persistence
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class lexico_entities subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  DatabaseModule
  EntitiesModule
  PostgresqlModule
  TypeOrmModule
  DatabaseModule --> PostgresqlModule
  PostgresqlModule --> TypeOrmModule
```
<!-- codependix:end name="codependix-nestjs-modules" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_coinagerie_config_ts["coinagerie.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_src_index_ts["src/index.ts"]
  file_src_modules_database_data_source_constants_ts["src/modules/database/data-source.constants.ts"]
  file_src_modules_database_data_source_constants_unit_test_ts["src/modules/database/data-source.constants.unit.test.ts"]
  file_src_modules_database_database_constants_ts["src/modules/database/database.constants.ts"]
  file_src_modules_database_database_module_ts["src/modules/database/database.module.ts"]
  file_src_modules_database_database_service_ts["src/modules/database/database.service.ts"]
  file_src_modules_database_database_service_unit_test_ts["src/modules/database/database.service.unit.test.ts"]
  file_src_modules_database_database_types_ts["src/modules/database/database.types.ts"]
  file_src_modules_database_migrations_1791164926316_migration_ts["src/modules/database/migrations/1791164926316-migration.ts"]
  file_src_modules_database_migrations_1792000000000_migration_ts["src/modules/database/migrations/1792000000000-migration.ts"]
  file_src_modules_entities_dictionary_form_adjectival_form_entity_ts["src/modules/entities/dictionary/form/adjectival-form.entity.ts"]
  file_src_modules_entities_dictionary_form_adverb_form_entity_ts["src/modules/entities/dictionary/form/adverb-form.entity.ts"]
  file_src_modules_entities_dictionary_form_finite_verb_form_entity_ts["src/modules/entities/dictionary/form/finite-verb-form.entity.ts"]
  file_src_modules_entities_dictionary_form_form_entity_ts["src/modules/entities/dictionary/form/form.entity.ts"]
  file_src_modules_entities_dictionary_form_gerund_form_entity_ts["src/modules/entities/dictionary/form/gerund-form.entity.ts"]
  file_src_modules_entities_dictionary_form_infinitive_form_entity_ts["src/modules/entities/dictionary/form/infinitive-form.entity.ts"]
  file_src_modules_entities_dictionary_form_nominal_form_entity_ts["src/modules/entities/dictionary/form/nominal-form.entity.ts"]
  file_src_modules_entities_dictionary_form_participle_form_entity_ts["src/modules/entities/dictionary/form/participle-form.entity.ts"]
  file_src_modules_entities_dictionary_form_supine_form_entity_ts["src/modules/entities/dictionary/form/supine-form.entity.ts"]
  file_src_modules_entities_dictionary_inflection_adjective_inflection_entity_ts["src/modules/entities/dictionary/inflection/adjective-inflection.entity.ts"]
  file_src_modules_entities_dictionary_inflection_adverb_inflection_entity_ts["src/modules/entities/dictionary/inflection/adverb-inflection.entity.ts"]
  file_src_modules_entities_dictionary_inflection_inflection_entity_ts["src/modules/entities/dictionary/inflection/inflection.entity.ts"]
  file_src_modules_entities_dictionary_inflection_noun_inflection_entity_ts["src/modules/entities/dictionary/inflection/noun-inflection.entity.ts"]
  file_src_modules_entities_dictionary_inflection_preposition_inflection_entity_ts["src/modules/entities/dictionary/inflection/preposition-inflection.entity.ts"]
  file_src_modules_entities_dictionary_inflection_uninflected_entity_ts["src/modules/entities/dictionary/inflection/uninflected.entity.ts"]
  file_src_modules_entities_dictionary_inflection_verb_inflection_entity_ts["src/modules/entities/dictionary/inflection/verb-inflection.entity.ts"]
  file_src_modules_entities_dictionary_lexeme_entity_ts["src/modules/entities/dictionary/lexeme.entity.ts"]
  file_src_modules_entities_dictionary_part_of_speech_entity_ts["src/modules/entities/dictionary/part-of-speech.entity.ts"]
  file_src_modules_entities_dictionary_principal_part_entity_ts["src/modules/entities/dictionary/principal-part.entity.ts"]
  file_src_modules_entities_dictionary_pronunciation_entity_ts["src/modules/entities/dictionary/pronunciation.entity.ts"]
  file_src_modules_entities_dictionary_translation_entity_ts["src/modules/entities/dictionary/translation.entity.ts"]
  file_src_modules_entities_dictionary_word_form_entity_ts["src/modules/entities/dictionary/word-form.entity.ts"]
  file_src_modules_entities_dictionary_word_lexeme_entity_ts["src/modules/entities/dictionary/word-lexeme.entity.ts"]
  file_src_modules_entities_dictionary_word_entity_ts["src/modules/entities/dictionary/word.entity.ts"]
  file_src_modules_entities_entities_constants_ts["src/modules/entities/entities.constants.ts"]
  file_src_modules_entities_entities_constants_unit_test_ts["src/modules/entities/entities.constants.unit.test.ts"]
  file_src_modules_entities_entities_module_integration_test_ts["src/modules/entities/entities.module.integration.test.ts"]
  file_src_modules_entities_entities_module_ts["src/modules/entities/entities.module.ts"]
  file_src_modules_entities_entities_service_integration_test_ts["src/modules/entities/entities.service.integration.test.ts"]
  file_src_modules_entities_entities_service_ts["src/modules/entities/entities.service.ts"]
  file_src_modules_entities_entities_service_unit_test_ts["src/modules/entities/entities.service.unit.test.ts"]
  file_src_modules_entities_entities_types_ts["src/modules/entities/entities.types.ts"]
  file_src_modules_entities_literature_author_entity_ts["src/modules/entities/literature/author.entity.ts"]
  file_src_modules_entities_literature_line_entity_ts["src/modules/entities/literature/line.entity.ts"]
  file_src_modules_entities_literature_text_entity_ts["src/modules/entities/literature/text.entity.ts"]
  file_src_modules_entities_literature_token_entity_ts["src/modules/entities/literature/token.entity.ts"]
  file_testing_entity_definition_assertions_ts["testing/entity-definition-assertions.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_modules_database_data_source_constants_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_database_migrations_1791164926316_migration_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_database_migrations_1792000000000_migration_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_adjectival_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_adverb_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_finite_verb_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_gerund_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_infinitive_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_nominal_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_participle_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_form_supine_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_adjective_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_adverb_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_noun_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_preposition_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_uninflected_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_inflection_verb_inflection_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_principal_part_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_pronunciation_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_translation_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_word_form_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_word_lexeme_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_dictionary_word_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_literature_author_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_literature_line_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_literature_text_entity_ts
  file_src_modules_database_data_source_constants_ts --> file_src_modules_entities_literature_token_entity_ts
  file_src_modules_database_data_source_constants_unit_test_ts --> file_src_modules_database_data_source_constants_ts
  file_src_modules_database_data_source_constants_unit_test_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_data_source_constants_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_database_service_ts
  file_src_modules_database_database_service_unit_test_ts --> file_src_modules_database_database_service_ts
  file_src_modules_database_database_types_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_adjectival_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_adjectival_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_adjectival_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_adverb_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_adverb_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_adverb_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_finite_verb_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_finite_verb_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_finite_verb_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_form_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_form_form_entity_ts --> file_src_modules_entities_dictionary_word_form_entity_ts
  file_src_modules_entities_dictionary_form_gerund_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_gerund_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_gerund_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_infinitive_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_infinitive_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_infinitive_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_nominal_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_nominal_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_nominal_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_participle_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_participle_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_participle_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_form_supine_form_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_form_supine_form_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_form_supine_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_inflection_adjective_inflection_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_inflection_adjective_inflection_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_inflection_adjective_inflection_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_inflection_adverb_inflection_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_inflection_adverb_inflection_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_inflection_adverb_inflection_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_inflection_inflection_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_inflection_noun_inflection_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_inflection_noun_inflection_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_inflection_noun_inflection_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_inflection_preposition_inflection_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_inflection_preposition_inflection_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_inflection_preposition_inflection_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_inflection_uninflected_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_inflection_verb_inflection_entity_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_dictionary_inflection_verb_inflection_entity_ts --> file_src_modules_database_database_types_ts
  file_src_modules_entities_dictionary_inflection_verb_inflection_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_inflection_inflection_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_part_of_speech_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_principal_part_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_pronunciation_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_translation_entity_ts
  file_src_modules_entities_dictionary_lexeme_entity_ts --> file_src_modules_entities_dictionary_word_lexeme_entity_ts
  file_src_modules_entities_dictionary_principal_part_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_pronunciation_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_translation_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_word_form_entity_ts --> file_src_modules_entities_dictionary_form_form_entity_ts
  file_src_modules_entities_dictionary_word_form_entity_ts --> file_src_modules_entities_dictionary_word_entity_ts
  file_src_modules_entities_dictionary_word_lexeme_entity_ts --> file_src_modules_entities_dictionary_lexeme_entity_ts
  file_src_modules_entities_dictionary_word_lexeme_entity_ts --> file_src_modules_entities_dictionary_word_entity_ts
  file_src_modules_entities_dictionary_word_entity_ts --> file_src_modules_entities_dictionary_word_form_entity_ts
  file_src_modules_entities_dictionary_word_entity_ts --> file_src_modules_entities_dictionary_word_lexeme_entity_ts
  file_src_modules_entities_entities_constants_unit_test_ts --> file_src_modules_entities_entities_constants_ts
  file_src_modules_entities_entities_module_ts --> file_src_modules_entities_entities_service_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_database_data_source_constants_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_entities_literature_author_entity_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_entities_literature_line_entity_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_entities_literature_text_entity_ts
  file_src_modules_entities_entities_service_integration_test_ts --> file_src_modules_entities_literature_token_entity_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_src_modules_database_data_source_constants_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_src_modules_entities_dictionary_part_of_speech_entity_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_src_modules_entities_dictionary_pronunciation_entity_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_src_modules_entities_entities_service_ts
  file_src_modules_entities_entities_service_unit_test_ts --> file_testing_entity_definition_assertions_ts
  file_src_modules_entities_literature_author_entity_ts --> file_src_modules_entities_literature_text_entity_ts
  file_src_modules_entities_literature_line_entity_ts --> file_src_modules_entities_entities_constants_ts
  file_src_modules_entities_literature_line_entity_ts --> file_src_modules_entities_literature_author_entity_ts
  file_src_modules_entities_literature_line_entity_ts --> file_src_modules_entities_literature_text_entity_ts
  file_src_modules_entities_literature_line_entity_ts --> file_src_modules_entities_literature_token_entity_ts
  file_src_modules_entities_literature_text_entity_ts --> file_src_modules_entities_literature_author_entity_ts
  file_src_modules_entities_literature_text_entity_ts --> file_src_modules_entities_literature_line_entity_ts
  file_src_modules_entities_literature_token_entity_ts --> file_src_modules_entities_dictionary_word_entity_ts
  file_src_modules_entities_literature_token_entity_ts --> file_src_modules_entities_entities_constants_ts
  file_src_modules_entities_literature_token_entity_ts --> file_src_modules_entities_literature_author_entity_ts
  file_src_modules_entities_literature_token_entity_ts --> file_src_modules_entities_literature_line_entity_ts
  file_src_modules_entities_literature_token_entity_ts --> file_src_modules_entities_literature_text_entity_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-4952-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-212.24_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-10-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-54-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-26.47_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-54-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-8-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-2-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-151-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-102-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-6-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-13-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-36-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-195-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-20-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-187-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-28-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-151-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-211-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-111-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-131-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-232-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-3-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-151-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-41-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-10-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-102-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-77-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-31-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-137-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-7-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-4-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-387-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-337-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-31-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-17-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-18-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-62-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-37-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-2-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-2-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-3-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-2-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-28-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-4-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-2-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-0-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-0-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-0-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-0-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-0-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-0-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-0-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-0-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-0-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-0-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-0-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-0-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-entities:coinagerie-check:write`.

- **0191e**:
- **01b**:
- **01e**:
- **023445108890a**:
- **02e**:
- **03033925e**:
- **045c**:
- **077bd**:
- **099d**:
- **0a**:
- **0b**:
- **0ca**:
- **0e**:
- **0fa**:
- **0fd**:
- **1029749f**:
- **102f**:
- **116e**:
- **1209a**:
- **155ad**:
- **176364b**:
- **1795a**:
- **191c**:
- **198dea**:
- **19cd**:
- **1aa**:
- **1aab**:
- **1aee**:
- **1c**:
- **1cbb**:
- **1d**:
- **1e**:
- **1fb**:
- **209b**:
- **216ae**:
- **2243dcd**:
- **234b**:
- **234ba**:
- **23e**:
- **258ca**:
- **25936d**:
- **2709e**:
- **275807c**:
- **2883c**:
- **2b**:
- **2bc**:
- **2d**:
- **2f**:
- **3001e**:
- **3068fc**:
- **309a**:
- **34738bc**:
- **36263dabf**:
- **366638dd**:
- **37f**:
- **390a**:
- **39313ab**:
- **3a**:
- **3bfcf**:
- **3d**:
- **3e**:
- **3eb**:
- **3f**:
- **40b**:
- **423ad**:
- **43fa**:
- **4478795971e**:
- **44ab**:
- **44faf**:
- **455b**:
- **45ba**:
- **463838022e**:
- **4747c**:
- **479aa**:
- **4839d**:
- **49641fb**:
- **49d**:
- **4a**:
- **4c**:
- **4cc**:
- **4d**:
- **4eccee**:
- **513c**:
- **513daa**:
- **516db**:
- **52ebb**:
- **53b**:
- **54256ad**:
- **551cde**:
- **55f**:
- **5683b**:
- **569c**:
- **579999929ed**:
- **57efb**:
- **5c**:
- **5cadaeb**:
- **5cc**:
- **6210a**:
- **6286a**:
- **62db**:
- **63a**:
- **63c**:
- **643892e**:
- **644ba**:
- **652df**:
- **65a**:
- **6952e**:
- **69b**:
- **69e**:
- **6b**:
- **6c**:
- **6ebfde**:
- **70876dfb**:
- **70d**:
- **725470a**:
- **72915c**:
- **75ceaf**:
- **769cd**:
- **76d**:
- **773610b**:
- **784a**:
- **788f**:
- **794cdcdf**:
- **795d**:
- **79bf**:
- **7a**:
- **7b**:
- **7bf**:
- **7c**:
- **7e**:
- **7ef**:
- **7f**:
- **7fb**:
- **7fdf**:
- **800c**:
- **81c**:
- **865a**:
- **86789cf**:
- **86e**:
- **877e**:
- **87cbd**:
- **88b**:
- **899e**:
- **89ada**:
- **8b**:
- **8ba**:
- **8c**:
- **8d**:
- **8de**:
- **8fc**:
- **903b**:
- **9093c**:
- **90ccb**:
- **9204890678d**:
- **9325e**:
- **9430896d**:
- **94e**:
- **955b**:
- **9561dea**:
- **95d**:
- **965b**:
- **968b**:
- **996c**:
- **9a**:
- **9bc**:
- **9ca**:
- **9d**:
- **9f**:
- **a0**:
- **a08**:
- **a1**:
- **a15**:
- **a1872**:
- **a3**:
- **a3450**:
- **a4**:
- **a5**:
- **a5664**:
- **a60756**:
- **a65192**:
- **a7**:
- **a70**:
- **a801**:
- **a9**:
- **a90**:
- **aa0**:
- **ab78**:
- **abbreviation**: Part-of-speech value for abbreviated entries, stored in the lexemes part_of_speech enum beside adjective, noun, and verb.
- **ablative**: Case value in the forms case enum, also allowed for gerund, supine, and preposition cases in this package.
- **aca248**:
- **accb69**:
- **accusative**: Case value in the forms case enum, also allowed for gerund, supine, and preposition cases in this package.
- **adjectival**: Form kind for the AdjectivalForm entity, one single-table child of the forms hierarchy for adjective forms.
- **adjective**: Part-of-speech value and inflection kind here, covered by the AdjectiveInflection entity and adjective declension enum.
- **adverb**: Part-of-speech value for adverbs, with its own AdverbForm and AdverbInflection entities in the dictionary.
- **ae1**:
- **afa**: Hexadecimal fragment of a generated hash, uuid, or TypeORM IDX index name in this package's migrations, not a real word.
- **afa9**:
- **alway**: Lemmatizer fragment of the SQL keyword ALWAYS in GENERATED ALWAYS AS, which computes the translations tsvector column.
- **auditable**: Test-helper vocabulary for entities whose created, updated, and deleted audit columns must match an expected shape.
- **b06814**:
- **b1**:
- **b2**:
- **b3**:
- **b33**:
- **b3302**:
- **b52847**:
- **b7**:
- **b8**:
- **b8633**:
- **b88**:
- **ba062**:
- **bb44**:
- **bba7**:
- **bc0**:
- **be3**:
- **be34**:
- **bf4**:
- **breadth**: Heading of the callidescope breadth section in this README, currently None, so no breadth limit is measured here.
- **c0**:
- **c1**:
- **c121**:
- **c148**:
- **c157882**:
- **c16**:
- **c22**:
- **c3**:
- **c3172**:
- **c4**:
- **c564**:
- **c57**:
- **c6**:
- **c62679**:
- **c678**:
- **c7**:
- **c72**:
- **c8**:
- **c89**:
- **c92**:
- **ca25**:
- **ca45**:
- **cascade**: Foreign-key behavior in the migrations, ON DELETE CASCADE, so deleting a parent row also removes its dependent rows.
- **cb28**:
- **cc8536**:
- **ccb85**:
- **ccf78**:
- **cd4**:
- **cd7**:
- **cd87**:
- **ce044**:
- **circumfix**: Part-of-speech value for affixes that surround a stem, stored in the lexemes part_of_speech enum.
- **classical**: Pronunciation variant value for Classical Latin, one of the three values in the pronunciations variant enum.
- **comparable**: Test helper vocabulary: assertExactSet asserts that two value sets resolve to the same comparable string members.
- **comparative**: Degree-of-comparison value in the adjective, adverb, and forms degree enums, alongside positive and superlative.
- **concurrent**: Vitest modifier it.concurrent.each, which entity integration tests use to run database cases in parallel.
- **conjugation**: Verb class enum, first through fourth plus third-io, that sets a verb's inflectional stem and personal endings.
- **conjunction**: Part-of-speech value for conjunctions, stored in the lexemes part_of_speech enum with the other word classes.
- **conjunctional**: Adverb type value for adverbs that link clauses, paired with descriptive in the adverb type enum.
- **d067**:
- **d09**:
- **d14365**:
- **d2**:
- **d3**:
- **d36**:
- **d41189**:
- **d416578**:
- **d44**:
- **d473505**:
- **d5773**:
- **d57731**:
- **d677**:
- **da**: Piece of a hexadecimal character class in a UUID regular expression in the entities integration test, not a word.
- **dae85**:
- **dative**: Case value in the forms case enum, also allowed for gerund, supine, and preposition cases in this package.
- **dbe1**:
- **dc81283**:
- **dcce6**:
- **dd8**:
- **declension**: Noun or adjective declension enum value, first through fifth, that determines an inflection's endings.
- **degree**: Comparison degree value, comparative, positive, or superlative, stored in the forms and inflections degree enums.
- **deletable**: Name of the PostgresqlDeletableEntity base class from @codebase/persistence, which gives every entity soft-delete columns.
- **descriptive**: Adverb type value for adverbs that modify a verb or adjective, paired with conjunctional in the adverb type enum.
- **destroy**: DataSource.destroy call that closes the integration test's database connection once its cases finish running.
- **determiner**: Part-of-speech value for determiners, stored in the lexemes part_of_speech enum beside pronoun and numeral.
- **dictionary**: The src/modules/entities/dictionary folder, holding the Word, Lexeme, Form, Inflection, and Translation entity classes.
- **disambiguator**: Numeric lexeme column that, together with lemma, makes each dictionary entry unique and tells homographs apart.
- **discriminator**: Column named type that TypeORM single-table inheritance reads to pick the child class for forms and inflections.
- **down**: Method name of a TypeORM migration's down step, which reverses that migration's schema changes.
- **driver**: TypeORM Postgres driver, which the data-source and entity constants configure and whose string values they normalize.
- **e02087015**:
- **e06542**:
- **e19**:
- **e197**:
- **e22**:
- **e4**:
- **e53911**:
- **e6**:
- **e701643**:
- **e8**:
- **e89**:
- **e9**:
- **e93**:
- **eaf47**:
- **eager**: TypeORM relation option, eager true, that loads a related entity automatically; entity service tests assert it.
- **ebe1**:
- **ecclesiastical**: Pronunciation variant value for Ecclesiastical Latin, one of classical, ecclesiastical, or vulgar in the enum.
- **ed02**:
- **edc2**:
- **ee8**:
- **ee83**:
- **efbc0**:
- **efc0**:
- **etymology**: Optional lexeme column holding a word's Latin or Greek origin, as its column comment states.
- **exact**: Test vocabulary: assertExactSet and the exact set validation tests check that two sets match with no extra members.
- **expectation**: Test-helper shape describing the columns, relations, and constraints each entity must have, checked for every entity.
- **f068**:
- **f08**:
- **f1**:
- **f19**:
- **f20**:
- **f233**:
- **f29**:
- **f3**:
- **f355**:
- **f480**:
- **f58**:
- **f6**:
- **f8**:
- **f817**:
- **fa0**:
- **fa6**:
- **fabd9**:
- **fb2390**:
- **fb90**:
- **fd30**:
- **fd67**:
- **fdd34**:
- **fe95**:
- **feaf97**:
- **feca7**:
- **fef6**:
- **fem**: Fragment of the masc/fem gender value, which marks nouns whose gender depends on the referent.
- **feminine**: Gender enum value shared by forms, inflections, and nouns, one of feminine, masculine, or neuter.
- **ffc72**:
- **fifth**: Noun declension enum value for the fifth declension, stored in the inflections declension enum.
- **fk**: Prefix of TypeORM's FK_ constraint names, the foreign keys that link child rows such as tokens to their parents.
- **fourth**: Declension and conjugation enum value for the fourth class, used by noun and verb inflections.
- **fresh**: Describes a module imported in a fresh Node process, so decorator metadata and state do not leak between runs.
- **future**: Tense enum value for future forms, also one of the three non-finite tenses for infinitives, participles, and gerunds.
- **fuzzystrmatch**: Postgres extension the second migration creates to support fuzzy string matching on dictionary headwords.
- **gender**: Grammatical gender concept, the enum set of feminine, masculine, neuter, and masc/fem on forms and nouns.
- **generation**: Field generationStrategy in column expectations, one of increment, rowid, or uuid, that the entity service tests check.
- **genitive**: Case value in the forms case enum, also allowed for gerund and preposition cases in this package.
- **gerund**: GerundForm, a non-finite verb form entity in the forms hierarchy, limited to the four oblique cases.
- **gin**: Postgres GIN index type, used on translation full-text search and the lemma trigram index.
- **idiom**: Part-of-speech enum value for idioms, stored in the lexemes part_of_speech enum beside phrase and proverb.
- **idx**: Fragment of TypeORM's IDX_ prefix for index names in the migrations, not a term the package defines.
- **imperative**: Mood enum value for commands in finite verb forms, one of imperative, indicative, or subjunctive.
- **imperfect**: Tense enum value for imperfect finite verb forms, one of the six values in the forms tense enum.
- **indicative**: Mood enum value for statements in finite verb forms, one of imperative, indicative, or subjunctive.
- **infinitive**: InfinitiveForm, a non-finite verb form entity in the forms hierarchy, which the forms module exports.
- **inflection**: The Inflection entity hierarchy describing how a lexeme varies, backed by the inflections table.
- **inheritance**: Single-table inheritance, the TypeORM pattern behind the forms and inflections tables and their discriminator column.
- **inject**: NestJS injection decorators, such as InjectRepository, used to supply TypeORM repositories to services.
- **interfix**: Part-of-speech enum value for affixes inserted inside a stem, stored in the lexemes part_of_speech enum.
- **interjection**: Part-of-speech enum value for interjections, stored in the lexemes part_of_speech enum with the other word classes.
- **inverse**: Side of a bidirectional relation, such as WordForm's link back to its Form, named in entity comments.
- **jsonb**: Postgres binary JSON column type the migrations use for structured columns, such as principal_parts.
- **know**: Stem of the TypeScript unknown type, as in untyped query results; a lemmatizer artifact, not a term here.
- **lemma**: Lexeme column holding the dictionary headword, unique together with disambiguator and indexed for lookup.
- **lexeme**: The Lexeme entity, a lexical entry joined to words, which holds part of speech, etymology, and lemma.
- **literature**: The literature module: Author, Text, Line, and Token entities that tie classical texts to dictionary words.
- **locative**: Case value for locative forms, listed in the forms case enum alongside the other standard cases.
- **lock**: Fragment of lock_timeout, the Postgres setting the migrations use to bound how long they wait for locks.
- **many**: Relation cardinality label, one-to-many or many-to-many, that the entities service tests branch on.
- **marker**: Constant tag on an Inflection subclass, such as uninflected, identifying lexemes that do not vary by inflection.
- **masc**: Fragment of the masc/fem gender value, which marks nouns whose gender varies by referent.
- **masculine**: Gender enum value for masculine forms and nouns, one of feminine, masculine, or neuter.
- **migration1791164926316**:
- **migration1792000000000**:
- **mood**: Grammatical mood of a finite verb form, one of imperative, indicative, or subjunctive.
- **neuter**: Gender enum value for neuter forms and nouns, one of feminine, masculine, or neuter.
- **nominal**: NominalForm, a form entity in the forms hierarchy covering noun and adjective forms of a lexeme.
- **nominative**: Case value in the forms case enum for subject forms, the one case gerund and supine enums leave out.
- **noop**: Lodash helper used in testing/setup.ts as a silent replacement, so console.log stays quiet during tests.
- **noun**: Part-of-speech value and inflection kind for nouns, covered by NounInflection and the noun declension enum.
- **numeral**: Part-of-speech enum value for numerals, stored in the lexemes part_of_speech enum beside determiner and pronoun.
- **op**: Truncated fragment, not a term; TypeORM find operators are named in full in entity constants and tests.
- **operator**: TypeORM find operator, a wrapper such as In(...), that the bigint transformer passes through untouched when writing.
- **orm**: Fragment of the TypeORM name or of the word form, not a term the package defines in its own code.
- **orphan**: TypeORM orphanedRowAction relation option, set to delete, which removes child rows when their parent is removed.
- **participle**: ParticipleForm, a non-finite verb form entity in the forms hierarchy, with tense limited to future, perfect, present.
- **particle**: Part-of-speech enum value for particles, stored in the lexemes part_of_speech enum with the other word classes.
- **passive**: Voice enum value for passive verb forms, one of active or passive in the forms voice enum.
- **perfect**: Tense enum value for perfect verb forms, also one of the three non-finite tenses.
- **persistence**: The @codebase/persistence package, providing DatabaseModule, base entities, and the shared createDataSource helper.
- **person**: Grammatical person of a finite verb form, one of first, second, or third, stored in the forms person enum.
- **phoneme**: Stem of the phonemes column in pronunciations, which holds a phonemic segmentation such as a.moː.
- **phonemic**: Pronunciation column holding a word's phonemic transcription, stored beside phonetic and phonemes.
- **phonetic**: Pronunciation column holding a word's phonetic transcription, stored beside phonemic and phonemes.
- **phrase**: Part-of-speech enum value for multi-word phrases, stored in the lexemes part_of_speech enum with idiom and proverb.
- **pk**: Prefix of TypeORM's PK_ constraint names, the primary key constraint each table declares on its id column.
- **pluperfect**: Tense enum value for pluperfect finite verb forms, one of the six values in the forms tense enum.
- **plural**: Number enum value for plural forms, paired with singular in the forms number enum.
- **preposition**: PrepositionInflection, the inflection kind for prepositions, which governs a case through prepositionCase.
- **principal**: PrincipalPart entity, the principal parts a verb or noun is cited by, stored in the principal_parts table.
- **pronoun**: Part-of-speech enum value for pronouns, stored in the lexemes part_of_speech enum with determiner and numeral.
- **pronunciation**: Entity holding a lexeme's classical, ecclesiastical, or vulgar sound variants and transcriptions, one row per variant.
- **proper**: Fragment of the properNoun part-of-speech enum value, which marks proper nouns in the lexemes enum.
- **proverb**: Part-of-speech enum value for proverbs, stored in the lexemes part_of_speech enum beside phrase and idiom.
- **proxy**: JavaScript Proxy that createRelationProxy returns in entities unit tests, standing in for relation metadata.
- **punctuation**: Tokens table comment noting that a parsed token may be punctuation rather than a word from a literature line.
- **rel**: Prefix of TypeORM's REL constraint names, the unique key on one-to-one relation columns such as lexeme_id.
- **relation**: TypeORM relation metadata and the Relation wrapper type, used to type entity links such as WordForm.form.
- **relevant**: Test variable naming the tables this package owns, so entity assertions skip tables from other packages.
- **representative**: Fixture entity that contract tests use to check indexes and unique constraints, such as Text's slug column.
- **role**: Database login reported by current_user in the integration test, which should be the lexico_username role.
- **save**: TypeORM repository save call, which the integration tests use to write fixture rows before asserting on them.
- **side**: Entity side of a relation, such as the inverse side of WordForm.form, named in the entity class comments.
- **singular**: Number enum value for singular forms, paired with plural in the forms number enum.
- **slug**: Unique text identifier column on Text and Author rows, used as a readable key for literature entries.
- **snake**: SnakeNamingStrategy from typeorm-naming-strategies, which lexico extends so table and column names use snake_case.
- **snapshot**: TableIndexSnapshot type, a captured list of a table's indexes that the schema comparison checks read back.
- **specify**: No direct use in source; the nearest match is userSpecifiedName, a table-name override in the naming strategy.
- **speech**: Part of speech, the PartOfSpeech type and partOfSpeechEnumValues export that name a lexeme's word class.
- **stable**: Describes join-table rows that carry audit columns and a stable UUID, instead of a composite key.
- **store**: Lemmatizer fragment of STORED in the generated tsvector column, meaning its value is computed and saved.
- **subjunctive**: Mood enum value for hypothetical finite verb forms, one of imperative, indicative, or subjunctive.
- **subset**: Relation option subset type used by contract assertions, picking only the TypeORM options a test checks.
- **superlative**: Degree value for the highest comparison, one of comparative, positive, or superlative in the degree enums.
- **supine**: SupineForm, a non-finite verb form entity limited to accusative and ablative cases, expressing purpose and respect.
- **synchronize**: TypeORM synchronize option, which the data source sets to false, so schema changes come only from migrations.
- **third**: Enum value for the third person, third declension, or third conjugation, depending on which enum holds it.
- **transformer**: TypeORM column transformer, such as BIGINT_NUMBER_TRANSFORMER, that converts bigint strings to JavaScript numbers.
- **translation**: Entity for one English sense of a lexeme, held in the translations table with its full-text search column.
- **trgm**: Fragment of pg_trgm, the Postgres trigram extension the second migration creates for fuzzy lemma and word search.
- **trigram**: Postgres trigram index, created on lemma and word data for fuzzy matching in migration 1792000000000.
- **tsvector**: Postgres full-text search vector type, used by the translation_full_text_search column computed from translation data.
- **undecorated**: Test-only class name UndecoratedEntity, an entity without the table decorator, checked for a clear error.
- **uninflected**: UninflectedInflection, the inflection kind for lexemes that do not vary, a child of the inflections hierarchy.
- **unmatched**: Name in entity service code for relation targets that match no entity, collected so they can be reported.
- **uq**: Prefix of TypeORM's UQ_ constraint names, such as the unique constraint on the lemma and disambiguator pair.
- **uuid**: Column type for the id and audit columns across entities, assigned by uuidv7() on insert in the database.
- **uuidv7**: Postgres uuidv7() function, the default for every id column, so the database assigns time-ordered ids on insert.
- **variant**: Pronunciation variant column, an enum of classical, ecclesiastical, and vulgar, indexed for lookup.
- **vary**: Verb in the UninflectedInflection comment saying these lexemes do not vary by inflection.
- **verb**: Part-of-speech value and inflection kind for verbs, covered by VerbInflection and the verb conjugation enum.
- **vocative**: Case value for direct address in the forms case enum, which gerund forms exclude, as the constants note.
- **voice**: Grammatical voice of a Latin verb form, active or passive, stored in the forms voice enum.
- **vulgar**: Pronunciation variant value for Vulgar Latin, one of the three values in the pronunciations variant enum.
- **wf**: Alias for WordForm in the Word entity's OneToMany callback, mapping each word to its WordForm rows.
- **wl**: Alias for WordLexeme in the Word entity's OneToMany callback, mapping each word to its WordLexeme rows.
- **zone**: Fragment of 'time zone' in the TIMESTAMP WITH TIME ZONE column type that every audit timestamp uses.

<!-- coinagerie:end -->
