import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { DefaultNamingStrategy } from "typeorm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { CreateSprockets1767225600002 } from "../../../testing/fixtures/migrations/1767225600002-create-sprockets";

import { SQLITE_OPTIONS } from "./sqlite.constants";
import { SqliteService } from "./sqlite.service";

describe(SqliteService, () => {
  let service: SqliteService;
  const namingStrategy = new DefaultNamingStrategy();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [
        SqliteService,
        {
          provide: SQLITE_OPTIONS,
          useValue: { entities: [], namingStrategy, project: "fixture" },
        },
      ],
    }).compile();

    service = await module.resolve(SqliteService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("connects with the project's default file while the unprefixed variable is set", () => {
    vi.stubEnv("SQLITE_DATABASE", "other.sqlite");

    expect(service.connection()).toStrictEqual({ database: "fixture.sqlite" });
  });

  it("reads the project's prefixed variable through configuration", () => {
    vi.stubEnv("FIXTURE_SQLITE_DATABASE", ":memory:");

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
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [
        SqliteService,
        {
          provide: SQLITE_OPTIONS,
          useValue: {
            entities: [],
            migrations: [CreateSprockets1767225600002],
            project: "fixture",
          },
        },
      ],
    }).compile();

    expect(module.get(SqliteService).createTypeOrmOptions()).toMatchObject({
      migrations: [CreateSprockets1767225600002],
      migrationsRun: true,
      synchronize: false,
    });
  });

  it("refuses to connect when its module was imported without forRoot", async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [SqliteService],
    }).compile();

    expect(() => module.get(SqliteService).connection()).toThrow(
      /SqliteModule\.forRoot/,
    );
  });
});
