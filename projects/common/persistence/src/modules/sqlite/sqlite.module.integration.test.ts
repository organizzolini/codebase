import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { CreateSprockets1767225600002 } from "../../../testing/fixtures/migrations/1767225600002-create-sprockets";
import { Sprocket } from "../../../testing/fixtures/sprocket.entity";

import { SqliteModule } from "./sqlite.module";
import {
  createSqliteDataSource,
  sqliteEnvironmentSchema,
} from "./sqlite.utilities";

import type { TestingModule } from "@nestjs/testing";
import type { Repository } from "typeorm";

// 🧪 Tests

const UUID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/;

/**
 * Boots the real `SqliteModule.forRoot` from configuration alone, the way an
 * application does, against a database file in a temporary directory: the
 * module runs the migration it was given, then a repository round-trips rows
 * through every base column.
 */
describe(SqliteModule, () => {
  describe("with a database file", () => {
    let directory: string;
    let file: string;
    let module: TestingModule;
    let repository: Repository<Sprocket>;

    beforeAll(async () => {
      directory = fs.mkdtempSync(path.join(os.tmpdir(), "sqlite-module-"));
      file = path.join(directory, "fixture.sqlite");

      // 🎯 An unprefixed variable must be ignored; the prefixed one is read.
      vi.stubEnv("SQLITE_DATABASE", path.join(directory, "ignored.sqlite"));
      vi.stubEnv("FIXTURE_SQLITE_DATABASE", file);

      const environmentSchema = z.object(
        sqliteEnvironmentSchema({ project: "fixture" }),
      );

      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            isGlobal: true,
            validate: (config: Record<string, unknown>) =>
              environmentSchema.parse(config),
          }),
          SqliteModule.forRoot({
            entities: [Sprocket],
            migrations: [CreateSprockets1767225600002],
            project: "fixture",
          }),
          TypeOrmModule.forFeature([Sprocket]),
        ],
      }).compile();

      repository = module.get(getRepositoryToken(Sprocket));
    });

    afterAll(async () => {
      await module.close();
      fs.rmSync(directory, { force: true, recursive: true });
      vi.unstubAllEnvs();
    });

    it("opens the project's file with foreign keys on", async () => {
      const dataSource = module.get(DataSource);
      const rows = await dataSource.query<{ foreign_keys: number }[]>(
        "PRAGMA foreign_keys",
      );

      expect(dataSource.options).toMatchObject({ database: file });
      expect(fs.existsSync(file)).toBe(true);
      expect(rows).toStrictEqual([{ foreign_keys: 1 }]);
    });

    it("ran the migration, leaving nothing for synchronize to do", async () => {
      const plan = await module
        .get(DataSource)
        .driver.createSchemaBuilder()
        .log();

      expect(plan.upQueries).toStrictEqual([]);
    });

    it("generates a uuid for each row of a bulk insert and stamps its timestamps", async () => {
      const before = Date.now() - 1000;
      await repository.insert([
        {
          displayName: "first",
          latitude: "37.7749295",
          longitude: "-122.4194155",
        },
        { displayName: "second" },
      ]);

      const rows = await repository.find();
      const row = await repository.findOneByOrFail({ displayName: "first" });

      expect(rows.length).toBeGreaterThanOrEqual(2);
      expect(rows.every(({ id }) => UUID_PATTERN.test(id))).toBe(true);
      expect(new Set(rows.map(({ id }) => id)).size).toBe(rows.length);
      expect(row).toMatchObject({
        createdBy: null,
        deletedAt: null,
        displayName: "first",
        latitude: "37.7749295",
        longitude: "-122.4194155",
      });
      expect(row.createdAt).toBeInstanceOf(Date);
      expect(row.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(row.updatedAt).toBeInstanceOf(Date);
    });

    it("keeps a timestamp as UTC text SQLite's own functions can read", async () => {
      const { id } = await repository.save(
        repository.create({ displayName: "text" }),
      );
      const rows = await module
        .get(DataSource)
        .query<{ created_at: string; year: number }[]>(
          `SELECT created_at, CAST(strftime('%Y', created_at) AS INTEGER) AS year FROM sprockets WHERE id = ?`,
          [id],
        );

      expect(rows).toHaveLength(1);
      expect(rows[0]?.created_at).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d/);
      expect(rows[0]?.year).toBeGreaterThanOrEqual(2026);
    });

    it("round-trips an update and a soft delete", async () => {
      const saved = await repository.save(
        repository.create({ displayName: "before" }),
      );

      await repository.update({ id: saved.id }, { displayName: "after" });
      await repository.softDelete({ id: saved.id });

      await expect(repository.findOneBy({ id: saved.id })).resolves.toBeNull();

      const row = await repository.findOneOrFail({
        where: { id: saved.id },
        withDeleted: true,
      });

      expect(row.displayName).toBe("after");
      expect(row.deletedAt).toBeInstanceOf(Date);
    });

    it("persists to the file, where a second connection reads the same rows", async () => {
      const { id } = await repository.save(
        repository.create({ displayName: "kept" }),
      );
      const second = createSqliteDataSource(
        { entities: [Sprocket], migrations: [], project: "fixture" },
        { FIXTURE_SQLITE_DATABASE: file },
      );

      await second.initialize();

      try {
        await expect(
          second.getRepository(Sprocket).findOneBy({ id }),
        ).resolves.toMatchObject({ displayName: "kept" });
      } finally {
        await second.destroy();
      }
    });
  });

  describe("with an in-memory database", () => {
    it("connects to :memory: and refuses a table no migration created", async () => {
      vi.stubEnv("FIXTURE_SQLITE_DATABASE", ":memory:");

      const memory = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
          SqliteModule.forRoot({ entities: [Sprocket], project: "fixture" }),
          TypeOrmModule.forFeature([Sprocket]),
        ],
      }).compile();

      try {
        await expect(
          memory.get<Repository<Sprocket>>(getRepositoryToken(Sprocket)).find(),
        ).rejects.toThrow(/no such table/);
      } finally {
        await memory.close();
        vi.unstubAllEnvs();
      }
    });
  });
});
