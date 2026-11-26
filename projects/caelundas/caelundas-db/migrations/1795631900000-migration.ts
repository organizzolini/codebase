import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Drops `tag_nodes` and `calendar_event_tag_nodes`, the derived tag tables the
 * read model rebuilt on every ingest. A tag's depth, root and path now come
 * from `tags` and `tags_closure`, and the event-and-tag pairs from
 * `calendar_event_tags`: inside the `calendar_event_facts` view at refresh, and
 * at query time through joins.
 */
export class Migration1795631900000 implements MigrationInterface {
  name = "Migration1795631900000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tag_nodes_event"`,
    );
    await queryRunner.query(
      `DROP INDEX "caelundas"."calendar_event_tag_nodes_tag"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_event_tag_nodes"`);
    await queryRunner.query(`DROP TABLE "tag_nodes"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `CREATE TABLE "tag_nodes" ("depth" bigint NOT NULL, "id" uuid NOT NULL, "name" text NOT NULL, "path" text NOT NULL, "root_id" uuid NOT NULL, CONSTRAINT "PK_334a646214f797b13a1b9f5ab57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_event_tag_nodes" ("calendar_event_id" uuid NOT NULL, "is_direct" boolean NOT NULL, "tag_depth" bigint NOT NULL, "tag_id" uuid NOT NULL, "tag_name" text NOT NULL, "tag_path" text NOT NULL, "tag_root_id" uuid NOT NULL, CONSTRAINT "PK_641ddfc9822887330f05ea3f224" PRIMARY KEY ("calendar_event_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tag_nodes_tag" ON "calendar_event_tag_nodes"  ("tag_id", "calendar_event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "calendar_event_tag_nodes_event" ON "calendar_event_tag_nodes"  ("calendar_event_id", "tag_root_id", "tag_depth") `,
    );
  }
}
