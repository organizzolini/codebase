import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * A child of `widgets` for the command line's integration suites: each
 * part may reference a widget, so emptying `widgets` alone is refused, and
 * its unique label gives a restore a row to conflict on. No entity maps
 * it; only those suites run this migration.
 */
export class CreateParts1767225600001 implements MigrationInterface {
  name = "CreateParts1767225600001";

  /** Drops the table. */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fixture"."parts"`);
  }

  /** Creates the table, its unique label, and its key to `widgets`. */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fixture"."parts" ("id" uuid NOT NULL DEFAULT uuidv7(), "label" text NOT NULL, "widget_id" uuid, CONSTRAINT "UQ_parts_label" UNIQUE ("label"), CONSTRAINT "PK_parts" PRIMARY KEY ("id"), CONSTRAINT "FK_parts_widget_id" FOREIGN KEY ("widget_id") REFERENCES "fixture"."widgets"("id"))`,
    );
  }
}
