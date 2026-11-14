import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates the four aggregate count tables the aggregate step rebuilds: value,
 * pair, and shape counts, plus the shape totals. No foreign keys, since the
 * rebuild swaps whole tables. See ADR 0032.
 */
export class Migration1794700000000 implements MigrationInterface {
  name = "Migration1794700000000";

  /** Drops the four aggregate count tables. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shape_counts"`);
    await queryRunner.query(`DROP TABLE "characteristic_shape_counts"`);
    await queryRunner.query(`DROP TABLE "characteristic_pair_counts"`);
    await queryRunner.query(`DROP TABLE "characteristic_value_counts"`);
  }

  /** Creates the four aggregate count tables, each keyed by what it counts. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "characteristic_value_counts" ("characteristic_id" smallint NOT NULL, "meander_count" bigint NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_characteristic_value_counts" PRIMARY KEY ("characteristic_id", "value"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "characteristic_pair_counts" ("characteristic_id" smallint NOT NULL, "meander_count" bigint NOT NULL, "other_characteristic_id" smallint NOT NULL, "other_value" double precision NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_characteristic_pair_counts" PRIMARY KEY ("characteristic_id", "other_characteristic_id", "other_value", "value"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "characteristic_shape_counts" ("characteristic_id" smallint NOT NULL, "columns" bigint NOT NULL, "lattice" text NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_characteristic_shape_counts" PRIMARY KEY ("characteristic_id", "columns", "lattice", "rows", "value"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shape_counts" ("columns" bigint NOT NULL, "lattice" text NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, CONSTRAINT "PK_shape_counts" PRIMARY KEY ("columns", "lattice", "rows"))`,
    );
  }
}
