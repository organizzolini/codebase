import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates and drops the initial caelundas schema: the `calendar_events`
 * table, the `tags` tree with its `tags_closure` closure table, and the
 * `calendar_event_tags` join table between them.
 */
export class Migration1792416080531 implements MigrationInterface {
  name = "Migration1792416080531";

  /**
   * Reverts this migration by dropping the foreign keys, the indexes, and
   * the tables.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags_closure" DROP CONSTRAINT "FK_8a4bf589d19e5060d7ccbf1fd51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_closure" DROP CONSTRAINT "FK_3f3680694135907038de253a57e"`,
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
      `DROP INDEX "caelundas"."calendar_event_tags_tag_id_calendar_event_id"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_event_tags"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tags_sibling_name"`);
    await queryRunner.query(`DROP INDEX "caelundas"."tags_root_name"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
  }

  /**
   * Applies this migration by creating the tables, their indexes, and their
   * foreign keys.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "color" text, "description" text NOT NULL, "end" TIMESTAMP WITH TIME ZONE NOT NULL, "latitude" numeric(8,6) NOT NULL, "location" text, "longitude" numeric(9,6) NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "summary" text NOT NULL, "timezone" text NOT NULL, CONSTRAINT "calendar_events_natural_key" UNIQUE ("summary", "start", "latitude", "longitude"), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id")); COMMENT ON COLUMN "calendar_events"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "calendar_events"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "calendar_events"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "calendar_events"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "calendar_events"."updated_by" IS 'Identifier of the user or process that last updated the record'; COMMENT ON COLUMN "calendar_events"."color" IS 'Color hint for calendar display'; COMMENT ON COLUMN "calendar_events"."description" IS 'Detailed description with additional context'; COMMENT ON COLUMN "calendar_events"."end" IS 'When the event ends'; COMMENT ON COLUMN "calendar_events"."latitude" IS 'Observer latitude in degrees the event was computed for'; COMMENT ON COLUMN "calendar_events"."location" IS 'Human-readable location of the event'; COMMENT ON COLUMN "calendar_events"."longitude" IS 'Observer longitude in degrees the event was computed for'; COMMENT ON COLUMN "calendar_events"."start" IS 'When the event starts'; COMMENT ON COLUMN "calendar_events"."summary" IS 'Brief event title shown in calendar views'; COMMENT ON COLUMN "calendar_events"."timezone" IS 'IANA timezone of the observer location, such as America/New_York'`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "name" text NOT NULL, "parent_id" uuid, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")); COMMENT ON COLUMN "tags"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "tags"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "tags"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "tags"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "tags"."updated_by" IS 'Identifier of the user or process that last updated the record'; COMMENT ON COLUMN "tags"."name" IS 'The tag''s own label, unique among its siblings'; COMMENT ON COLUMN "tags"."parent_id" IS 'The tag this one refines, or null for the root of a dimension'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_root_name" ON "tags"  ("name") WHERE "parent_id" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_sibling_name" ON "tags"  ("parent_id", "name") WHERE "parent_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_event_tags" ("calendar_event_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_e9cd6a8835a055d90f7d2df0ed7" PRIMARY KEY ("calendar_event_id", "tag_id")); COMMENT ON COLUMN "calendar_event_tags"."calendar_event_id" IS 'The event that carries the tag'; COMMENT ON COLUMN "calendar_event_tags"."tag_id" IS 'The tag the event carries'`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tags_tag_id_calendar_event_id" ON "calendar_event_tags"  ("tag_id", "calendar_event_id") `,
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
      `ALTER TABLE "tags_closure" ADD CONSTRAINT "FK_3f3680694135907038de253a57e" FOREIGN KEY ("ancestor_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_closure" ADD CONSTRAINT "FK_8a4bf589d19e5060d7ccbf1fd51" FOREIGN KEY ("descendant_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
