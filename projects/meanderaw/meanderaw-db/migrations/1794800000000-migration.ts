import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates the marker that says the aggregate tables are current, so a reader
 * answers from them only while it exists.
 */
export class Migration1794800000000 implements MigrationInterface {
  name = "Migration1794800000000";

  /** Drops the marker table. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "aggregate_markers"`);
  }

  /** Creates the marker table. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "aggregate_markers" ("id" smallint NOT NULL, "meander_count" bigint NOT NULL, CONSTRAINT "PK_aggregate_markers" PRIMARY KEY ("id"))`,
    );
  }
}
