import type { MigrationInterface, QueryRunner } from "typeorm";

/** A migration that always fails: it reads a table that does not exist. */
export class Break1767225800000 implements MigrationInterface {
  name = "Break1767225800000";

  /** Nothing to undo. */
  async down(): Promise<void> {
    await Promise.resolve();
  }

  /** Fails. */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT * FROM "race"."missing_table"`);
  }
}
