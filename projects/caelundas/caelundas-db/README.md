# 🌌 Caelundas Database

**The calendar's shape.** The Postgres schema for
[caelundas-cli](../caelundas-cli/README.md) and caelundas-api: the TypeORM
entities, the one migration, and the service that rebuilds the read model.

This package is the single definition of what a Caelundas event _is_. The
command line writes through these entities and the API reads through them, so
neither carries its own idea of the schema. It names no SQLite, and registers
nothing on a connection.

## Usage

```ts
import { CaelundasDatabaseModule, CalendarEvent } from "@codebase/caelundas-db";
```

`CaelundasDatabaseModule` connects to `caelundas_development`.`caelundas` as
`caelundas_username` through
[`@codebase/persistence`](../../common/persistence/README.md)'s
`DatabaseModule.forRoot`, with its shared plural snake-case naming strategy.
`caelundasDataSource`, in `src/modules/caelundas-database/data-source.constants.ts`,
is the same configuration as a standalone `DataSource`, built with the shared
`createDataSource`, which is what the migration command line runs against.
Neither synchronizes nor runs migrations on start, so only the data source and
the test harness are given `CAELUNDAS_DATABASE_MIGRATIONS`.

Both read only `CAELUNDAS_POSTGRES_*`, never the root's unprefixed
`POSTGRES_*`, which are the shared container's admin login. The importing
application's `ConfigModule` must be global, and spreads
`postgresEnvironmentSchema({ project: "caelundas" })` into its own schema.

| Variable                      | Default                 |
| ----------------------------- | ----------------------- |
| `CAELUNDAS_POSTGRES_HOST`     | `localhost`             |
| `CAELUNDAS_POSTGRES_PORT`     | `5432`                  |
| `CAELUNDAS_POSTGRES_USERNAME` | `caelundas_username`    |
| `CAELUNDAS_POSTGRES_PASSWORD` | `caelundas_password`    |
| `CAELUNDAS_POSTGRES_DATABASE` | `caelundas_development` |
| `CAELUNDAS_POSTGRES_SCHEMA`   | `caelundas`             |

## The schema

| Entity                     | Table                          | Holds                                                             |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `CalendarEvent`            | `calendar_events`              | One detected event for one observer location                      |
| `Tag`                      | `tags`, `tags_closure`         | The tag tree, a closure table TypeORM keeps in step               |
| `CalendarEventTag`         | `calendar_event_tags`          | An event carrying a tag                                           |
| `Star`                     | `stars`                        | A star of the HYG catalog, keyed by its Hipparcos number          |
| `Constellation`            | `constellations`               | One of the 88 IAU constellations                                  |
| `ConstellationLine`        | `constellation_lines`          | A segment of a constellation's figure                             |
| `TagNode`                  | `tag_nodes`                    | Derived: a tag with its depth, root, and path                     |
| `CalendarEventTagNode`     | `calendar_event_tag_nodes`     | Derived: an event and every tag it carries, ancestors too         |
| `CalendarEventDerivedTime` | `calendar_event_derived_times` | Derived view: an event's UTC and local year, day, hour, and so on |

Entities are named by class: the shared naming strategy makes the tables
plural and the columns snake case, so no entity names a table or a schema.

- **Ids are `uuidv7`s the database assigns,** through
  `@codebase/persistence`'s `PostgresqlUpdatableEntity`, for `calendar_events`
  and `tags`. The tag closure, the join table, the star catalog, and the
  derived tables keep their natural keys.
- **`calendar_events` upserts on its natural key,** `(summary, start, end,
  latitude, longitude)`, so a re-run updates the row it wrote and a second
  place adds rows of its own.
- **`start` and `end` are `timestamptz`,** carried as `Moment`s in UTC by
  `createMomentTransformer`. **Latitude and longitude are `numeric(9,6)`,**
  carried as the text the driver returns, so the key compares exactly.
- **Whole numbers are `bigint`,** read back as numbers.

## The read model

The derived times are a plain view, so there is nothing to refresh: Postgres
computes them from the event on every read, and the local day and hour,
`start_local_day` and `start_local_hour`, are `start AT TIME ZONE timezone`.

The two derived tag tables are rebuilt by
`CaelundasDatabaseService.refreshReadModel(manager)`, one insert-select
statement each, inside the caller's transaction: a command line ingest ends
with it, and a reader never sees the tables half rebuilt.

## Migrations

```bash
nx run caelundas-db:migration:generate           # Diff entities → new migration
nx run caelundas-db:migration:run                # Apply pending migrations
nx run caelundas-db:migration:revert             # Roll back the last one
nx run caelundas-db:migration:show               # List applied and pending
```

The `migration` target is the shared one from the root `nx.json` target
defaults, declared here as
`"migration": { "options": { "module": "src/modules/caelundas-database" } }`.
There is one migration, with its `-up.sql` and `-down.sql` beside it, linted
by `sqlfluff` and checked by `squawk`. It carries two hand edits after
`generate`: it creates `typeorm_metadata` for the view's row, and its SQL
files open with the lock and statement timeouts the other projects' carry.
See [ADR 0031](../../../documentation/adr/0031-move-caelundas-from-sqlite-to-postgres.md).

## Test

```bash
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # needs Docker
```

The integration suites start a throwaway Postgres 18, run the real migration,
insert base rows, refresh, and assert the derived tables and the view.

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-db`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 20 |
| Files | 22 |
| Calls traced | 1 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 2 |
| `maximumBreadth` | 1 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CaelundasDatabaseService.refreshReadModel` | 1 | `CaelundasDatabaseService.transaction(…)` | `projects/caelundas/caelundas-db/src/modules/caelundas-database/caelundas-database.service.ts:45` |
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  caelundas_api["caelundas-api"]
  caelundas_cli["caelundas-cli"]
  caelundas_db["caelundas-db"]
  configuration["configuration"]
  persistence["persistence"]
  caelundas_api --> caelundas_db
  caelundas_cli --> caelundas_db
  caelundas_db --> configuration
  caelundas_db --> persistence
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class caelundas_db subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  CaelundasDatabaseModule
  PostgresqlModule
  TypeOrmModule
  CaelundasDatabaseModule --> PostgresqlModule
  CaelundasDatabaseModule --> TypeOrmModule
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
  file_src_modules_caelundas_database_caelundas_database_constants_ts["src/modules/caelundas-database/caelundas-database.constants.ts"]
  file_src_modules_caelundas_database_caelundas_database_module_integration_test_ts["src/modules/caelundas-database/caelundas-database.module.integration.test.ts"]
  file_src_modules_caelundas_database_caelundas_database_module_ts["src/modules/caelundas-database/caelundas-database.module.ts"]
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts["src/modules/caelundas-database/caelundas-database.service.integration.test.ts"]
  file_src_modules_caelundas_database_caelundas_database_service_ts["src/modules/caelundas-database/caelundas-database.service.ts"]
  file_src_modules_caelundas_database_caelundas_database_service_unit_test_ts["src/modules/caelundas-database/caelundas-database.service.unit.test.ts"]
  file_src_modules_caelundas_database_caelundas_database_types_ts["src/modules/caelundas-database/caelundas-database.types.ts"]
  file_src_modules_caelundas_database_caelundas_database_utilities_ts["src/modules/caelundas-database/caelundas-database.utilities.ts"]
  file_src_modules_caelundas_database_caelundas_database_utilities_unit_test_ts["src/modules/caelundas-database/caelundas-database.utilities.unit.test.ts"]
  file_src_modules_caelundas_database_data_source_constants_ts["src/modules/caelundas-database/data-source.constants.ts"]
  file_src_modules_caelundas_database_entities_calendar_event_derived_time_entity_ts["src/modules/caelundas-database/entities/calendar-event-derived-time.entity.ts"]
  file_src_modules_caelundas_database_entities_calendar_event_tag_node_entity_ts["src/modules/caelundas-database/entities/calendar-event-tag-node.entity.ts"]
  file_src_modules_caelundas_database_entities_calendar_event_tag_entity_ts["src/modules/caelundas-database/entities/calendar-event-tag.entity.ts"]
  file_src_modules_caelundas_database_entities_calendar_event_entity_ts["src/modules/caelundas-database/entities/calendar-event.entity.ts"]
  file_src_modules_caelundas_database_entities_constellation_line_entity_ts["src/modules/caelundas-database/entities/constellation-line.entity.ts"]
  file_src_modules_caelundas_database_entities_constellation_entity_ts["src/modules/caelundas-database/entities/constellation.entity.ts"]
  file_src_modules_caelundas_database_entities_star_entity_ts["src/modules/caelundas-database/entities/star.entity.ts"]
  file_src_modules_caelundas_database_entities_tag_node_entity_ts["src/modules/caelundas-database/entities/tag-node.entity.ts"]
  file_src_modules_caelundas_database_entities_tag_entity_ts["src/modules/caelundas-database/entities/tag.entity.ts"]
  file_src_modules_caelundas_database_migrations_1793990506900_migration_ts["src/modules/caelundas-database/migrations/1793990506900-migration.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_modules_caelundas_database_caelundas_database_module_integration_test_ts --> file_src_modules_caelundas_database_caelundas_database_module_ts
  file_src_modules_caelundas_database_caelundas_database_module_integration_test_ts --> file_src_modules_caelundas_database_caelundas_database_service_ts
  file_src_modules_caelundas_database_caelundas_database_module_integration_test_ts --> file_src_modules_caelundas_database_data_source_constants_ts
  file_src_modules_caelundas_database_caelundas_database_module_integration_test_ts --> file_src_modules_caelundas_database_entities_calendar_event_entity_ts
  file_src_modules_caelundas_database_caelundas_database_module_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_caelundas_database_module_ts --> file_src_modules_caelundas_database_caelundas_database_service_ts
  file_src_modules_caelundas_database_caelundas_database_module_ts --> file_src_modules_caelundas_database_data_source_constants_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_caelundas_database_module_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_caelundas_database_service_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_data_source_constants_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_calendar_event_derived_time_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_calendar_event_tag_node_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_calendar_event_tag_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_calendar_event_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_tag_node_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_integration_test_ts --> file_src_modules_caelundas_database_entities_tag_entity_ts
  file_src_modules_caelundas_database_caelundas_database_service_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_caelundas_database_service_unit_test_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_caelundas_database_service_unit_test_ts --> file_src_modules_caelundas_database_caelundas_database_service_ts
  file_src_modules_caelundas_database_caelundas_database_utilities_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_caelundas_database_utilities_unit_test_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_calendar_event_derived_time_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_calendar_event_tag_node_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_calendar_event_tag_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_calendar_event_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_constellation_line_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_constellation_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_star_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_tag_node_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_entities_tag_entity_ts
  file_src_modules_caelundas_database_data_source_constants_ts --> file_src_modules_caelundas_database_migrations_1793990506900_migration_ts
  file_src_modules_caelundas_database_entities_calendar_event_tag_node_entity_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
  file_src_modules_caelundas_database_entities_calendar_event_tag_entity_ts --> file_src_modules_caelundas_database_entities_calendar_event_entity_ts
  file_src_modules_caelundas_database_entities_calendar_event_tag_entity_ts --> file_src_modules_caelundas_database_entities_tag_entity_ts
  file_src_modules_caelundas_database_entities_calendar_event_entity_ts --> file_src_modules_caelundas_database_caelundas_database_constants_ts
  file_src_modules_caelundas_database_entities_calendar_event_entity_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
  file_src_modules_caelundas_database_entities_constellation_line_entity_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
  file_src_modules_caelundas_database_entities_constellation_line_entity_ts --> file_src_modules_caelundas_database_entities_constellation_entity_ts
  file_src_modules_caelundas_database_entities_constellation_line_entity_ts --> file_src_modules_caelundas_database_entities_star_entity_ts
  file_src_modules_caelundas_database_entities_star_entity_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
  file_src_modules_caelundas_database_entities_tag_node_entity_ts --> file_src_modules_caelundas_database_caelundas_database_utilities_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-1724-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-78.78_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-6-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-29-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-29-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-0-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-96-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-62-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-4-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-10-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-12-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-68-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-12-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-55-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-25-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-38-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-97-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-24-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-91-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-255-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-167-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-42-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-13-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-107-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-85-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-38-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-149-dc2626?style=flat-square)
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

![SQL Files](https://img.shields.io/badge/SQL_Files-2-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-264-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-74-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-1-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-3-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-8-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-9-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-21-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-6-059669?style=flat-square)
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

![Module Files](https://img.shields.io/badge/Module_Files-1-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-1-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-2-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-1-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-1-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-9-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-2-ca8a04?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-61-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-4-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-0-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-11-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-2-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-8-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-2-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-2-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-27-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-db:coinagerie-check:write`.

- **ascension**:
- **breadth**:
- **cascade**:
- **constellation**:
- **coordinate**:
- **declination**:
- **degree**:
- **descendant**:
- **designation**:
- **dow**:
- **doy**:
- **epoch**:
- **hip**:
- **latitude**:
- **longitude**:
- **magnitude**:
- **mod**:
- **planet**:
- **quarter**:
- **retrograde**:
- **sibling**:
- **star**:
- **temporality**:
- **updatable**:
- **weekday**:
- **zodiac**:

<!-- coinagerie:end -->
