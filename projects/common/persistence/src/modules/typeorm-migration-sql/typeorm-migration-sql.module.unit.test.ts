import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";

import { TypeormMigrationSqlCommand } from "./typeorm-migration-sql.command";
import { TypeormMigrationSqlModule } from "./typeorm-migration-sql.module";

describe(TypeormMigrationSqlModule, () => {
  it("extracts migration SQL with no integration module imported", async () => {
    expect.hasAssertions();

    const moduleRef = await Test.createTestingModule({
      imports: [TypeormMigrationSqlModule],
    }).compile();
    const command = moduleRef.get(TypeormMigrationSqlCommand);

    const directory = createTemporaryDirectory("typeorm-migration-sql-module");
    const migrationFile = path.join(directory, "1791255787877-migration.ts");
    await writeFile(
      migrationFile,
      [
        "export class Migration1791255787877 {",
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("CREATE TABLE alpha (id int)");',
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("DROP TABLE alpha");',
        "  }",
        "}",
      ].join("\n"),
    );

    await command.run(["write"], {
      directory,
      migration: "1791255787877-migration.ts",
    });

    await expect(
      readFile(path.join(directory, "1791255787877-migration-up.sql"), "utf8"),
    ).resolves.toBe("CREATE TABLE alpha (id int);\n");
  });
});
