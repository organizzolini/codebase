import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates and drops the initial caelundas schema: the `calendar_events`
 * table, the `tags` tree with its `tags_closure` closure table, and the
 * `calendar_event_tags` join table between them.
 *
 * TypeORM generates a SQLite migration that creates each table bare and then
 * rebuilds it to add its foreign keys. Nothing is stored yet, so this one
 * creates each table with its foreign keys in place. Its queries are in the
 * lower-case form the SQL linter requires, which TypeORM's SQLite loader does
 * not recognize as foreign keys, so `migration:generate` would propose
 * rebuilding every table: write the next migration by hand, in that form.
 */
export class Migration1793045891250 implements MigrationInterface {
  name = "Migration1793045891250";

  /** Reverts this migration by dropping the tables, which drops their indexes. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop table "tags_closure"
`);
    await queryRunner.query(`
drop table "calendar_event_tags"
`);
    await queryRunner.query(`
drop table "tags"
`);
    await queryRunner.query(`
drop table "calendar_events"
`);
  }

  /** Applies this migration by creating the tables and their indexes. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
create table "calendar_events" (
    "id" varchar primary key not null,
    "created_at" datetime not null default (datetime('now')),
    "created_by" text,
    "updated_at" datetime not null default (datetime('now')),
    "updated_by" text,
    "color" text,
    "description" text not null,
    "end" text not null,
    "latitude" text not null,
    "location" text,
    "longitude" text not null,
    "start" text not null,
    "summary" text not null,
    "timezone" text not null,
    constraint "calendar_events_natural_key" unique ("summary", "start", "end", "latitude", "longitude")
)
`);
    await queryRunner.query(`
create table "tags" (
    "id" varchar primary key not null,
    "created_at" datetime not null default (datetime('now')),
    "created_by" text,
    "updated_at" datetime not null default (datetime('now')),
    "updated_by" text,
    "name" text not null,
    "parent_id" varchar,
    constraint "FK_bd19ddcde86ca1882599dbace11" foreign key ("parent_id") references "tags" (
        "id"
    ) on delete cascade on update no action
)
`);
    await queryRunner.query(`
create unique index "tags_root_name" on "tags" ("name")
where "parent_id" is NULL
`);
    await queryRunner.query(`
create unique index "tags_sibling_name" on "tags" ("parent_id", "name")
where "parent_id" is not NULL
`);
    await queryRunner.query(`
create table "calendar_event_tags" (
    "calendar_event_id" varchar not null,
    "tag_id" varchar not null,
    constraint "FK_146237171c57f84a0ff62036294" foreign key ("calendar_event_id") references "calendar_events" (
        "id"
    ) on delete cascade on update no action,
    constraint "FK_6f0520ed07726fe729a882a6928" foreign key ("tag_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    primary key ("calendar_event_id", "tag_id")
)
`);
    await queryRunner.query(`
create index "calendar_event_tags_tag_id_calendar_event_id" on "calendar_event_tags" ("tag_id", "calendar_event_id")
`);
    await queryRunner.query(`
create table "tags_closure" (
    "ancestor_id" varchar not null,
    "descendant_id" varchar not null,
    constraint "FK_3f3680694135907038de253a57e" foreign key ("ancestor_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    constraint "FK_8a4bf589d19e5060d7ccbf1fd51" foreign key ("descendant_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    primary key ("ancestor_id", "descendant_id")
)
`);
    await queryRunner.query(`
create index "IDX_3f3680694135907038de253a57" on "tags_closure" ("ancestor_id")
`);
    await queryRunner.query(`
create index "IDX_8a4bf589d19e5060d7ccbf1fd5" on "tags_closure" ("descendant_id")
`);
  }
}
