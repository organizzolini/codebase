import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Sets the caelundas role's default `search_path`, so a connection that drops
 * the `options` startup parameter, as PgBouncer does, still reads the schema.
 */
export class Migration1795552477000 implements MigrationInterface {
  name = "Migration1795552477000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(
      `ALTER ROLE caelundas_username SET search_path TO caelundas`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5min'`);
    await queryRunner.query(`ALTER ROLE caelundas_username RESET search_path`);
  }
}
