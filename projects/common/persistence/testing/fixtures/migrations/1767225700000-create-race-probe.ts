import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * A migration slow enough for two instances starting together to overlap: it
 * creates a table, which a second run would fail on, then waits.
 */
export class CreateRaceProbe1767225700000 implements MigrationInterface {
  name = "CreateRaceProbe1767225700000";

  /** Drops the table. */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "race"."race_probes"`);
  }

  /** Creates the table, then holds the migration open for a second. */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "race"."race_probes" ("id" integer)`);
    await queryRunner.query(`SELECT pg_sleep(1)`);
  }
}
