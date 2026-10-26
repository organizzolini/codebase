import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates and drops the initial caelundas schema: the `calendar_events`
 * table, the `tags` tree with its `tags_closure` closure table, and the
 * `calendar_event_tags` join table between them.
 *
 * TypeORM generates a SQLite migration that creates each table bare and then
 * rebuilds it to add its foreign keys. Nothing is stored yet, so this one
 * creates each table with its foreign keys in place, which leaves the schema
 * identical: `migration:generate` finds no change against it.
 */
export class Migration1793045891250 implements MigrationInterface {
  name = "Migration1793045891250";

  /** Reverts this migration by dropping the tables, which drops their indexes. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tags_closure"`);
    await queryRunner.query(`DROP TABLE "calendar_event_tags"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
  }

  /** Applies this migration by creating the tables and their indexes. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text, "color" text, "description" text NOT NULL, "end" text NOT NULL, "latitude" text NOT NULL, "location" text, "longitude" text NOT NULL, "start" text NOT NULL, "summary" text NOT NULL, "timezone" text NOT NULL, CONSTRAINT "calendar_events_natural_key" UNIQUE ("summary", "start", "end", "latitude", "longitude"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text, "name" text NOT NULL, "parent_id" varchar, CONSTRAINT "FK_bd19ddcde86ca1882599dbace11" FOREIGN KEY ("parent_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_root_name" ON "tags" ("name") WHERE "parent_id" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "tags_sibling_name" ON "tags" ("parent_id", "name") WHERE "parent_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_event_tags" ("calendar_event_id" varchar NOT NULL, "tag_id" varchar NOT NULL, CONSTRAINT "FK_146237171c57f84a0ff62036294" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_6f0520ed07726fe729a882a6928" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("calendar_event_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tags_tag_id_calendar_event_id" ON "calendar_event_tags" ("tag_id", "calendar_event_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tags_closure" ("ancestor_id" varchar NOT NULL, "descendant_id" varchar NOT NULL, CONSTRAINT "FK_3f3680694135907038de253a57e" FOREIGN KEY ("ancestor_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8a4bf589d19e5060d7ccbf1fd51" FOREIGN KEY ("descendant_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f3680694135907038de253a57" ON "tags_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a4bf589d19e5060d7ccbf1fd5" ON "tags_closure" ("descendant_id") `,
    );
  }
}
