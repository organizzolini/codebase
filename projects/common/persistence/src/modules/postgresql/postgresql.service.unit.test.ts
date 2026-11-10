import { ConfigModule } from "@nestjs/config";
import { beforeAll, describe, expect, it } from "vitest";

import { overrideEnvironment } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import {
  DATABASE_OPTIONS,
  PluralSnakeNamingStrategy,
} from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";

describe(PostgresqlService, () => {
  let service: PostgresqlService;

  const moduleOptions = {
    imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    providers: [
      {
        provide: DATABASE_OPTIONS,
        useValue: { entities: [], project: "fixture" },
      },
    ],
  };

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      PostgresqlService,
      moduleOptions,
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      PostgresqlService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(PostgresqlService);
  });

  it("connects with the project's defaults while the root's unprefixed variables are set", () => {
    overrideEnvironment({ POSTGRES_DB: "postgres", POSTGRES_USER: "postgres" });

    expect(service.connection()).toStrictEqual({
      database: "fixture_development",
      host: "localhost",
      password: "fixture_password",
      port: 5432,
      schema: "fixture",
      username: "fixture_username",
    });
  });

  it("reads the project's prefixed variables through configuration", () => {
    overrideEnvironment({
      FIXTURE_POSTGRES_DATABASE: "fixture_testing",
      FIXTURE_POSTGRES_PORT: "15432",
    });

    expect(service.connection()).toMatchObject({
      database: "fixture_testing",
      port: 15_432,
    });
  });

  it("builds TypeORM's options with the plural snake-case naming strategy and no migrations", () => {
    const options = service.createTypeOrmOptions();

    expect(options.namingStrategy).toBeInstanceOf(PluralSnakeNamingStrategy);
    expect(options).toMatchObject({
      migrations: [],
      migrationsRun: false,
      synchronize: false,
    });
  });

  it("refuses to connect when its module was imported without forRoot", async () => {
    const { module } = await buildTestingModule(PostgresqlService, {
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    });

    expect(() => module.get(PostgresqlService).connection()).toThrow(
      /PostgresqlModule\.forRoot/,
    );
  });
});
