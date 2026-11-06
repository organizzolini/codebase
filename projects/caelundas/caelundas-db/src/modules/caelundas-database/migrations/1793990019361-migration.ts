import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates and drops the caelundas schema's tables, generated from the entities
 * against an empty `caelundas_development`.
 */
export class Migration1793990019361 implements MigrationInterface {
  name = "Migration1793990019361";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "color" text, "description" text NOT NULL, "end" TIMESTAMP WITH TIME ZONE NOT NULL, "latitude" numeric(9,6) NOT NULL, "location" text, "longitude" numeric(9,6) NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "summary" text NOT NULL, "timezone" text NOT NULL, CONSTRAINT "calendar_events_natural_key" UNIQUE ("summary", "start", "end", "latitude", "longitude"), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id")); COMMENT ON COLUMN "calendar_events"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "calendar_events"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "calendar_events"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "calendar_events"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "calendar_events"."updated_by" IS 'Identifier of the user or process that last updated the record'`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_events_start_end" ON "calendar_events"  ("start", "end") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "name" text NOT NULL, "parent_id" uuid, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")); COMMENT ON COLUMN "tags"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "tags"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "tags"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "tags"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "tags"."updated_by" IS 'Identifier of the user or process that last updated the record'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_root_name" ON "tags"  ("name") WHERE "parent_id" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_sibling_name" ON "tags"  ("parent_id", "name") WHERE "parent_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_event_tags" ("calendar_event_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_e9cd6a8835a055d90f7d2df0ed7" PRIMARY KEY ("calendar_event_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tags_tag_id_calendar_event_id" ON "calendar_event_tags"  ("tag_id", "calendar_event_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "constellations" ("designation" text NOT NULL, "name" text NOT NULL, "zodiac" boolean NOT NULL, CONSTRAINT "PK_a2e3889182b012a788561333c5d" PRIMARY KEY ("designation"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stars" ("color_index" real NOT NULL, "declination_degrees" real NOT NULL, "hip" bigint NOT NULL, "magnitude" real NOT NULL, "right_ascension_hours" real NOT NULL, CONSTRAINT "PK_9a548d1a5b2d84a2f12c46427d3" PRIMARY KEY ("hip"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "constellation_lines" ("constellation_designation" text NOT NULL, "from_hip" bigint NOT NULL, "to_hip" bigint NOT NULL, CONSTRAINT "PK_8b17475143b26888ce18b2ebc51" PRIMARY KEY ("constellation_designation", "from_hip", "to_hip"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_lines_to_hip" ON "constellation_lines"  ("to_hip") `,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_lines_from_hip" ON "constellation_lines"  ("from_hip") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tags_closure" ("ancestor_id" uuid NOT NULL, "descendant_id" uuid NOT NULL, CONSTRAINT "PK_74a541ab48f1e2c9f148e9011fc" PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f3680694135907038de253a57" ON "tags_closure"  ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a4bf589d19e5060d7ccbf1fd5" ON "tags_closure"  ("descendant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "FK_bd19ddcde86ca1882599dbace11" FOREIGN KEY ("parent_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "FK_146237171c57f84a0ff62036294" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "FK_6f0520ed07726fe729a882a6928" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_cd94ca681020ea973ded017c089" FOREIGN KEY ("constellation_designation") REFERENCES "constellations"("designation") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_cf2a9cc8a473723f68be0b40b41" FOREIGN KEY ("from_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_bd51ce53daefdc59902c12e31ae" FOREIGN KEY ("to_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_closure" ADD CONSTRAINT "FK_3f3680694135907038de253a57e" FOREIGN KEY ("ancestor_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_closure" ADD CONSTRAINT "FK_8a4bf589d19e5060d7ccbf1fd51" FOREIGN KEY ("descendant_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags_closure" DROP CONSTRAINT "FK_8a4bf589d19e5060d7ccbf1fd51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_closure" DROP CONSTRAINT "FK_3f3680694135907038de253a57e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" DROP CONSTRAINT "FK_bd51ce53daefdc59902c12e31ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" DROP CONSTRAINT "FK_cf2a9cc8a473723f68be0b40b41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" DROP CONSTRAINT "FK_cd94ca681020ea973ded017c089"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_tags" DROP CONSTRAINT "FK_6f0520ed07726fe729a882a6928"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_tags" DROP CONSTRAINT "FK_146237171c57f84a0ff62036294"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "FK_bd19ddcde86ca1882599dbace11"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."IDX_8a4bf589d19e5060d7ccbf1fd5"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."IDX_3f3680694135907038de253a57"`,
    );
    await queryRunner.query(`DROP TABLE "tags_closure"`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."constellation_lines_from_hip"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."constellation_lines_to_hip"`,
    );
    await queryRunner.query(`DROP TABLE "constellation_lines"`);
    await queryRunner.query(`DROP TABLE "stars"`);
    await queryRunner.query(`DROP TABLE "constellations"`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tags_tag_id_calendar_event_id"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_event_tags"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tags_sibling_name"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tags_root_name"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_events_start_end"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_events"`);
  }
}
