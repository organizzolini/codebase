import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DATABASE_OPTIONS,
  PluralSnakeNamingStrategy,
} from "./postgresql.constants";
import { PostgresqlService } from "./postgresql.service";

describe(PostgresqlService, () => {
  let service: PostgresqlService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [
        PostgresqlService,
        {
          provide: DATABASE_OPTIONS,
          useValue: {
            entities: [],
            project: "fixture",
          },
        },
      ],
    }).compile();

    service = await module.resolve(PostgresqlService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("connects with the project's defaults while the root's unprefixed variables are set", () => {
    vi.stubEnv("POSTGRES_DB", "postgres");
    vi.stubEnv("POSTGRES_USER", "postgres");

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
    vi.stubEnv("FIXTURE_POSTGRES_DATABASE", "fixture_testing");
    vi.stubEnv("FIXTURE_POSTGRES_PORT", "15432");

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
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
      providers: [PostgresqlService],
    }).compile();

    expect(() => module.get(PostgresqlService).connection()).toThrow(
      /PostgresqlModule\.forRoot/,
    );
  });
});
