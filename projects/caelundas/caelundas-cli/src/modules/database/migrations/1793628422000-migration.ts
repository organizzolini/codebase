import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates and drops the night sky's tables: the `star` catalog keyed by
 * Hipparcos number, the `constellation` table keyed by IAU designation, and
 * the `constellation_line` segments that join two stars of a constellation's
 * figure. The `night-sky` command fills them, and caelundas-web reads them as
 * it reads the events.
 *
 * Written by hand in the lower-case form the SQL linter requires, as the
 * first migration explains.
 */
export class Migration1793628422000 implements MigrationInterface {
  name = "Migration1793628422000";

  /** Reverts this migration by dropping the segments, then the tables. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index "constellation_line_to_hip"`);
    await queryRunner.query(`drop index "constellation_line_from_hip"`);
    await queryRunner.query(`drop table "constellation_line"`);
    await queryRunner.query(`drop table "constellation"`);
    await queryRunner.query(`drop table "star"`);
  }

  /** Applies this migration by creating the tables and their indexes. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table "star" (
    "hip" integer primary key not null,
    "right_ascension_hours" real not null,
    "declination_degrees" real not null,
    "magnitude" real not null,
    "color_index" real not null
)`);
    await queryRunner.query(`create table "constellation" (
    "designation" text primary key not null,
    "name" text not null,
    "zodiac" boolean not null
)`);
    await queryRunner.query(`create table "constellation_line" (
    "constellation_designation" text not null,
    "from_hip" integer not null,
    "to_hip" integer not null,
    constraint "FK_constellation_line_constellation" foreign key ("constellation_designation") references "constellation" (
        "designation"
    ) on delete cascade on update no action,
    constraint "FK_constellation_line_from_star" foreign key ("from_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    constraint "FK_constellation_line_to_star" foreign key ("to_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    primary key ("constellation_designation", "from_hip", "to_hip")
)`);
    await queryRunner.query(
      `create index "constellation_line_from_hip" on "constellation_line" ("from_hip")`,
    );
    await queryRunner.query(
      `create index "constellation_line_to_hip" on "constellation_line" ("to_hip")`,
    );
  }
}
