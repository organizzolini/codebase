import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Keys the shape count tables by rows and columns alone: the lattice they
 * were keyed by is nearly unique to each meander. They are derived data, so
 * they are made again and the marker cleared; the aggregate step refills
 * them. See ADR 0037.
 */
export class Migration1795000000000 implements MigrationInterface {
  name = "Migration1795000000000";

  /** Restores the lattice keys, empty, and clears the marker. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(`DELETE FROM "aggregate_markers"`);
    await queryRunner.query(`DROP TABLE "characteristic_shape_counts"`);
    await queryRunner.query(`DROP TABLE "shape_counts"`);
    await queryRunner.query(
      `CREATE TABLE "characteristic_shape_counts" ("characteristic_id" smallint NOT NULL, "columns" bigint NOT NULL, "lattice" text NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_characteristic_shape_counts" PRIMARY KEY ("characteristic_id", "columns", "lattice", "rows", "value"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shape_counts" ("columns" bigint NOT NULL, "lattice" text NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, CONSTRAINT "PK_shape_counts" PRIMARY KEY ("columns", "lattice", "rows"))`,
    );
  }

  /** Clears the marker and makes both tables again, keyed by rows and columns. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(`DELETE FROM "aggregate_markers"`);
    await queryRunner.query(`DROP TABLE "characteristic_shape_counts"`);
    await queryRunner.query(`DROP TABLE "shape_counts"`);
    await queryRunner.query(
      `CREATE TABLE "characteristic_shape_counts" ("characteristic_id" smallint NOT NULL, "columns" bigint NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, "value" double precision NOT NULL, CONSTRAINT "PK_characteristic_shape_counts" PRIMARY KEY ("characteristic_id", "columns", "rows", "value"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shape_counts" ("columns" bigint NOT NULL, "meander_count" bigint NOT NULL, "rows" bigint NOT NULL, CONSTRAINT "PK_shape_counts" PRIMARY KEY ("columns", "rows"))`,
    );
  }
}
