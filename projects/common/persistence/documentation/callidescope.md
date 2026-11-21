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
🚀 PostgresqlImportCommand.run(…): Promise<void> [projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:336]
   ↳ Checks the dump, applies any `--clean`, then restores the tables in one transaction. `--dry-run` stops before any…
  └─> PostgresqlImportCommand.check(…): Promise<{ readonly contents: readonly PostgresDumpEntry[]; readonly plan: PostgresqlImportPlan; }> [projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:79]
     ↳ Runs the checks that a real import and `--dry-run` share, none connecting to the target.
    └─> PostgresqlUtilitiesService.list(file: string): Promise<PostgresDumpEntry[]> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:168]
       ↳ Reads the dump's table of contents with `pg_restore --list`, which connects to no database.
      └─> PostgresqlUtilitiesService.run(…): Promise<PostgresClientOutput> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:62]
         ↳ Runs `tool` with its connection in the environment, resolving its output once it exits zero.
        └─> PostgresqlUtilitiesService.anonymous(…): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:67]
          └─> PostgresqlUtilitiesService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:75]
            └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.constants.ts:44]
```

**2. `PostgresqlExportCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 PostgresqlExportCommand.run(…): Promise<void> [projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:232]
   ↳ Validates the options, then dumps the selected tables to `--file`, which a failed dump leaves untouched. `--dry-run`…
  └─> PostgresqlUtilitiesService.dump({ connection, content, file, tables, }: PostgresDumpOptions): Promise<void> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:100]
     ↳ Dumps exactly `tables` to a custom-format `file`; `--strict-names` makes a missing table an error.
    └─> PostgresqlUtilitiesService.run(…): Promise<PostgresClientOutput> [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:62]
       ↳ Runs `tool` with its connection in the environment, resolving its output once it exits zero.
      └─> PostgresqlUtilitiesService.anonymous(…): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:67]
        └─> PostgresqlUtilitiesService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:75]
          └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.constants.ts:44]
```

**3. `postgresEnvironmentSchema`** — depth 4 · orphan-root

```text
🚀 postgresEnvironmentSchema(…): PostgresEnvironmentShape<Project> [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:164]
   ↳ The zod fragment for a project's `<PROJECT>_POSTGRES_*` variables, which each application spreads into its own…
  └─> assertPostgresEnvironmentKeys(…): void [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:32]
     ↳ Throws, naming each missing variable, unless `shape` has a key for every `<PROJECT>_POSTGRES_*` variable.
    └─> postgresEnvironmentKeys(project: string): string[] [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:150]
       ↳ The `<PROJECT>_POSTGRES_*` variable names a project reads.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:136]
         ↳ The variable a project reads `field` from, such as `LEXICO_POSTGRES_DATABASE`.
```

<details>
<summary>3 more call stacks</summary>

**4. `PostgresqlService.createTypeOrmOptions`** — depth 4 · orphan-root

```text
🚀 PostgresqlService.createTypeOrmOptions(): PostgresDataSourceOptions [projects/common/persistence/src/modules/postgresql/postgresql.service.ts:75]
   ↳ TypeORM's options for the project's connection, with no migrations: the runtime never runs them.
  └─> PostgresqlService.connection(): PostgresConnection [projects/common/persistence/src/modules/postgresql/postgresql.service.ts:60]
     ↳ Where the project's database is, read from its prefixed variables and defaulted from its name.
    └─> postgresConnection({ environment, project, }: PostgresConnectionSource): PostgresConnection [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:73]
       ↳ The connection a project's prefixed variables describe, defaulted the way `postgresEnvironmentSchema` defaults them.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:136]
         ↳ The variable a project reads `field` from, such as `LEXICO_POSTGRES_DATABASE`.
```

**5. `createDataSource`** — depth 3 · orphan-root

```text
🚀 createDataSource(…): DataSource [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:56]
   ↳ The `DataSource` a project's TypeORM command-line entry exports, built from the same options as…
  └─> postgresDataSourceOptions(…): PostgresDataSourceOptions [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:91]
     ↳ The TypeORM options for `connection`, shared by runtime and command-line data sources.
    └─> postgresSearchPathOption(schema: string): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:183]
       ↳ The startup parameter setting the session's `search_path` to `schema` alone. `public` is left off, so unqualified DDL…
```

**6. `postgresEnvironment`** — depth 2 · orphan-root

```text
🚀 postgresEnvironment({ connection, project, }: PostgresEnvironmentSource): Record<string, string> [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:117]
   ↳ `connection` as the project's `<PROJECT>_POSTGRES_*` variables: what to stub into the environment for a…
  └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:136]
     ↳ The variable a project reads `field` from, such as `LEXICO_POSTGRES_DATABASE`.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PostgresqlExportCommand.plan` | 7 | `PostgresqlExportCommand.requireOption`, `PostgresqlExportCommand.selectContent`, `parsePostgresUri`, `PostgresqlExportOptionsError.constructor`, `existingFileMessage`, `maskPostgresCredentials`, `qualifyTableNames` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:89` |
| `PostgresqlImportCommand.plan` | 7 | `PostgresqlImportCommand.requireOption`, `PostgresqlImportCommand.selectContent`, `parsePostgresUri`, `PostgresqlImportOptionsError.constructor`, `missingFileMessage`, `qualifyTableNames`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:135` |
| `PostgresqlExportCommand.run` | 6 | `PostgresqlExportCommand.plan`, `PostgresqlUtilitiesService.ensureTool`, `PostgresqlExportCommand.logDryRun`, `describePostgresContent`, `PostgresqlUtilitiesService.dump`, `PostgresqlExportCommand.explain` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:232` |

<details>
<summary>48 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PostgresqlImportCommand.run` | 5 | `PostgresqlImportCommand.check`, `PostgresqlImportCommand.logDryRun`, `describePostgresContent`, `PostgresqlImportCommand.truncate`, `PostgresqlImportCommand.restore` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:336` |
| `PostgresqlService.connection` | 4 | `PostgresqlService.databaseOptions`, `postgresConnection`, `PostgresqlService.map(…)`, `postgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.service.ts:60` |
| `selectPostgresDumpEntries` | 4 | `map(…)`, `every(…)`, `filter(…)`, `every(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:79` |
| `truncatePostgresTables` | 4 | `map(…)`, `postgresErrorCode`, `map(…)`, `PostgresReferencedTablesError.constructor` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:28` |
| `PostgresqlUtilitiesService.restore` | 4 | `PostgresqlUtilitiesService.map(…)`, `selectPostgresDumpEntries`, `PostgresqlUtilitiesService.run`, `postgresContentFlags` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:182` |
| `PostgresqlUtilitiesService.truncate` | 4 | `PostgresqlUtilitiesService.truncatePostgresTables(…)`, `truncatePostgresTables`, `PostgresTruncateError.constructor`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:228` |
| `PostgresqlImportCommand.check` | 4 | `PostgresqlImportCommand.plan`, `PostgresqlUtilitiesService.ensureTool`, `PostgresqlUtilitiesService.list`, `PostgresqlImportCommand.ensureContents` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:79` |
| `PostgresqlImportCommand.restore` | 4 | `PostgresqlUtilitiesService.restore`, `PostgresqlImportRestoreError.constructor`, `truncatedMessage`, `rolledBackMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:185` |
| `PostgresqlImportCommand.truncate` | 4 | `PostgresqlUtilitiesService.truncate`, `PostgresqlImportCleanError.constructor`, `referencedTablesMessage`, `notTruncatedMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:225` |
| `postgresEnvironmentSchema` | 3 | `postgresSettingsSchema`, `postgresEnvironmentKey`, `assertPostgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:164` |
| `PostgresqlService.createTypeOrmOptions` | 3 | `postgresDataSourceOptions`, `PostgresqlService.connection`, `PostgresqlService.databaseOptions` | `projects/common/persistence/src/modules/postgresql/postgresql.service.ts:75` |
| `qualifyTableNames` | 3 | `filter(…)`, `PostgresTableNameError.constructor`, `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:122` |
| `PostgresqlUtilitiesService.dump` | 3 | `PostgresqlUtilitiesService.run`, `postgresContentFlags`, `PostgresqlUtilitiesService.map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:100` |
| `PostgresqlUtilitiesService.ensureTool` | 3 | `PostgresqlUtilitiesService.anonymous`, `PostgresClientToolError.constructor`, `parsePostgresMajorVersion` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:124` |
| `PostgresqlExportCommand.explain` | 3 | `missingDumpTables`, `PostgresqlExportTableError.constructor`, `missingTablesMessage` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:67` |
| `PostgresqlImportCommand.ensureContents` | 3 | `PostgresqlImportCommand.missing`, `PostgresqlImportContentsError.constructor`, `missingContentsMessage` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:94` |
| `PostgresqlImportCommand.logDryRun` | 3 | `dumpedTables`, `PostgresqlImportCommand.map(…)`, `dryRunMessages` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:116` |
| `createDataSource` | 2 | `postgresDataSourceOptions`, `postgresConnection` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:56` |
| `postgresConnection` | 2 | `postgresEnvironmentKey`, `postgresSettingsSchema` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:73` |
| `parsePostgresDumpContents` | 2 | `describeEntry`, `dependencyIds` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:46` |
| `parsePostgresUri` | 2 | `PostgresUriError.constructor`, `postgresUriProblem` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:58` |
| `PostgresqlUtilitiesService.anonymous` | 2 | `PostgresqlUtilitiesService.execFile(…)`, `postgresProcessEnvironment` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:67` |
| `PostgresqlUtilitiesService.execFile(…)` | 2 | `PostgresClientError.constructor`, `maskPostgresCredentials` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:75` |
| `PostgresqlUtilitiesService.list` | 2 | `PostgresqlUtilitiesService.run`, `parsePostgresDumpContents` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:168` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.constants.ts:54` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:103` |
| `PostgresqlImportCommand.missing` | 2 | `dumpedTables`, `PostgresqlImportCommand.filter(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:98` |
| `assertPostgresEnvironmentKeys` | 1 | `postgresEnvironmentKeys` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:32` |
| `postgresDataSourceOptions` | 1 | `postgresSearchPathOption` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:91` |
| `postgresEnvironment` | 1 | `postgresEnvironmentKey` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:117` |
| `postgresEnvironmentKeys` | 1 | `postgresEnvironmentKey` | `projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts:150` |
| `dumpedTables` | 1 | `flatMap(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:21` |
| `missingDumpTables` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:36` |
| `dependencyIds` | 1 | `filter(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:106` |
| `describeEntry` | 1 | `tableEntry` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-dump.utilities.ts:114` |
| `quotePostgresTable` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:16` |
| `map(…)` | 1 | `quotePostgresTable` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-truncate.utilities.ts:32` |
| `postgresProcessEnvironment` | 1 | `filter(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.utilities.ts:96` |
| `PostgresqlUtilitiesService.run` | 1 | `PostgresqlUtilitiesService.anonymous` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:62` |
| `PostgresqlUtilitiesService.anonymous` | 1 | `PostgresqlUtilitiesService.execFile(…)` | `projects/common/persistence/src/modules/postgresql-utilities/postgresql-utilities.service.ts:129` |
| `map(…)` | 1 | `describePostgresContent` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.constants.ts:65` |
| `PostgresqlExportCommand.logDryRun` | 1 | `dryRunMessages` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:79` |
| `PostgresqlExportCommand.requireOption` | 1 | `PostgresqlExportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:124` |
| `PostgresqlExportCommand.selectContent` | 1 | `PostgresqlExportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-export/postgresql-export.command.ts:137` |
| `referencedTablesMessage` | 1 | `map(…)` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:84` |
| `map(…)` | 1 | `describePostgresContent` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.constants.ts:118` |
| `PostgresqlImportCommand.requireOption` | 1 | `PostgresqlImportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:172` |
| `PostgresqlImportCommand.selectContent` | 1 | `PostgresqlImportOptionsError.constructor` | `projects/common/persistence/src/modules/postgresql-import/postgresql-import.command.ts:207` |

</details>
<!-- callidescope:end -->
