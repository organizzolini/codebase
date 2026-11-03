import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The SQLite integration suite's one migration, as `migration:generate`
 * writes it for `Sprocket`: what the suite proves the module runs on start.
 */
export class CreateSprockets1767225600002 implements MigrationInterface {
  name = "CreateSprockets1767225600002";

  /** Drops the table. */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sprockets"`);
  }

  /** Creates the table. */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sprockets" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text, "deleted_at" datetime, "deleted_by" text, "display_name" text NOT NULL, "latitude" text, "longitude" text)`,
    );
  }
}
