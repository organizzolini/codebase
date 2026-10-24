import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds `end` to the `calendar_events` natural key, so a boundary event and
 * the span that shares its title and start are two rows, told apart by when
 * each ends.
 */
export class Migration1792854507000 implements MigrationInterface {
  name = "Migration1792854507000";

  /**
   * Reverts this migration by restoring the natural key without `end`. It
   * fails while a boundary and a span still share a title and a start.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET LOCAL lock_timeout = '10s'`);
    await queryRunner.query(`SET LOCAL statement_timeout = '5min'`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_events_key_next" ON "calendar_events" ("summary", "start", "latitude", "longitude")`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_natural_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_natural_key" UNIQUE USING INDEX "calendar_events_key_next"`,
    );
  }

  /**
   * Applies this migration by building the wider unique index, then swapping
   * it in for the natural key, in the one transaction migrations run in.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET LOCAL lock_timeout = '10s'`);
    await queryRunner.query(`SET LOCAL statement_timeout = '5min'`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "calendar_events_key_next" ON "calendar_events" ("summary", "start", "end", "latitude", "longitude")`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_natural_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_natural_key" UNIQUE USING INDEX "calendar_events_key_next"`,
    );
  }
}
