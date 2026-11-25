# NestJS Tests

## Build the Class Under Test

`buildTestingModule(Target, options)` from `@codebase/testing/nestjs` compiles a testing module around one class and resolves it typed. It always provides a deep mock of observability's `LoggerService`, and a deep mock for each class in `mocks`. A dependency nothing provides fails the build, so resolving the class is the wiring check.

```ts
import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

const moduleOptions = { mocks: [PostgresqlUtilitiesService] };

describe(ExportCommand, () => {
  let command: ExportCommand;
  let utilities: DeepMocked<PostgresqlUtilitiesService>;

  beforeAll(async () => {
    const built = await buildTestingModule(ExportCommand, moduleOptions);

    command = built.instance;
    utilities = built.mock(PostgresqlUtilitiesService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dumps the schema", async () => {
    expect.hasAssertions();

    utilities.dump.mockResolvedValue(undefined);
    await command.run(["--schema", "lexico"]);

    expect(utilities.dump).toHaveBeenCalledWith(
      expect.objectContaining({ schema: "lexico" }),
    );
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ExportCommand, moduleOptions);
  });
});
```

- Declare the instance and its mocks with `let` at `describe` scope and assign them in `beforeAll`, so every test reads them typed.
- Stage a return per test (`mockResolvedValue`, `mockRejectedValue`, `mockReturnValue`) and clear mocks in `beforeEach`.
- `options.imports` brings in real modules; `options.providers` adds real classes or hand-made values.

## Repositories and Other Tokens

A token that is not a class — a TypeORM repository, an injection symbol — goes in `providers`, with a `createMock` from `@golevelup/ts-vitest` as its value. Read it back from `built.module`:

```ts
import { createMock } from "@golevelup/ts-vitest";
import { getRepositoryToken } from "@nestjs/typeorm";

const moduleOptions = {
  providers: [
    {
      provide: getRepositoryToken(Meander),
      useValue: createMock<Repository<Meander>>(),
    },
  ],
};

const built = await buildTestingModule(DatabaseService, moduleOptions);
const repository: DeepMocked<Repository<Meander>> = built.module.get(
  getRepositoryToken(Meander),
);
```

Mocks go in `providers`, never `imports`. Each NestJS project's `tsconfig.json` maps `@golevelup/ts-vitest` to its `lib/index.d.ts` under `paths`, so ESLint's project service can type the mock; a new project copies that entry from a sibling.

## Module Wiring

Assert a module's metadata with `expectModuleImports`, `expectModuleProvides`, and `expectModuleExports` rather than reading `@Module` by hand. `bootModule(MainModule)` compiles a root module with its real providers and closes it after the test, which is the test that the whole container resolves.

## Against a Database

`startDatabaseTestingModule` from `@codebase/persistence/testing` starts a migrated, throwaway Postgres and compiles a module connected to it. That is an integration test, and Docker must be running. See the [persistence README](../../../../projects/common/persistence/README.md#integration-tests).
