<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/common/persistence`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 128 |
| Files | 34 |
| Calls traced | 134 |
| Call stacks | 6 |
| Deepest stack | 7 |
| Stacks through recursion | 0 |
| Unfollowable calls | 19 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `PostgresqlImportCommand.run`** — depth ≥ 7 · decorated-method

```text
🚀 PostgresqlImportCommand.run(…): Promise<void> [projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:357]
   ↳ Validates the options, checks pg_restore and the dump's contents, applies any `--clean`, then restores the selected…
  └─> PostgresqlImportCommand.check(…): Promise<{ readonly contents: readonly PostgresDumpEntry[]; readonly plan: PostgresqlImportPlan; }> [projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:82]
     ↳ Every check a real import and a `--dry-run` share, none of which connects to the target: the options, the pg_restore…
    └─> PostgresqlUtilitiesService.list(file: string): Promise<PostgresDumpEntry[]> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:181]
       ↳ Reads the table of contents of the dump at `file` with `pg_restore --list`, which connects to no database, so an…
      └─> PostgresqlUtilitiesService.run(…): Promise<PostgresClientOutput> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:64]
         ↳ Runs `tool` with `args`, connected to `connection` through its environment, or to nothing when there is none, and…
        └─> PostgresqlUtilitiesService.anonymous(…): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:69]
          └─> PostgresqlUtilitiesService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:77]
            └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.constants.ts:47]
```

**2. `PostgresqlExportCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 PostgresqlExportCommand.run(…): Promise<void> [projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:241]
   ↳ Validates the options, then dumps the selected tables to the file.
  └─> PostgresqlUtilitiesService.dump({ connection, content, file, tables, }: PostgresDumpOptions): Promise<void> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:105]
     ↳ Dumps exactly `tables` from `connection` to a custom-format `file`. `--strict-names` makes a table that does not exist…
    └─> PostgresqlUtilitiesService.run(…): Promise<PostgresClientOutput> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:64]
       ↳ Runs `tool` with `args`, connected to `connection` through its environment, or to nothing when there is none, and…
      └─> PostgresqlUtilitiesService.anonymous(…): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:69]
        └─> PostgresqlUtilitiesService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:77]
          └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.constants.ts:47]
```

**3. `postgresEnvironmentSchema`** — depth 4 · orphan-root

```text
🚀 postgresEnvironmentSchema(…): PostgresEnvironmentShape<Project> [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:199]
   ↳ The zod fragment for a project's `<PROJECT>_POSTGRES_*` variables, which each application spreads into its own…
  └─> assertPostgresEnvironmentKeys(…): void [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:35]
     ↳ Holds `shape` to having a key for every one of `project`'s `<PROJECT>_POSTGRES_*` variables, which is what types {@link…
    └─> postgresEnvironmentKeys(project: string): string[] [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:175]
       ↳ The `<PROJECT>_POSTGRES_*` variable names a project reads.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:161]
         ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

<details>
<summary>3 more call stacks</summary>

**4. `PostgresqlService.createTypeOrmOptions`** — depth 4 · orphan-root

```text
🚀 PostgresqlService.createTypeOrmOptions(): PostgresDataSourceOptions [projects/common/persistence/src/modules/postgresql/postgresql.service.ts:76]
   ↳ TypeORM's options for the project's connection, with no migrations: the runtime never runs them.
  └─> PostgresqlService.connection(): PostgresConnection [projects/common/persistence/src/modules/postgresql/postgresql.service.ts:61]
     ↳ Where the project's database is, read from its prefixed variables and defaulted from its name.
    └─> postgresConnection({ environment, project, }: PostgresConnectionSource): PostgresConnection [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:86]
       ↳ The connection a project's prefixed variables describe, defaulted the way `postgresEnvironmentSchema` defaults them.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:161]
         ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

**5. `createDataSource`** — depth 3 · orphan-root

```text
🚀 createDataSource(…): DataSource [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:69]
   ↳ The `DataSource` a project's TypeORM command-line entry exports, built from the same options as…
  └─> postgresDataSourceOptions(…): PostgresDataSourceOptions [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:115]
     ↳ The TypeORM options for `connection`, shared by every runtime module and command-line data source so a generated…
    └─> postgresSearchPathOption(schema: string): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:229]
       ↳ The startup parameter pg sends as `options` on each pooled connection, setting the session's `search_path` to `schema`…
```

**6. `postgresEnvironment`** — depth 2 · orphan-root

```text
🚀 postgresEnvironment({ connection, project, }: PostgresEnvironmentSource): Record<string, string> [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:141]
   ↳ `connection` as the project's `<PROJECT>_POSTGRES_*` variables: what to stub into the environment for a…
  └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:161]
     ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PostgresqlExportCommand.plan` | 7 | `PostgresqlExportCommand.requireOption`, `PostgresqlExportCommand.selectContent`, `parsePostgresUri`, `PostgresqlExportOptionsError.constructor`, `existingFileMessage`, `maskPostgresCredentials`, `qualifyTableNames` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:94` |
| `PostgresqlImportCommand.plan` | 7 | `PostgresqlImportCommand.requireOption`, `PostgresqlImportCommand.selectContent`, `parsePostgresUri`, `PostgresqlImportOptionsError.constructor`, `missingFileMessage`, `qualifyTableNames`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:145` |
| `PostgresqlExportCommand.run` | 6 | `PostgresqlExportCommand.plan`, `PostgresqlUtilitiesService.ensureTool`, `PostgresqlExportCommand.logDryRun`, `describePostgresContent`, `PostgresqlUtilitiesService.dump`, `PostgresqlExportCommand.explain` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:241` |

<details>
<summary>48 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PostgresqlImportCommand.run` | 5 | `PostgresqlImportCommand.check`, `PostgresqlImportCommand.logDryRun`, `describePostgresContent`, `PostgresqlImportCommand.truncate`, `PostgresqlImportCommand.restore` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:357` |
| `PostgresqlService.connection` | 4 | `PostgresqlService.databaseOptions`, `postgresConnection`, `PostgresqlService.map(…)`, `postgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.service.ts:61` |
| `selectPostgresDumpEntries` | 4 | `map(…)`, `every(…)`, `filter(…)`, `every(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:85` |
| `truncatePostgresTables` | 4 | `map(…)`, `postgresErrorCode`, `map(…)`, `PostgresReferencedTablesError.constructor` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:31` |
| `PostgresqlUtilitiesService.restore` | 4 | `PostgresqlUtilitiesService.map(…)`, `selectPostgresDumpEntries`, `PostgresqlUtilitiesService.run`, `postgresContentFlags` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:200` |
| `PostgresqlUtilitiesService.truncate` | 4 | `PostgresqlUtilitiesService.truncatePostgresTables(…)`, `truncatePostgresTables`, `PostgresTruncateError.constructor`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:251` |
| `PostgresqlImportCommand.check` | 4 | `PostgresqlImportCommand.plan`, `PostgresqlUtilitiesService.ensureTool`, `PostgresqlUtilitiesService.list`, `PostgresqlImportCommand.ensureContents` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:82` |
| `PostgresqlImportCommand.restore` | 4 | `PostgresqlUtilitiesService.restore`, `PostgresqlImportRestoreError.constructor`, `truncatedMessage`, `rolledBackMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:200` |
| `PostgresqlImportCommand.truncate` | 4 | `PostgresqlUtilitiesService.truncate`, `PostgresqlImportCleanError.constructor`, `referencedTablesMessage`, `notTruncatedMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:243` |
| `postgresEnvironmentSchema` | 3 | `postgresSettingsSchema`, `postgresEnvironmentKey`, `assertPostgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:199` |
| `PostgresqlService.createTypeOrmOptions` | 3 | `postgresDataSourceOptions`, `PostgresqlService.connection`, `PostgresqlService.databaseOptions` | `projects/common/persistence/src/modules/postgresql/postgresql.service.ts:76` |
| `qualifyTableNames` | 3 | `filter(…)`, `PostgresTableNameError.constructor`, `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:136` |
| `PostgresqlUtilitiesService.dump` | 3 | `PostgresqlUtilitiesService.run`, `postgresContentFlags`, `PostgresqlUtilitiesService.map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:105` |
| `PostgresqlUtilitiesService.ensureTool` | 3 | `PostgresqlUtilitiesService.anonymous`, `PostgresClientToolError.constructor`, `parsePostgresMajorVersion` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:134` |
| `PostgresqlExportCommand.explain` | 3 | `missingDumpTables`, `PostgresqlExportTableError.constructor`, `missingTablesMessage` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:67` |
| `PostgresqlImportCommand.ensureContents` | 3 | `PostgresqlImportCommand.missing`, `PostgresqlImportContentsError.constructor`, `missingContentsMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:99` |
| `PostgresqlImportCommand.logDryRun` | 3 | `dumpedTables`, `PostgresqlImportCommand.map(…)`, `dryRunMessages` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:121` |
| `createDataSource` | 2 | `postgresDataSourceOptions`, `postgresConnection` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:69` |
| `postgresConnection` | 2 | `postgresEnvironmentKey`, `postgresSettingsSchema` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:86` |
| `parsePostgresDumpContents` | 2 | `describeEntry`, `dependencyIds` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:46` |
| `parsePostgresUri` | 2 | `PostgresUriError.constructor`, `postgresUriProblem` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:63` |
| `PostgresqlUtilitiesService.anonymous` | 2 | `PostgresqlUtilitiesService.execFile(…)`, `postgresProcessEnvironment` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:69` |
| `PostgresqlUtilitiesService.execFile(…)` | 2 | `PostgresClientError.constructor`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:77` |
| `PostgresqlUtilitiesService.list` | 2 | `PostgresqlUtilitiesService.run`, `parsePostgresDumpContents` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:181` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.constants.ts:66` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:122` |
| `PostgresqlImportCommand.missing` | 2 | `dumpedTables`, `PostgresqlImportCommand.filter(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:103` |
| `assertPostgresEnvironmentKeys` | 1 | `postgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:35` |
| `postgresDataSourceOptions` | 1 | `postgresSearchPathOption` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:115` |
| `postgresEnvironment` | 1 | `postgresEnvironmentKey` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:141` |
| `postgresEnvironmentKeys` | 1 | `postgresEnvironmentKey` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:175` |
| `dumpedTables` | 1 | `flatMap(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:21` |
| `missingDumpTables` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:36` |
| `dependencyIds` | 1 | `filter(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:112` |
| `describeEntry` | 1 | `tableEntry` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:120` |
| `quotePostgresTable` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:16` |
| `map(…)` | 1 | `quotePostgresTable` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:35` |
| `postgresProcessEnvironment` | 1 | `filter(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:106` |
| `PostgresqlUtilitiesService.run` | 1 | `PostgresqlUtilitiesService.anonymous` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:64` |
| `PostgresqlUtilitiesService.anonymous` | 1 | `PostgresqlUtilitiesService.execFile(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:139` |
| `map(…)` | 1 | `describePostgresContent` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.constants.ts:77` |
| `PostgresqlExportCommand.logDryRun` | 1 | `dryRunMessages` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:79` |
| `PostgresqlExportCommand.requireOption` | 1 | `PostgresqlExportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:131` |
| `PostgresqlExportCommand.selectContent` | 1 | `PostgresqlExportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:144` |
| `referencedTablesMessage` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:93` |
| `map(…)` | 1 | `describePostgresContent` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:137` |
| `PostgresqlImportCommand.requireOption` | 1 | `PostgresqlImportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:184` |
| `PostgresqlImportCommand.selectContent` | 1 | `PostgresqlImportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:222` |

</details>
<!-- callidescope:end -->
