import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the `icon`, `note` and `rank` columns to `tags`: the slug of the lucide
 * icon drawn beside a tag, a sentence saying what it means, and its place
 * among its siblings. The first two are nullable and the last defaults to 0,
 * so existing rows stay valid.
 */
export class Migration1795532000000 implements MigrationInterface {
  name = "Migration1795532000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(`ALTER TABLE "tags" ADD "icon" text`);
    await queryRunner.query(`ALTER TABLE "tags" ADD "note" text`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "rank" smallint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "rank"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "note"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "icon"`);
  }
}
