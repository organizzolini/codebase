import { ConfigModule } from "@nestjs/config";
import { DefaultNamingStrategy } from "typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { overrideEnvironment } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { DATABASE_OPTIONS } from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";

describe(PostgresqlService, () => {
  let service: PostgresqlService;
  const namingStrategy = new DefaultNamingStrategy();

  const options = {
    imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    providers: [
      {
        provide: DATABASE_OPTIONS,
        useValue: { entities: [], namingStrategy, project: "fixture" },
      },
    ],
  };

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      PostgresqlService,
      options,
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PostgresqlService, options);

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

  it("builds TypeORM's options with the naming strategy it was given and no migrations", () => {
    expect(service.createTypeOrmOptions()).toMatchObject({
      migrations: [],
      migrationsRun: false,
      namingStrategy,
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
