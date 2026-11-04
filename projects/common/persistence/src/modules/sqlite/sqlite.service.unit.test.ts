import { ConfigModule } from "@nestjs/config";
import { DefaultNamingStrategy } from "typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { overrideEnvironment } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CreateSprockets1767225600002 } from "../../../testing/fixtures/migrations/1767225600002-create-sprockets";

import { SQLITE_OPTIONS } from "./sqlite.constants";
import { SqliteService } from "./sqlite.service";

describe(SqliteService, () => {
  let service: SqliteService;
  const namingStrategy = new DefaultNamingStrategy();

  const options = {
    imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    providers: [
      {
        provide: SQLITE_OPTIONS,
        useValue: { entities: [], namingStrategy, project: "fixture" },
      },
    ],
  };

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(SqliteService, options));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SqliteService, options);

    expect(instance).toBeInstanceOf(SqliteService);
  });

  it("connects with the project's default file while the unprefixed variable is set", () => {
    overrideEnvironment({ SQLITE_DATABASE: "other.sqlite" });

    expect(service.connection()).toStrictEqual({ database: "fixture.sqlite" });
  });

  it("reads the project's prefixed variable through configuration", () => {
    overrideEnvironment({ FIXTURE_SQLITE_DATABASE: ":memory:" });

    expect(service.connection()).toStrictEqual({ database: ":memory:" });
  });

  it("builds TypeORM's options with the naming strategy it was given and no migrations", () => {
    expect(service.createTypeOrmOptions()).toMatchObject({
      migrations: [],
      migrationsRun: false,
      namingStrategy,
      synchronize: false,
      type: "better-sqlite3",
    });
  });

  it("runs the migrations it was given on start", async () => {
    const { module } = await buildTestingModule(SqliteService, {
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [
        {
          provide: SQLITE_OPTIONS,
          useValue: {
            entities: [],
            migrations: [CreateSprockets1767225600002],
            project: "fixture",
          },
        },
      ],
    });

    expect(module.get(SqliteService).createTypeOrmOptions()).toMatchObject({
      migrations: [CreateSprockets1767225600002],
      migrationsRun: true,
      synchronize: false,
    });
  });

  it("refuses to connect when its module was imported without forRoot", async () => {
    const { module } = await buildTestingModule(SqliteService, {
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    });

    expect(() => module.get(SqliteService).connection()).toThrow(
      /SqliteModule\.forRoot/,
    );
  });
});
